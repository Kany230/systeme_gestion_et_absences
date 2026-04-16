package sn.uidt.projet.gestion_conge.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name="type_conges")
public class TypeConge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nomType;
    private Boolean estDeductible;
    private Boolean demandeJustification;
    private Integer dureMax;


    
}
