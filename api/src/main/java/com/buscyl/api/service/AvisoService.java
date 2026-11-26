package com.buscyl.api.service;

import com.buscyl.api.entity.Aviso;
import com.buscyl.api.entity.Usuario;

public interface AvisoService {
    Aviso crearAviso(Usuario usuario, String motivo);
}
