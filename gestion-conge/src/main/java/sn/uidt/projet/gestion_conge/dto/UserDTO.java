package sn.uidt.projet.gestion_conge.dto;

import lombok.Data;
import sn.uidt.projet.gestion_conge.entities.Role;
import java.time.LocalDate;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String matricule;
    private String telephone;
    private String poste;
    private Role role;
    private LocalDate dateEmbauche;
    
    private DepartementInfo departement;
    private ManagerInfo manager;

    @Data
    public static class DepartementInfo {
        private Long id;
        private String nom;
    }

    @Data
    public static class ManagerInfo {
        private Long id;
        private String nom;
        private String prenom;
    }
}
