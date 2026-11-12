package com.buscyl.api.Auth;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.buscyl.api.Jwt.JwtService;
import com.buscyl.api.entity.Invitacion;
import com.buscyl.api.entity.Rol;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.PasswordMatchException;
import com.buscyl.api.repository.InvitacionRepository;
import com.buscyl.api.repository.RolRepository;
import com.buscyl.api.repository.UsuarioRepository;
import com.buscyl.api.service.EmailService;
import com.buscyl.api.service.InvitacionService;

@Service
public class AuthServiceImpl implements AuthService {

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private RolRepository rolRepository;

        @Autowired
        private InvitacionRepository invitacionRepository;

        @Autowired
        private InvitacionService invitacionService;

        @Autowired
        private JwtService jwtService;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private EmailService emailService;

        @Value("${buscyl.jwt.expiration-seconds}")
        private Long expiration;

        @Override
        public AuthResponse login(LoginRequest request) {
                authenticationManager
                                .authenticate(new UsernamePasswordAuthenticationToken(request.email(),
                                                request.contrasena()));
                UserDetails usuario = usuarioRepository.findByEmail(request.email())
                                .orElseThrow(() -> new NotFoundException("Usuario no válido"));
                Usuario usuarioRegistrado = usuarioRepository.findByEmailAndActivo(request.email(), true)
                                .orElseThrow(() -> new NotFoundException("Usuario no válido"));
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
                                usuarioRegistrado.getRol().getNombre(),
                                Instant.now().toEpochMilli() + (expiration * 1000L));
        }

        @Override
        public AuthResponse register(RegisterRequest request) {

                Rol rolPasajero = rolRepository.findByNombre("pasajero")
                                .orElseThrow(() -> new NotFoundException("No existe el rol"));

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

                String destinatario = usuario.getEmail();
                String asunto = "¡Bienvenido a Buscyl! Tu próximo viaje comienza aquí";
                String mensaje = "Estimado " + usuario.getNombre()+ " " + usuario.getApellidos() + "\n\n"
                                + "Nos alegra tenerte aquí.\n\n"
                                + "Descubre una forma más fácil, rápida y cómoda de desplazarte por Castilla y León.\n\n"
                                + "Explora las opciones disponibles, planifica tus desplazamientos "
                                + "y aprovecha al máximo cada trayecto.\n\n"
                                + "¡Tu próximo viaje comienza aquí!\n\n"
                                + "¡Gracias por confiar en Buscyl!";

                emailService.enviarEmail(destinatario,asunto, mensaje);

                return new AuthResponse(
                                jwtService.getToken(
                                                usuario,
                                                usuario.getId(),
                                                usuario.getRol().getAuthority()),
                                nuevoUsuario.getId(),
                                nuevoUsuario.getEmail(),
                                nuevoUsuario.getNombre(),
                                nuevoUsuario.getApellidos(),
                                nuevoUsuario.getRol().getNombre(),
                                Instant.now().toEpochMilli() + (expiration * 1000L));
        }

        @Override
        public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {

                return invitacionService.enviarInvitacion(request);

        }

        @Override
        public void resetPassword(ResetPasswordRequest request) {
                Invitacion invitacion = invitacionRepository.obtenerInvitacion(request.token())
                                .orElseThrow(() -> new NotFoundException("Invitación no válida"));

                Usuario usuario = invitacion.getUsuario();

                boolean passwordMatch = passwordEncoder.matches(request.contrasena(), usuario.getContrasena());
                if (passwordMatch)
                        throw new PasswordMatchException("La contraseña actual no puede ser igual que la anterior");

                usuario.setContrasena(passwordEncoder.encode(request.contrasena()));
                usuarioRepository.save(usuario);

                invitacion.setFechaUso(LocalDateTime.now());
                invitacionRepository.save(invitacion);
        }

}
