package com.magicGroup.backend.services.extrasServices;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Recuperación de Contraseña - SystemStores");
            
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            message.setText(
                "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña.\n\n" +
                "Haz clic en el siguiente enlace para crear una nueva contraseña:\n" +
                resetLink + "\n\n" +
                "Este enlace expirará en 1 hora.\n\n" +
                "Si no solicitaste este cambio, ignora este correo.\n\n" +
                "Saludos,\n" +
                "Equipo de SystemStores"
            );

            mailSender.send(message);
            logger.info("Email de recuperación enviado a: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Error al enviar email de recuperación a {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Error al enviar el correo de recuperación", e);
        }
    }
}
