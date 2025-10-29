/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/*package com.magicGroup.backend.config;

import com.magicGroup.backend.model.usuarios.Credencial;
import com.magicGroup.backend.repository.usuariosRepository.CredencialRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

/**
 *
 * @author Jhonn
 */
/*
@Configuration
public class hashPaswoord {


    @Bean
    CommandLineRunner hashPasswordsAtStartup(CredencialRepository credRepo, PasswordEncoder encoder) {
        return args -> {
            List<Credencial> credenciales = credRepo.findAll();
            int count = 0;

            for (Credencial cred : credenciales) {
                String clave = cred.getClave();
                if (clave != null && !clave.startsWith("$2a$")) { // no está hasheada
                    cred.setClave(encoder.encode(clave));
                    credRepo.save(cred);
                    count++;
                }
            }

            if (count > 0)
                System.out.println("✅ Contraseñas actualizadas y hasheadas: " + count);
            else
                System.out.println("🔹 Todas las contraseñas ya estaban hasheadas.");
        };
    }
}*/