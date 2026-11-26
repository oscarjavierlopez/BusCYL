package com.buscyl.api.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.buscyl.api.Jwt.JwtPrincipal;
import com.buscyl.api.dto.ReservaRequest;
import com.buscyl.api.dto.ReservaResponse;
import com.buscyl.api.entity.Asiento;
import com.buscyl.api.entity.Aviso;
import com.buscyl.api.entity.Parada;
import com.buscyl.api.entity.Reserva;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.entity.Viaje;
import com.buscyl.api.exception.NoValidException;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.ReservaConflictException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.AsientoRepository;
import com.buscyl.api.repository.ReservaRepository;
import com.buscyl.api.repository.UsuarioRepository;
import com.buscyl.api.repository.ViajeRepository;

@Service
public class ReservaServiceImpl implements ReservaService {

        @Autowired
        private ReservaRepository reservaRepository;

        @Autowired
        private AsientoRepository asientoRepository;

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private UsuarioService usuarioService;

        @Autowired
        private ViajeRepository viajeRepository;

        @Autowired
        private EmailService emailService;

        @Autowired
        private AvisoService avisoService;

        @Override
        public ReservaResponse crearReserva(ReservaRequest request) {
                LocalDateTime limiteReserva = LocalDateTime.now(
                                ZoneId.of("Europe/Madrid")).plusMinutes(30);

                JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

                Long idUsuario = principal.userId();
                Usuario usuario = usuarioRepository.findById(idUsuario)
                                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

                Viaje viaje = viajeRepository.findById(request.idViaje())
                                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

                Parada paradaOrigen = viaje.getParadas()
                                .stream()
                                .filter(p -> Objects.equals(p.getId(), request.idParadaOrigen()))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Parada de origen no válida"));

                Parada paradaDestino = viaje.getParadas()
                                .stream()
                                .filter(p -> Objects.equals(p.getId(), request.idParadaDestino()))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Parada destino no válida"));

                if (paradaOrigen.getLocalidad().getId() == paradaDestino.getLocalidad().getId()) {
                        throw new NoValidException("La localidad de origen no puede ser la localidad destino");
                }

                LocalDateTime fechaHoraSalida = LocalDateTime.of(
                                viaje.getFechaViaje(),
                                paradaOrigen.getHoraSalida());
                if (!fechaHoraSalida.isAfter(limiteReserva)) {
                        throw new NoValidException(
                                        "La reserva debe realizarse al menos 30 minutos antes de la salida del viaje");
                }

                Asiento asiento = viaje.getAutobus().getAsientos()
                                .stream()
                                .filter(a -> Objects.equals(a.getId(), request.idAsiento()))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Asiento no válido"));
                if (!asiento.getActivo()) {
                        throw new ReservaConflictException("El asiento escogido está averiado");
                }

                List<Asiento> asientosReservados = asientoRepository.obtenerAsientosReservadosViaje(viaje.getId(),
                                paradaOrigen.getOrden(), paradaDestino.getOrden());
                if (asientosReservados.contains(asiento)) {
                        throw new ReservaConflictException("El asiento escogido ya está reservado");
                }

                Long numReservasSolapadas = reservaRepository.obtenerNumReservasSolapadas(idUsuario,
                                viaje.getFechaViaje(),
                                paradaDestino.getHoraLlegada(), paradaOrigen.getHoraSalida());
                if (numReservasSolapadas > 0) {
                        throw new ReservaConflictException(
                                        "El usuario ya tiene una reserva en el horario de este viaje");
                }

                Reserva nuevaReserva = Reserva.builder()
                                .pasajero(usuario)
                                .viaje(viaje)
                                .asiento(asiento)
                                .paradaOrigen(paradaOrigen)
                                .paradaDestino(paradaDestino)
                                .estado("confirmada")
                                .fechaReserva(LocalDate.now())
                                .codigoQr("")
                                .build();

                return Mapper.toDto(reservaRepository.save(nuevaReserva));
        }

        @Override
        public void cancelarReserva(Long id) {
                JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getPrincipal();

                Long idUsuario = principal.userId();
                Usuario usuario = usuarioRepository.findById(idUsuario)
                                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

                Reserva reserva = usuario.getReservas().stream()
                                .filter(r -> Objects.equals(r.getId(), id))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Reserva no válida"));

                LocalDateTime ahora = LocalDateTime.now(ZoneId.of("Europe/Madrid"));
                LocalDateTime limiteCancelacion = ahora.plusMinutes(30);
                LocalDateTime fechaHoraSalida = LocalDateTime.of(
                                reserva.getViaje().getFechaViaje(),
                                reserva.getParadaOrigen().getHoraSalida());

                if (ahora.isAfter(fechaHoraSalida)) {
                        throw new NoValidException("No se puede cancelar un viaje pasado");
                }

                if (fechaHoraSalida.isAfter(ahora) && fechaHoraSalida.isBefore(limiteCancelacion)) {
                        String motivo = "Cancelación tardía";
                        String cuerpo = "Ha realizado una cancelación con menos de 30 minutos de antelación a la salida de su viaje. Este comportamiento supone un uso indebido de BusCyL. Le recordamos que debe cancelar sus reservas con la antelación suficiente.";
                        Aviso aviso = avisoService.crearAviso(usuario, motivo);
                        usuario.addAviso(aviso);
                        emailService.enviarEmail(usuario.getEmail(), motivo, cuerpo);

                        int numAvisosUsuario = usuario.getAvisos().size();
                        if (numAvisosUsuario >= 3) {
                                usuarioService.desactivarUsuario(idUsuario);
                        }
                }

                reserva.setEstado("cancelada");
                reserva.setFechaCancelacion(LocalDate.now());
                reservaRepository.save(reserva);
        }

}
