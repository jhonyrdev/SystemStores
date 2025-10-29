package com.magicGroup.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class testBd implements CommandLineRunner {

    private final DataSource dataSource;

    public testBd(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        System.out.println("Verificando conexión a la base de datos...");

        try (Connection connection = dataSource.getConnection()) {
            System.out.println("¡Conexión exitosa!");
            System.out.println("URL: " + connection.getMetaData().getURL());
            System.out.println("Base de Datos: " + connection.getCatalog());
        } catch (Exception e) {
            System.err.println("Falló la conexión con la base de datos:");
            e.printStackTrace();
        }
    }
}
