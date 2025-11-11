package com.magicGroup.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.lang.NonNull;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Configuración de CORS
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Permite todas las rutas
            .allowedOrigins("http://localhost:5173")  // Asegúrate de que la URL del frontend esté correcta
            .allowedMethods("GET", "POST", "PUT", "DELETE")  // Permite los métodos HTTP adecuados
            .allowCredentials(true);  // Permite el uso de credenciales (como cookies o cabeceras de autorización)
    }

    // Configuración para servir archivos subidos
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String projectDir = System.getProperty("user.dir");  // Obtiene el directorio de trabajo
        String uploadPath = "file:" + projectDir + "/uploads/";  // Ruta donde se guardan los archivos

        registry.addResourceHandler("/uploads/**")  // Ruta para acceder a los archivos subidos
            .addResourceLocations(uploadPath)  // Configura la ubicación de los archivos
            .setCachePeriod(0);  // Desactiva la caché de los archivos
    }
}
