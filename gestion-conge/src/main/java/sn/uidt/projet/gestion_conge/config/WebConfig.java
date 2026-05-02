package sn.uidt.projet.gestion_conge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Autorise tous les chemins
                .allowedOrigins("http://localhost:3000") // L'URL de ton appli React
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Méthodes autorisées
                .allowedHeaders("*") // Autorise tous les headers (Content-Type, Authorization, etc.)
                .allowCredentials(true);
    }
}
