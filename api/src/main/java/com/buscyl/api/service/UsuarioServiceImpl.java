package com.buscyl.api.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.dto.UsuariosResponse;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.exception.PaginaNoValidaException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UsuariosResponse getUsuarios(int pagina, String nombreApellidos, boolean activo) {
        long totalUsuarios = usuarioRepository.obtenerTotalUsuarios(nombreApellidos, activo);
        int totalPaginas = (int) Math.ceil(totalUsuarios / 20.0);

        if((pagina > totalPaginas || pagina < 1) && totalUsuarios > 0) throw new PaginaNoValidaException("Página no válida");

        List<UsuarioResponse> usuarios = usuarioRepository.obtenerUsuarios(pagina, nombreApellidos, activo)
                .stream()
                .map(Mapper::toDto)
                .toList();

        Integer paginaPrevia = (pagina - 1) > 0 ? (pagina - 1) : null;
        Integer paginaSiguiente = (pagina + 1) < totalPaginas ? (pagina + 1) : null;

        return UsuariosResponse.builder()
                .totalUsuarios(totalUsuarios)
                .totalPaginas(totalPaginas)
                .paginaPrevia(paginaPrevia)
                .pagina(pagina)
                .paginaSiguiente(paginaSiguiente)
                .usuarios(usuarios)
                .build();
    }

}
