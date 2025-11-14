package com.magicGroup.backend.config;

import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
public class CorsConfig {

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		// Allow Vite dev servers (sometimes 5173, fallback 5174) – extend as needed for local dev
		config.setAllowedOrigins(List.of(
				"http://localhost:5173",
				"http://localhost:5174"
		));
		config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
		config.setAllowCredentials(true);
		config.setAllowedHeaders(List.of("*"));
		// Optionally expose headers (uncomment if frontend needs them)
		// config.setExposedHeaders(List.of("Authorization","Content-Type"));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}
