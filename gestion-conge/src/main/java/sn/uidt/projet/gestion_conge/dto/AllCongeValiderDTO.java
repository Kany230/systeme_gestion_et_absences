package sn.uidt.projet.gestion_conge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllCongeValiderDTO {
    private Long id;
    private String dateDebut;
    private String dateFin;
    private Integer nombreJoursDeduit;
    private String statut;
    private String typeConge;
    private String justificationUrl;

    // Employé
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userRole;

    // Valideur
    private Long valideurId;
    private String valideurNom;
    private String valideurPrenom;

    // Total cumulé de l'employé
    private Integer totalJoursPris;
}
