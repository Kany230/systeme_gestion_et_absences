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
            DepartementRepository departementRepository) { // <-- Injection du repository
        
        return args -> {
            String adminEmail = "kany@timeoff.com";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                
                // 1. Assurer l'existence d'un département par défaut pour l'admin
                Departement depts = departementRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElseGet(() -> {
                            Departement defaultDept = new Departement();
                            defaultDept.setNom("Direction Générale");
                            // defaultDept.setCode("DIR"); // Si vous utilisez un champ code
                            return departementRepository.save(defaultDept);
                        });

                UserDTO admin = new UserDTO();
                admin.setNom("CISSE");
                admin.setPrenom("Kany");
                admin.setEmail(adminEmail);
                // On ne force plus le matricule à la main, il sera autogénéré (ex: DIR-2026-XXXX)
                admin.setRole(Role.DRH);
                admin.setPoste("ADMINISTRATEUR");
                admin.setDateEmbauche(LocalDate.now());

                try {
                    // 2. Appel mis à jour avec l'ID du département trouvé ou créé
                    userService.creerUser(admin, 25.0, "password123", depts.getId());
                    System.out.println(">>> [INIT] Compte DRH créé : " + adminEmail);
                } catch (Exception e) {
                    System.err.println(">>> [INIT] Erreur lors de la création de l'admin : " + e.getMessage());
                }
            }
        };
    }
}