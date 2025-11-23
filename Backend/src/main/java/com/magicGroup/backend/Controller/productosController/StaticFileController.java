package com.magicGroup.backend.Controller.productosController;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class StaticFileController {

    private static final String PROJECT_ROOT = System.getProperty("user.dir");
    private static final Path UPLOADS_PATH;

    static {
        Path execDir = Paths.get(PROJECT_ROOT).toAbsolutePath();
        UPLOADS_PATH = findUploadsDir(execDir);
    }

    private static Path findUploadsDir(Path execDir) {
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
        Path fallback = execDir.resolve("Backend").resolve("uploads");
        try {
            Files.createDirectories(fallback);
        } catch (Exception ignored) {
        }
        return fallback;
    }

    @CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
    @GetMapping("/uploads/productos/{filename:.+}")
    public ResponseEntity<Resource> serveProducto(@PathVariable String filename) {
        try {
            Path file = UPLOADS_PATH.resolve("productos").resolve(filename).normalize();
            if (!file.startsWith(UPLOADS_PATH)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            if (!Files.exists(file) || !Files.isReadable(file)) {
                return ResponseEntity.notFound().build();
            }
            UrlResource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            if (contentType == null)
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
