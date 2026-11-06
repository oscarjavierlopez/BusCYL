package com.buscyl.api.service;

import com.buscyl.api.dto.UsuariosResponse;

public interface UsuarioService {
    UsuariosResponse getUsuarios(int pagina, String nombreApellidos, boolean activo);
}
