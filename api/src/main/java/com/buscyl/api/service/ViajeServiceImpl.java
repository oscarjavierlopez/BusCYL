package com.buscyl.api.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.buscyl.api.Jwt.JwtPrincipal;
import com.buscyl.api.dto.ParadaRequest;
import com.buscyl.api.dto.ViajeCreateRequest;
import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.dto.ViajeUpdateRequest;
import com.buscyl.api.dto.ViajesResponse;
import com.buscyl.api.entity.Autobus;
import com.buscyl.api.entity.Localidad;
import com.buscyl.api.entity.Parada;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.entity.Viaje;
import com.buscyl.api.exception.NoPerteneceEmpresaException;
import com.buscyl.api.exception.NoValidException;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.PaginaNoValidaException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.AutobusRepository;
import com.buscyl.api.repository.LocalidadRepository;
import com.buscyl.api.repository.ParadaRepository;
import com.buscyl.api.repository.UsuarioRepository;
import com.buscyl.api.repository.ViajeRepository;

import jakarta.transaction.Transactional;

@Service
public class ViajeServiceImpl implements ViajeService {

    @Autowired
    private ViajeRepository viajeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LocalidadRepository localidadRepository;

    @Autowired
    private ParadaRepository paradaRepository;

    @Autowired
    private AutobusRepository autobusRepository;

    @Override
    public ViajesResponse obtenerViajesCoordinador(int pagina, Long idOrigen, Long idDestino, LocalDate fecha) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        long totalViajesFiltrados = viajeRepository.obtenerTotalViajesFiltradosCoordinador(idEmpresa, idOrigen,
                idDestino, fecha);

        int totalPaginas = (int) Math.ceil(totalViajesFiltrados / 10.0);
        totalPaginas = totalPaginas > 0 ? totalPaginas : 1;

        if ((pagina > totalPaginas || pagina < 1))
            throw new PaginaNoValidaException("Página no válida");

        List<ViajeResponse> viajes = viajeRepository
                .obtenerViajesPaginadosCoordinador(totalPaginas, idEmpresa, idOrigen, idDestino, fecha)
                .stream()
                .map(v -> Mapper.toDto(v, false))
                .toList();

        Integer paginaPrevia = (pagina - 1) > 0 ? (pagina - 1) : null;
        Integer paginaSiguiente = (pagina + 1) <= totalPaginas ? (pagina + 1) : null;

        return ViajesResponse.builder()
                .totalViajes(totalViajesFiltrados)
                .totalPaginas(totalPaginas)
                .paginaPrevia(paginaPrevia)
                .pagina(pagina)
                .paginaSiguiente(paginaSiguiente)
                .viajes(viajes)
                .build();

    }

    @Override
    public ViajeResponse obtenerViajeCoordinador(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Viaje viaje = viajeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Viaje no encontrado"));
        ;

        if (viaje.getAutobus().getEmpresa().getId() != idEmpresa
                || viaje.getConductor().getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El viaje no pertenece a la empresa del usuario");
        }

        return Mapper.toDto(viaje, false);
    }

    @Override
    @Transactional
    public List<ViajeResponse> crearViaje(ViajeCreateRequest request) {
        // Validaciones
        if (request.idOrigen() == request.idDestino()) {
            throw new NoValidException("El origen no puede ser el mismo que el destino");
        }

        Localidad origen = localidadRepository.findById(request.idOrigen())
                .orElseThrow(() -> new NotFoundException("Localidad de origen no válida"));
        ;

        Localidad destino = localidadRepository.findById(request.idDestino())
                .orElseThrow(() -> new NotFoundException("Localidad de destino no válida"));
        ;

        Autobus autobus = autobusRepository.findById(request.idAutobus())
                .orElseThrow(() -> new NotFoundException("Autobus no válido"));

        Usuario conductor = usuarioRepository.findById(request.idConductor())
                .orElseThrow(() -> new NotFoundException("Conductor no válido"));

        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        if (autobus.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del coordinador");
        }

        if (conductor.getEmpresa() == null || conductor.getEmpresa().getId() != idEmpresa
                || !conductor.getRol().getNombre().toLowerCase().equals("conductor")) {
            throw new NoValidException("Conductor no válido");
        }

        if (!request.horaLlegada().isAfter(request.horaSalida())) {
            throw new NoValidException("La hora de llegada debe ser más tardía que la fecha de salida");
        }

        ParadaRequest primeraParada = request.paradas()
                .stream()
                .sorted((a, b) -> Integer.compare(a.orden(), b.orden()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Parada no encontrada"));
        ;
        if (primeraParada.idLocalidad() != request.idOrigen()) {
            throw new NoValidException("La primera parada no coincide con el lugar de origen");
        }

        ParadaRequest ultimaParada = request.paradas()
                .stream()
                .sorted((a, b) -> Integer.compare(b.orden(), a.orden()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Parada no encontrada"));

        if (ultimaParada.idLocalidad() != request.idDestino()) {
            throw new NoValidException("La última parada no coincide con el lugar de destino");
        }

        Set<ParadaRequest> paradasSinDuplicados = new HashSet<>(request.paradas());
        if (paradasSinDuplicados.size() != request.paradas().size()) {
            throw new NoValidException("El viaje contiene paradas duplicadas");
        }

        for (ParadaRequest parada : request.paradas()) {
            Localidad localidad = localidadRepository.findById(parada.idLocalidad())
                    .orElseThrow(() -> new NotFoundException("Localidad de parada no válida"));

            if (parada.orden() < 1) {
                throw new NoValidException("El orden de las paradas no puede ser menor que 1");
            }

            if (!Objects.equals(parada, ultimaParada)) {
                if (parada.horaSalida() == null) {
                    throw new NoValidException(
                            "La parada número " + parada.orden() + " no tiene horaSalida");
                }

                if (parada.horaSalida().isBefore(parada.horaLlegada())) {
                    throw new NoValidException(
                            "La hora de salida de una parada debe ser más tardía que la hora de llegada");
                }

                if (request.horaLlegada().isBefore(parada.horaSalida())) {
                    throw new NoValidException("El horario de la parada número " + parada.orden()
                            + " no se encuentra dentro del horario del trayecto");
                }
            } else {
                if (parada.horaLlegada().isAfter(request.horaLlegada())) {
                    throw new NoValidException("El horario de la parada número " + parada.orden()
                            + " no se encuentra dentro del horario del trayecto");
                }
            }

            if (parada.horaLlegada().isBefore(request.horaSalida())) {
                throw new NoValidException("El horario de la parada número " + parada.orden()
                        + " no se encuentra dentro del horario del trayecto");
            }

            if (parada.orden() > 1) {
                ParadaRequest paradaAnterior = request.paradas()
                        .stream()
                        .filter(p -> p.orden() == (parada.orden() - 1))
                        .findFirst()
                        .orElseThrow(() -> new NotFoundException("Parada no encontrada"));
                if (!parada.horaLlegada().isAfter(paradaAnterior.horaSalida())) {
                    throw new NoValidException("La hora de llegada de la parada número " + parada.orden()
                            + " debe ser posterior a la hora de salida de la parada anterior");
                }
            }

            int paradasConMismoOrden = request.paradas()
                    .stream()
                    .filter(p -> p.orden() == parada.orden())
                    .toList()
                    .size();
            if (paradasConMismoOrden > 1) {
                throw new NoValidException("No puede haber dos paradas con el mismo orden");
            }
        }

        // Transacción de inserción de viaje
        List<Viaje> viajesCreados = new ArrayList<>();
        for (LocalDate fecha : request.fechas()) {
            Viaje nuevoViaje = Viaje.builder()
                    .origen(origen)
                    .destino(destino)
                    .autobus(autobus)
                    .conductor(conductor)
                    .fechaViaje(fecha)
                    .horaSalida(request.horaSalida())
                    .horaLlegada(request.horaLlegada())
                    .activo(true)
                    .build();
            viajeRepository.save(nuevoViaje);

            List<Parada> paradas = new ArrayList<>();
            for (ParadaRequest parada : request.paradas()) {
                Localidad localidad = localidadRepository.findById(parada.idLocalidad())
                        .orElseThrow(() -> new NotFoundException("Localidad de parada no válida"));

                Parada nuevaParada = Parada.builder()
                        .viaje(nuevoViaje)
                        .localidad(localidad)
                        .horaLlegada(parada.horaLlegada())
                        .horaSalida(parada.horaSalida())
                        .direccion(parada.direccion())
                        .orden(parada.orden())
                        .build();
                paradaRepository.save(nuevaParada);
                paradas.add(nuevaParada);
            }

            nuevoViaje.setParadas(paradas);
            viajesCreados.add(nuevoViaje);
        }

        return viajesCreados.stream()
                .map(v -> Mapper.toDto(v, false))
                .toList();

    }

    @Override
    public void desactivarViaje(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Viaje viaje = viajeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Viaje no encontrado"));

        if (viaje.getAutobus().getEmpresa().getId() != idEmpresa
                || viaje.getConductor().getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El viaje no pertenece a la empresa del usuario");
        }

        viaje.setActivo(false);
        viajeRepository.save(viaje);
    }

    @Override
    public void activarViaje(Long id) {
        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Viaje viaje = viajeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Viaje no encontrado"));

        if (viaje.getAutobus().getEmpresa().getId() != idEmpresa
                || viaje.getConductor().getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El viaje no pertenece a la empresa del usuario");
        }

        viaje.setActivo(true);
        viajeRepository.save(viaje);
    }

    @Override
    @Transactional
    public ViajeResponse actualizarViaje(Long id, ViajeUpdateRequest request) {
        // Validaciones

        if (request.idOrigen() == request.idDestino()) {
            throw new NoValidException("El origen no puede ser el mismo que el destino");
        }

        Localidad origen = localidadRepository.findById(request.idOrigen())
                .orElseThrow(() -> new NotFoundException("Localidad de origen no válida"));
        ;

        Localidad destino = localidadRepository.findById(request.idDestino())
                .orElseThrow(() -> new NotFoundException("Localidad de destino no válida"));
        ;

        Autobus autobus = autobusRepository.findById(request.idAutobus())
                .orElseThrow(() -> new NotFoundException("Autobus no válido"));

        Usuario conductor = usuarioRepository.findById(request.idConductor())
                .orElseThrow(() -> new NotFoundException("Conductor no válido"));

        JwtPrincipal principal = (JwtPrincipal) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Long idUsuario = principal.userId();
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Long idEmpresa = usuario.getEmpresa().getId();

        Viaje viaje = viajeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Viaje no encontrado"));

        if (viaje.getAutobus().getEmpresa().getId() != idEmpresa
                || viaje.getConductor().getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El viaje no pertenece a la empresa del usuario");
        }

        if (autobus.getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El autobus no pertenece a la empresa del coordinador");
        }

        if (conductor.getEmpresa() == null || conductor.getEmpresa().getId() != idEmpresa
                || !conductor.getRol().getNombre().toLowerCase().equals("conductor")) {
            throw new NoValidException("Conductor no válido");
        }

        if (!request.horaLlegada().isAfter(request.horaSalida())) {
            throw new NoValidException("La hora de llegada debe ser más tardía que la fecha de salida");
        }

        ParadaRequest primeraParada = request.paradas()
                .stream()
                .sorted((a, b) -> Integer.compare(a.orden(), b.orden()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Parada no encontrada"));
        ;
        if (primeraParada.idLocalidad() != request.idOrigen()) {
            throw new NoValidException("La primera parada no coincide con el lugar de origen");
        }

        ParadaRequest ultimaParada = request.paradas()
                .stream()
                .sorted((a, b) -> Integer.compare(b.orden(), a.orden()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Parada no encontrada"));

        if (ultimaParada.idLocalidad() != request.idDestino()) {
            throw new NoValidException("La última parada no coincide con el lugar de destino");
        }

        Set<ParadaRequest> paradasSinDuplicados = new HashSet<>(request.paradas());
        if (paradasSinDuplicados.size() != request.paradas().size()) {
            throw new NoValidException("El viaje contiene paradas duplicadas");
        }

        for (ParadaRequest parada : request.paradas()) {
            Localidad localidad = localidadRepository.findById(parada.idLocalidad())
                    .orElseThrow(() -> new NotFoundException("Localidad de parada no válida"));

            if (parada.orden() < 1) {
                throw new NoValidException("El orden de las paradas no puede ser menor que 1");
            }

            if (!Objects.equals(parada, ultimaParada)) {
                if (parada.horaSalida() == null) {
                    throw new NoValidException(
                            "La parada número " + parada.orden() + " no tiene horaSalida");
                }
                
                if (parada.horaSalida().isBefore(parada.horaLlegada())) {
                    throw new NoValidException(
                            "La hora de salida de una parada debe ser más tardía que la hora de llegada");
                }

                if (request.horaLlegada().isBefore(parada.horaSalida())) {
                    throw new NoValidException("El horario de la parada número " + parada.orden()
                            + " no se encuentra dentro del horario del trayecto");
                }
            } else {
                if (parada.horaLlegada().isAfter(request.horaLlegada())) {
                    throw new NoValidException("El horario de la parada número " + parada.orden()
                            + " no se encuentra dentro del horario del trayecto");
                }
            }

            if (parada.horaLlegada().isBefore(request.horaSalida())) {
                throw new NoValidException("El horario de la parada número " + parada.orden()
                        + " no se encuentra dentro del horario del trayecto");
            }

            if (parada.orden() > 1) {
                ParadaRequest paradaAnterior = request.paradas()
                        .stream()
                        .filter(p -> p.orden() == (parada.orden() - 1))
                        .findFirst()
                        .orElseThrow(() -> new NotFoundException("Parada no encontrada"));
                if (!parada.horaLlegada().isAfter(paradaAnterior.horaSalida())) {
                    throw new NoValidException("La hora de llegada de la parada número " + parada.orden()
                            + " debe ser posterior a la hora de salida de la parada anterior");
                }
            }

            int paradasConMismoOrden = request.paradas()
                    .stream()
                    .filter(p -> p.orden() == parada.orden())
                    .toList()
                    .size();
            if (paradasConMismoOrden > 1) {
                throw new NoValidException("No puede haber dos paradas con el mismo orden");
            }
        } // Edición del Viaje
        viaje.setOrigen(origen);
        viaje.setDestino(destino);
        viaje.setAutobus(autobus);
        viaje.setConductor(conductor);
        viaje.setFechaViaje(request.fecha());
        viaje.setHoraLlegada(request.horaLlegada());
        viaje.setHoraSalida(request.horaSalida());

        for (ParadaRequest p : request.paradas()) {
            Optional<Parada> parada = viaje.getParadas()
                    .stream()
                    .filter(pa -> pa.getOrden() == p.orden())
                    .findFirst();

            Localidad localidad = localidadRepository.findById(p.idLocalidad())
                    .orElseThrow(() -> new NotFoundException("Localidad de parada no válida"));

            if (parada.isPresent()) {
                Parada paradaEditar = parada.get();
                int indiceParada = viaje.getIndiceParada(p.orden());
                paradaEditar.setLocalidad(localidad);
                paradaEditar.setHoraLlegada(p.horaLlegada());
                paradaEditar.setHoraSalida(p.horaSalida());
                paradaEditar.setDireccion(p.direccion());
                paradaRepository.save(paradaEditar);
                viaje.setParada(indiceParada, paradaEditar);
            } else {
                Parada nuevaParada = Parada.builder()
                        .viaje(viaje)
                        .localidad(localidad)
                        .horaLlegada(p.horaLlegada())
                        .horaSalida(p.horaSalida())
                        .direccion(p.direccion())
                        .orden(p.orden())
                        .build();
                paradaRepository.save(nuevaParada);
                viaje.addParada(nuevaParada);
            }
        }

        return Mapper.toDto(viaje, false);
    }

}
