package com.buscyl.api.Auth;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.buscyl.api.Jwt.JwtService;
import com.buscyl.api.entity.Rol;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.repository.RolRepository;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class AuthServiceImpl implements AuthService {

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private RolRepository rolRepository;

        @Autowired
        private JwtService jwtService;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private AuthenticationManager authenticationManager;

        @Override
        public AuthResponse login(LoginRequest request) {
                authenticationManager
                                .authenticate(new UsernamePasswordAuthenticationToken(request.email(),
                                                request.contrasena()));
                UserDetails usuario = usuarioRepository.findByEmail(request.email()).orElseThrow();
                Usuario usuarioRegistrado = usuarioRepository.findByEmail(request.email())
                                .orElseThrow(() -> new IllegalStateException("No existe el usuario"));
                String token = jwtService.getToken(
                                usuarioRegistrado,
                                usuarioRegistrado.getId(),
                                usuarioRegistrado.getRol().getAuthority());
                return new AuthResponse(
                                token,
                                usuarioRegistrado.getId(),
                                usuarioRegistrado.getEmail(),
                                usuarioRegistrado.getNombre(),
                                usuarioRegistrado.getApellidos(),
                                usuarioRegistrado.getRol().getNombre());
        }

        @Override
        public AuthResponse register(RegisterRequest request) {

                Rol rolPasajero = rolRepository.findByNombre("pasajero")
                                .orElseThrow(() -> new IllegalStateException("No existe el rol"));

                Usuario usuario = Usuario.builder()
                                .email(request.email())
                                .dni(request.dni())
                                .nombre(request.nombre())
                                .apellidos(request.apellidos())
                                .telefono(request.telefono())
                                .fechaNacimiento(request.fechaNacimiento())
                                .contrasena(passwordEncoder.encode(request.contrasena()))
                                .activo(true)
                                .fechaRegistro(LocalDate.now())
                                .rol(rolPasajero)
                                .build();

                Usuario nuevoUsuario = usuarioRepository.save(usuario);

                return new AuthResponse(
                                jwtService.getToken(
                                                usuario,
                                                usuario.getId(),
                                                usuario.getRol().getAuthority()),
                                nuevoUsuario.getId(),
                                nuevoUsuario.getEmail(),
                                nuevoUsuario.getNombre(),
                                nuevoUsuario.getApellidos(),
                                nuevoUsuario.getRol().getNombre());
        }

}
