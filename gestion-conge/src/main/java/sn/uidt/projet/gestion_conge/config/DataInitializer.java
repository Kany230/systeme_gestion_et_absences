package sn.uidt.projet.gestion_conge.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;
import sn.uidt.projet.gestion_conge.services.UserService;

@Configuration
@SuppressWarnings("unused")
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserService userService, UserRepository userRepository) {
        return args -> {
            String adminEmail = "kany@test.com";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setNom("CISSE");
                admin.setPrenom("Kany");
                admin.setEmail(adminEmail);
                admin.setMatricule("ADMIN-001");
                admin.setRole(Role.DRH);
                admin.setPassword("password123");
                admin.setDateEmbauche(LocalDate.now());

                try {
                    // Utiliser le service est CRUCIAL pour le hachage et le CompteConge
                    userService.creerUser(admin, 25.0);
                    System.out.println(">>> [INIT] Compte DRH créé : " + adminEmail);
                } catch (Exception e) {
                    System.err.println(">>> [INIT] Erreur lors de la création de l'admin : " + e.getMessage());
                }
            } else {
                System.out.println(">>> [INIT] L'utilisateur admin existe déjà.");
            }
        };
    }
}
