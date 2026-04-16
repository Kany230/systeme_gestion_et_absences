package sn.uidt.projet.gestion_conge.entities;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "jours_feries")
public class JourFerie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;

    @Column(nullable = false, unique = true)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
}
