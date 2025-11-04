package com.magicGroup.backend.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(new CorsConfig().corsConfigurationSource()))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/**",
								"/uploads/**")
						.permitAll()
						.anyRequest().authenticated()
				)
				// Quitamos formLogin y httpBasic para login REST
				.logout(logout -> logout
						.logoutUrl("/api/usuarios/logout")
						.invalidateHttpSession(true)
						.deleteCookies("JSESSIONID")
				)
				.sessionManagement(session -> session
						.maximumSessions(1)
				);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(10);
	}
}
