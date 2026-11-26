package com.buscyl.api.mapper;

import java.util.Comparator;
import java.util.List;

import com.buscyl.api.dto.AsientoResponse;
import com.buscyl.api.dto.AutobusResponse;
import com.buscyl.api.dto.ConductorResponse;
import com.buscyl.api.dto.EmpresaResponse;
import com.buscyl.api.dto.LocalidadResponse;
import com.buscyl.api.dto.ParadaResponse;
import com.buscyl.api.dto.ReservaResponse;
import com.buscyl.api.dto.RolResponse;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.entity.Asiento;
import com.buscyl.api.entity.Autobus;
import com.buscyl.api.entity.Empresa;
import com.buscyl.api.entity.Localidad;
import com.buscyl.api.entity.Parada;
import com.buscyl.api.entity.Reserva;
import com.buscyl.api.entity.Rol;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.entity.Viaje;
import com.buscyl.api.repository.ViajeRepository;

public class Mapper {
        public static RolResponse toDTO(Rol rol) {
                return new RolResponse(rol.getId(),
                                rol.getNombre());
        }

        public static UsuarioResponse toDto(Usuario usuario) {
                return UsuarioResponse.builder()
                                .id(usuario.getId())
                                .email(usuario.getEmail())
                                .rol(usuario.getRol().getNombre())
                                .nombre(usuario.getNombre())
                                .apellidos(usuario.getApellidos())
                                .dni(usuario.getDni())
                                .telefono(usuario.getTelefono())
                                .fechaNacimiento(usuario.getFechaNacimiento())
                                .empresa(usuario.getEmpresa() != null ? usuario.getEmpresa().getNombre() : null)
                                .activo(usuario.getActivo())
                                .build();
        }

        public static EmpresaResponse toDto(Empresa empresa) {
                return EmpresaResponse.builder()
                                .id(empresa.getId())
                                .nombre(empresa.getNombre())
                                .razonSocial(empresa.getRazonSocial())
                                .cif(empresa.getCif())
                                .telefono(empresa.getTelefono())
                                .email(empresa.getEmail())
                                .direccion(empresa.getDireccion())
                                .localidad(empresa.getLocalidad().getNombre())
                                .provincia(empresa.getLocalidad().getProvincia().getNombre())
                                .activo(empresa.getActivo())
                                .build();
        }

        public static LocalidadResponse toDto(Localidad localidad) {
                return LocalidadResponse.builder()
                                .id(localidad.getId())
                                .nombre(localidad.getNombre())
                                .provincia(localidad.getProvincia().getNombre())
                                .build();
        }

        public static AsientoResponse toDto(Asiento asiento, Boolean reservado) {
                return AsientoResponse.builder()
                                .id(asiento.getId())
                                .numero(asiento.getNumero())
                                .tipo(asiento.getTipo())
                                .activo(asiento.getActivo())
                                .reservado(reservado)
                                .build();
        }

    public static AutobusResponse toDto(Autobus autobus, boolean incluirAsientos, Long numeroAsientos,
            Long numeroAsientosAdaptados, Long numeroAsientosAveriados) {
        List<AsientoResponse> asientos = incluirAsientos
                ? autobus.getAsientos()
                .stream()
                .sorted(Comparator.comparingInt(Asiento::getNumero))
                .map(a -> toDto(a, null))
                .toList()
                : null;

        return AutobusResponse.builder()
                .id(autobus.getId())
                .matricula(autobus.getMatricula())
                .numeroBastidor(autobus.getNumeroBastidor())
                .numeroFlota(autobus.getNumeroFlota())
                .activo(autobus.getActivo())
                .numeroAsientos(numeroAsientos)
                .numeroAsientosAdaptados(numeroAsientosAdaptados)
                .numeroAsientosAveriados(numeroAsientosAveriados)
                .asientos(asientos)
                .build();
    }

        public static ConductorResponse toConductorDto(Usuario conductor) {
                return ConductorResponse.builder()
                                .id(conductor.getId())
                                .email(conductor.getEmail())
                                .nombre(conductor.getNombre())
                                .apellidos(conductor.getApellidos())
                                .empresa(conductor.getEmpresa().getNombre())
                                .build();
        }

        public static ParadaResponse toDto(Parada parada) {
                return ParadaResponse.builder()
                                .id(parada.getId())
                                .localidad(parada.getLocalidad().getNombre())
                                .horaSalida(parada.getHoraSalida())
                                .horaLlegada(parada.getHoraLlegada())
                                .direccion(parada.getDireccion())
                                .orden(parada.getOrden())
                                .build();
        }

        public static ViajeResponse toDto(Viaje viaje, boolean incluirAsientos, Integer asiento) {
                return ViajeResponse.builder()
                                .id(viaje.getId())
                                .origen(viaje.getOrigen().getNombre())
                                .destino(viaje.getDestino().getNombre())
                                .autobus(toDto(viaje.getAutobus(), incluirAsientos, null, null, null))
                                .conductor(toConductorDto(viaje.getConductor()))
                                .empresa(viaje.getConductor().getEmpresa().getNombre())
                                .fecha(viaje.getFechaViaje())
                                .horaSalida(viaje.getHoraSalida())
                                .horaLLegada(viaje.getHoraLlegada())
                                .paradas(viaje.getParadas()
                                                .stream()
                                                .sorted(Comparator.comparingInt(Parada::getOrden))
                                                .map(p -> toDto(p))
                                                .toList())
                                .activo(viaje.getActivo())
                                .asiento(asiento)
                                .build();
        }

        public static ReservaResponse toDto(Reserva reserva){
                return ReservaResponse.builder()
                .id(reserva.getId())
                .pasajero(reserva.getPasajero().getEmail())
                .viaje(reserva.getViaje().getId())
                .origen(reserva.getParadaOrigen().getLocalidad().getNombre())
                .destino(reserva.getParadaDestino().getLocalidad().getNombre())
                .estado(reserva.getEstado())
                .fechaReserva(reserva.getFechaReserva())
                .token(reserva.getToken())
                .build();
        }
}
