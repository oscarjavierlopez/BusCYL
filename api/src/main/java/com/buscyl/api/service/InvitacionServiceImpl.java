package com.buscyl.api.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.buscyl.api.Auth.ForgotPasswordRequest;
import com.buscyl.api.Auth.ForgotPasswordResponse;
import com.buscyl.api.entity.Invitacion;
import com.buscyl.api.entity.Usuario;
import com.buscyl.api.exception.NotFoundException;
import com.buscyl.api.exception.TokenAlreadyCreateException;
import com.buscyl.api.repository.InvitacionRepository;
import com.buscyl.api.repository.UsuarioRepository;

@Service
public class InvitacionServiceImpl implements InvitacionService {

    @Autowired
    private InvitacionRepository invitacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    @Value("${buscyl.mail.from}")
    private String mailFrom;

    @Value("${buscyl.frontend.reset-password-url}")
    private String resetPasswordUrl;

    @Override
    public ForgotPasswordResponse enviarInvitacion(ForgotPasswordRequest request) {

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
        String asunto = "Restablecimiento de contraseña";
        String cuerpo = "Hemos recibido una solicitud para restablecer tu contraseña.\n\n"
                + "Accede al siguiente enlace para continuar:\n"
                + enlace
                + "\n\nEl enlace caduca en 24 horas.";

        emailService.enviarEmail(destinatario, asunto, cuerpo);
    }

}
