package com.magicGroup.backend.config;

import org.springframework.context.annotation.*;
import org.springframework.web.cors.*;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {

	private List<String> getAllowedOrigins() {
		String env = System.getenv("CORS_ALLOWED_ORIGINS");
		if (env != null && !env.isBlank()) {
			return Arrays.stream(env.split(","))
					.map(String::trim)
					.filter(s -> !s.isEmpty())
					.collect(Collectors.toList());
		}
		return List.of(
				"http://localhost:5173",
				"http://localhost:5174",
				"https://systemstoresf.onrender.com");
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(getAllowedOrigins());
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		config.setAllowCredentials(true);
		config.setAllowedHeaders(List.of("*"));
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}
}
