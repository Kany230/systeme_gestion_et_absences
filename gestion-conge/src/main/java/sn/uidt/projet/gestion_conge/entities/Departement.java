package sn.uidt.projet.gestion_conge.entities;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "departements")
public class Departement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String nom;
    private String code;

    // Ajout du champ Manager pour lier un chef au département
    @jakarta.persistence.OneToOne
    @jakarta.persistence.JoinColumn(name = "manager_id") // Crée une colonne manager_id en base
    private User manager;

    @OneToMany(mappedBy = "departement")
    @JsonIgnore
    private List<User> users;
}
