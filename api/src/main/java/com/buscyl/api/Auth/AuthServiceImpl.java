package com.buscyl.api.Auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cglib.core.Local;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
import com.buscyl.api.exception.TokenAlreadyCreateException;
import com.buscyl.api.repository.InvitacionRepository;
import com.buscyl.api.repository.RolRepository;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class AuthServiceImpl implements AuthService {

        @Autowired
        private UsuarioRepository usuarioRepository;

        @Autowired
        private RolRepository rolRepository;

        @Autowired
        private InvitacionRepository invitacionRepository;

        @Autowired
        private JwtService jwtService;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private JavaMailSender mailSender;

        @Value("${buscyl.mail.from}")
        private String mailFrom;

        @Value("${buscyl.frontend.reset-password-url}")
        private String resetPasswordUrl;

        @Value("${buscyl.jwt.expiration-seconds}")
        private Long expiration;

        @Override
        public AuthResponse login(LoginRequest request) {
                authenticationManager
                                .authenticate(new UsernamePasswordAuthenticationToken(request.email(),
                                                request.contrasena()));
                UserDetails usuario = usuarioRepository.findByEmail(request.email()).orElseThrow(() -> new NotFoundException("Usuario no válido"));
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
                Usuario usuario = usuarioRepository.findByEmailAndActivo(request.email(), true)
                                .orElseThrow(() -> new NotFoundException("Usuario no válido"));

                boolean existsToken = !invitacionRepository.obtenerTokenUsuario(request.email()).isEmpty();
                if (existsToken)
                        throw new TokenAlreadyCreateException("El usuario ya tiene un token activo");

                String token = generarTokenInvitacion();

                Invitacion invitacion = Invitacion.builder()
                                .usuario(usuario)
                                .fechaCreacion(LocalDateTime.now())
                                .token(token)
                                .fechaExpiracion(LocalDateTime.now().plusDays(1))
                                .build();
                invitacionRepository.save(invitacion);

                enviarInvitacion(request.email(), token);

                return new ForgotPasswordResponse(token);

        }

        private String generarTokenInvitacion() {
                byte[] bytes = new byte[32];
                new SecureRandom().nextBytes(bytes);

                return Base64.getUrlEncoder()
                                .withoutPadding()
                                .encodeToString(bytes);
        }

        private void enviarInvitacion(String destinatario, String token) {
                String enlace = resetPasswordUrl + "?token=" + token;

                SimpleMailMessage mensaje = new SimpleMailMessage();
                mensaje.setFrom(mailFrom);
                mensaje.setTo(destinatario);
                mensaje.setSubject("Restablecimiento de contraseña");
                mensaje.setText(
                                "Hemos recibido una solicitud para restablecer tu contraseña.\n\n"
                                                + "Accede al siguiente enlace para continuar:\n"
                                                + enlace
                                                + "\n\nEl enlace caduca en 24 horas.");

                mailSender.send(mensaje);
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
