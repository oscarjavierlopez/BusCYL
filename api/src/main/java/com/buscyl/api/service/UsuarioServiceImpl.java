package com.buscyl.api.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.buscyl.api.dto.UsuarioCreateRequest;
import com.buscyl.api.dto.UsuarioResponse;
import com.buscyl.api.dto.UsuarioUpdateRequest;
import com.buscyl.api.dto.UsuariosResponse;
import com.buscyl.api.entity.Empresa;
import com.buscyl.api.entity.Rol;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.PaginaNoValidaException;
import com.buscyl.api.mapper.Mapper;
import com.buscyl.api.repository.EmpresaRepository;
import com.buscyl.api.repository.RolRepository;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public UsuariosResponse obtenerUsuarios(int pagina, String nombreApellidos, boolean activo) {
        long totalUsuarios = usuarioRepository.obtenerTotalUsuarios();
        long totalUsuariosFiltrados = usuarioRepository.obtenerUsuariosFiltrados(nombreApellidos, activo);
        int totalPaginas = (int) Math.ceil(totalUsuariosFiltrados / 20.0);
        totalPaginas = totalPaginas > 0 ? totalPaginas : 1;

        if ((pagina > totalPaginas || pagina < 1))
            throw new PaginaNoValidaException("Página no válida");

        List<UsuarioResponse> usuarios = usuarioRepository.obtenerUsuarios(pagina, nombreApellidos, activo)
                .stream()
                .map(Mapper::toDto)
                .toList();

        Integer paginaPrevia = (pagina - 1) > 0 ? (pagina - 1) : null;
        Integer paginaSiguiente = (pagina + 1) <= totalPaginas ? (pagina + 1) : null;

        return UsuariosResponse.builder()
                .totalUsuarios(totalUsuarios)
                .totalPaginas(totalPaginas)
                .paginaPrevia(paginaPrevia)
                .pagina(pagina)
                .paginaSiguiente(paginaSiguiente)
                .usuarios(usuarios)
                .build();
    }

    @Override
    public UsuarioResponse obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        return Mapper.toDto(usuario);
    }

    @Override
    public UsuarioResponse crearUsuario(UsuarioCreateRequest request) {
        Rol rol = rolRepository.findById(request.rol())
                .orElseThrow(() -> new NotFoundException("Rol no válido"));

        Empresa empresa = null;

        if (request.empresa() != null) {
            empresa = empresaRepository.findById(request.empresa())
                    .orElseThrow(() -> new NotFoundException("Empresa no válida"));
        }

        Usuario nuevoUsuario = Usuario.builder()
                .email(request.email())
                .rol(rol)
                .nombre(request.nombre())
                .apellidos(request.apellidos())
                .dni(request.dni())
                .telefono(request.telefono())
                .contrasena(null)
                .fechaNacimiento(request.fechaNacimiento())
                .fechaRegistro(LocalDate.now())
                .empresa(empresa)
                .activo(true)
                .build();

        return Mapper.toDto(usuarioRepository.save(nuevoUsuario));
    }

    @Override
    public UsuarioResponse actualizarUsuario(Long id, UsuarioUpdateRequest request) {
        Usuario usuarioActualizar = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (request.email() != null) {
            usuarioActualizar.setEmail(request.email());
        }

        if (request.rol() != null) {
            Rol rol = rolRepository.findById(request.rol())
                    .orElseThrow(() -> new NotFoundException("Rol no válido"));
            usuarioActualizar.setRol(rol);
        }

        if (request.nombre() != null) {
            usuarioActualizar.setNombre(request.nombre());
        }

        if (request.apellidos() != null) {
            usuarioActualizar.setApellidos(request.apellidos());
        }

        if (request.dni() != null) {
            usuarioActualizar.setDni(request.dni());
        }

        if (request.telefono() != null) {
            usuarioActualizar.setTelefono(request.telefono());
        }

        if (request.fechaNacimiento() != null) {
            usuarioActualizar.setFechaNacimiento(request.fechaNacimiento());
        }

        if (request.empresa() != null) {
            Empresa empresa = empresaRepository.findById(request.empresa())
                    .orElseThrow(() -> new NotFoundException("Empresa no válida"));
            usuarioActualizar.setEmpresa(empresa);
        }

        return Mapper.toDto(usuarioRepository.save(usuarioActualizar));
    }

    @Override
    public void desactivarUsuario(Long id) {
        Usuario usuarioDesactivar = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        usuarioDesactivar.setActivo(false);
        usuarioRepository.save(usuarioDesactivar);

        String destinatario = usuarioDesactivar.getEmail();
        String asunto = "Desactivación de usuario";
        String cuerpo = "Estimado " + usuarioDesactivar.getNombre() + " " + usuarioDesactivar.getApellidos() + ":\n\n"
                + "Le informamos de que su usuario ha sido desactivado.";
        emailService.enviarEmail(destinatario, asunto, cuerpo);
    }

    @Override
    public void activarUsuario(Long id) {
        Usuario usuarioActivar = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        usuarioActivar.setActivo(true);
        usuarioRepository.save(usuarioActivar);

        String destinatario = usuarioActivar.getEmail();
        String asunto = "Activación de usuario";
        String cuerpo = "Estimado " + usuarioActivar.getNombre() + " " + usuarioActivar.getApellidos() + ":\n\n"
                + "Le informamos de que su usuario ha sido activado.";
        emailService.enviarEmail(destinatario, asunto, cuerpo);
    }

}
