package com.magicGroup.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.lang.NonNull;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path execDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath();
        Path uploadsDir = findUploadsDir(execDir);

        String resourceLocation = uploadsDir.toAbsolutePath().toUri().toString();
        log.info("Registering static resource handler for /uploads/** -> {}", resourceLocation);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(0);
    }

    private Path findUploadsDir(Path execDir) {
        Path[] candidates = new Path[] {
                execDir.resolve("uploads"),
                execDir.resolve("Backend").resolve("uploads"),
                execDir.getParent() != null ? execDir.getParent().resolve("uploads") : null,
                execDir.getParent() != null ? execDir.getParent().resolve("Backend").resolve("uploads") : null
        };
        for (Path c : candidates) {
            if (c != null && Files.exists(c))
                return c;
        }
        // fallback: use execDir/Backend/uploads (create if necessary)
        Path fallback = execDir.resolve("Backend").resolve("uploads");
        try {
            Files.createDirectories(fallback);
        } catch (Exception ignored) {
        }
        return fallback;
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // Allow requests from the frontend dev server to access static uploads
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowCredentials(true)
                .maxAge(3600);
    }

}