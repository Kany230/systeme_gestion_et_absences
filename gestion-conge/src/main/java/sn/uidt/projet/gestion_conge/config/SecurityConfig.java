package sn.uidt.projet.gestion_conge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Désactive le CSRF (nécessaire pour tester les POST/PUT avec Postman)
                .csrf(csrf -> csrf.disable())
                // 2. Autorise toutes les requêtes sans authentification
                .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
                )
                // 3. Désactive le formulaire de login par défaut
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
