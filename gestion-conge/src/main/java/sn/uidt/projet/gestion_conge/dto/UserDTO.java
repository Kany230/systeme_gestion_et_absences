package sn.uidt.projet.gestion_conge.dto;

import java.time.LocalDate;

import lombok.Data;
import sn.uidt.projet.gestion_conge.entities.Role;

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
    private ChefInfo chefInfo;

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

    @Data
    public static class ChefInfo {

        private Long id;
        private String nom;
        private String prenom;
    }
}
