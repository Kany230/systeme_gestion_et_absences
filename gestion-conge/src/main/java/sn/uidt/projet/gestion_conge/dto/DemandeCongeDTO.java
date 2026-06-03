package sn.uidt.projet.gestion_conge.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class DemandeCongeDTO {

    private Long id;
    private Long userId;
    private Long typeCongeId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private double nombreJoursDeduit;
    private String statut;
    private String justificationUrl;

    private String typeCongeNom;

}
