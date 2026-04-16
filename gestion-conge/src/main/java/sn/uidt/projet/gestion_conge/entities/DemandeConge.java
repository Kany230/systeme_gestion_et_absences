package sn.uidt.projet.gestion_conge.entities;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    @ManyToOne
    @JoinColumn(name = "id_user")
    private User user;

    @ManyToOne
    @JoinColumn(name = "id_type_conge")
    private TypeConge typeConge;

}
