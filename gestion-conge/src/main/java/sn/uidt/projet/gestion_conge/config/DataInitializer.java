package sn.uidt.projet.gestion_conge.config;

import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import sn.uidt.projet.gestion_conge.dto.UserDTO;
import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.entities.Departement;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;
import sn.uidt.projet.gestion_conge.repositories.DepartementRepository;
import sn.uidt.projet.gestion_conge.services.UserService;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            UserService userService,
            UserRepository userRepository,
            DepartementRepository departementRepository) {

        return args -> {
            String adminEmail = "kany@timeoff.com";

            try {
                // Check if user exists with a safe approach
                if (userRepository.findByEmail(adminEmail).isEmpty()) {

                    // Ensure at least one department exists
                    Departement depts = departementRepository.findAll().stream()
                            .findFirst()
                            .orElseGet(() -> {
                                Departement defaultDept = new Departement();
                                defaultDept.setNom("Direction Générale");
                                return departementRepository.save(defaultDept);
                            });

                    UserDTO admin = new UserDTO();
                    admin.setNom("CISSE");
                    admin.setPrenom("Kany");
                    admin.setEmail(adminEmail);
                    admin.setRole(Role.admin);
                    admin.setPoste("ADMINISTRATEUR");
                    admin.setDateEmbauche(LocalDate.now());

                    userService.creerUser(admin, 25.0, "password123", depts.getId());
                    System.out.println(">>> [INIT] Compte Admin créé avec succès.");
                }
            } catch (Exception e) {
                // Log the error without crashing the application startup
                System.err.println(">>> [INIT] Impossible de créer l'admin. Vérifiez la connexion DB : " + e.getMessage());
            }
        };
    }
}