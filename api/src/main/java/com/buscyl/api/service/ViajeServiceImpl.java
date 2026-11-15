package com.buscyl.api.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.buscyl.api.Jwt.JwtPrincipal;
import com.buscyl.api.dto.ViajeResponse;
import com.buscyl.api.dto.ViajesResponse;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.entity.Viaje;
import com.buscyl.api.exception.NoPerteneceEmpresaException;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.PaginaNoValidaException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.UsuarioRepository;
import com.buscyl.api.repository.ViajeRepository;

@Service
public class ViajeServiceImpl implements ViajeService {

    @Autowired
    private ViajeRepository viajeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

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

        if (viaje.getAutobus().getEmpresa().getId() != idEmpresa) {
            throw new NoPerteneceEmpresaException("El viaje no pertenece a la empresa del usuario");
        }

        return Mapper.toDto(viaje, false);
    }

}
