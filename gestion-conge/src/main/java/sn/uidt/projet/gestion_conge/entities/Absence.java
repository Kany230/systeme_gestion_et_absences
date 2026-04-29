package sn.uidt.projet.gestion_conge.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "absences")
public class Absence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    private LocalDate dateAbsence;

    private LocalDate dateDetecter;

    private String motifJustifie;
    private String justificationUrl;

    @Enumerated(EnumType.STRING)
    private StatutAbsence statut;

    @ManyToOne
    @JoinColumn(name = "id_user")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "id_demandeConge")
    private DemandeConge demandeConge;
}
