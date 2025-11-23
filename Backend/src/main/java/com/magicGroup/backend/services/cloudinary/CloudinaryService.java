package com.magicGroup.backend.services.cloudinary;

import com.fasterxml.jackson.databind.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Locale;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:}")
    private String folder;

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    public String upload(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty())
            return null;
        if (!isConfigured())
            throw new IllegalStateException("Cloudinary is not configured");

        long ts = Instant.now().getEpochSecond();
        String timestamp = String.valueOf(ts);

        // Cloudinary requires the parameters used for the signature to be
        // concatenated in alphabetical order by key, separated with '&'.
        // Build a map of params we include in the signature, then sort keys.
        java.util.Map<String, String> sigParams = new java.util.HashMap<>();
        sigParams.put("timestamp", timestamp);
        if (folder != null && !folder.isBlank()) {
            sigParams.put("folder", folder);
        }

        String toSign = sigParams.entrySet().stream()
                .sorted(java.util.Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(java.util.stream.Collectors.joining("&"));

        String signature = sha1Hex(toSign + apiSecret);

        String uploadUrl = String.format(Locale.ROOT, "https://api.cloudinary.com/v1_1/%s/image/upload", cloudName);
        String boundary = "----CloudinaryBoundary" + System.currentTimeMillis();
        URL url = URI.create(uploadUrl).toURL();
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try (OutputStream out = conn.getOutputStream();
                DataOutputStream writer = new DataOutputStream(out)) {

            // api_key
            writeFormField(writer, boundary, "api_key", apiKey);
            // timestamp
            writeFormField(writer, boundary, "timestamp", timestamp);
            // signature
            writeFormField(writer, boundary, "signature", signature);
            // folder (optional)
            if (folder != null && !folder.isBlank()) {
                writeFormField(writer, boundary, "folder", folder);
            }

            // file
            writeFileField(writer, boundary, "file", file.getOriginalFilename(), file.getContentType(),
                    file.getBytes());

            // end
            writer.writeBytes("--" + boundary + "--\r\n");
            writer.flush();
        }

        int status = conn.getResponseCode();
        InputStream responseStream = status >= 200 && status < 400 ? conn.getInputStream() : conn.getErrorStream();
        String response = readStream(responseStream);

        // Log response for easier debugging when uploads fail
        System.out.println("[Cloudinary] upload response status=" + status + " response=" + response);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(response);
        if (node.has("secure_url")) {
            return node.get("secure_url").asText();
        } else if (node.has("url")) {
            return node.get("url").asText();
        } else {
            throw new RuntimeException("Cloudinary upload failed (status=" + status + "): " + response);
        }
    }

    /**
     * Upload raw bytes to Cloudinary (useful for migrating local files).
     */
    public String uploadBytes(byte[] data, String originalFilename, String contentType) throws Exception {
        if (data == null || data.length == 0)
            return null;
        if (!isConfigured())
            throw new IllegalStateException("Cloudinary is not configured");

        long ts = Instant.now().getEpochSecond();
        String timestamp = String.valueOf(ts);

        java.util.Map<String, String> sigParams = new java.util.HashMap<>();
        sigParams.put("timestamp", timestamp);
        if (folder != null && !folder.isBlank()) {
            sigParams.put("folder", folder);
        }

        String toSign = sigParams.entrySet().stream()
                .sorted(java.util.Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(java.util.stream.Collectors.joining("&"));

        String signature = sha1Hex(toSign + apiSecret);

        String uploadUrl = String.format(java.util.Locale.ROOT, "https://api.cloudinary.com/v1_1/%s/image/upload",
                cloudName);

        String boundary = "----CloudinaryBoundary" + System.currentTimeMillis();
        // Use java.net.URI to avoid deprecated URL constructor warning
        java.net.URI uri = java.net.URI.create(uploadUrl);
        HttpURLConnection conn = (HttpURLConnection) uri.toURL().openConnection();
        conn.setDoOutput(true);
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

        try (OutputStream out = conn.getOutputStream();
                DataOutputStream writer = new DataOutputStream(out)) {

            writeFormField(writer, boundary, "api_key", apiKey);
            writeFormField(writer, boundary, "timestamp", timestamp);
            writeFormField(writer, boundary, "signature", signature);
            if (folder != null && !folder.isBlank()) {
                writeFormField(writer, boundary, "folder", folder);
            }

            writeFileField(writer, boundary, "file", originalFilename, contentType, data);

            writer.writeBytes("--" + boundary + "--\r\n");
            writer.flush();
        }

        int status = conn.getResponseCode();
        InputStream responseStream = status >= 200 && status < 400 ? conn.getInputStream() : conn.getErrorStream();
        String response = readStream(responseStream);

        System.out.println("[Cloudinary] uploadBytes response status=" + status + " response=" + response);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(response);
        if (node.has("secure_url")) {
            return node.get("secure_url").asText();
        } else if (node.has("url")) {
            return node.get("url").asText();
        } else {
            throw new RuntimeException("Cloudinary upload failed (status=" + status + "): " + response);
        }
    }

    private static void writeFormField(DataOutputStream writer, String boundary, String name, String value)
            throws IOException {
        writer.writeBytes("--" + boundary + "\r\n");
        writer.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n");
        writer.writeBytes(value + "\r\n");
    }

    private static void writeFileField(DataOutputStream writer, String boundary, String fieldName, String filename,
            String contentType, byte[] data) throws IOException {
        writer.writeBytes("--" + boundary + "\r\n");
        writer.writeBytes(
                "Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + filename + "\"\r\n");
        writer.writeBytes(
                "Content-Type: " + (contentType != null ? contentType : "application/octet-stream") + "\r\n\r\n");
        writer.write(data);
        writer.writeBytes("\r\n");
    }

    private static String readStream(InputStream in) throws IOException {
        if (in == null)
            return "";
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
            return sb.toString();
        }
    }

    private static String sha1Hex(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

}
