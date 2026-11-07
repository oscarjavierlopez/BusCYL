package com.buscyl.api.service;

import com.buscyl.api.dto.UsuarioCreateRequest;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.dto.UsuarioUpdateRequest;
import com.buscyl.api.dto.UsuariosResponse;

public interface UsuarioService {
    UsuariosResponse obtenerUsuarios(int pagina, String nombreApellidos, boolean activo);

    UsuarioResponse obtenerUsuario(Long id);

    UsuarioResponse crearUsuario(UsuarioCreateRequest request);

    UsuarioResponse actualizarUsuario(Long id, UsuarioUpdateRequest request);

    void desactivarUsuario(Long id);

    void activarUsuario(Long id);
}
