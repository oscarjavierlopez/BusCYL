package com.buscyl.api.service;

public interface EmailService {
    void enviarEmail(String destinatario, String asunto, String cuerpo);
}
