package sn.uidt.projet.gestion_conge.entities;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "demande_conges")
public class DemandeConge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double nombreJoursDeduit;
    private String statut;
    private LocalDate dateDemande;
    private LocalDate dateRetour;
    private boolean retourConfirme = false;
    private String justificationUrl;

    @Column(name = "id_valideur")
    private Long valideurId;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private User user;

    @ManyToOne
    @JoinColumn(name = "id_type_conge")
    private TypeConge typeConge;

}
