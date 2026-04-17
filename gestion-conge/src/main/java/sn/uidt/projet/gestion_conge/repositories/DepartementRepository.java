package sn.uidt.projet.gestion_conge.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.Departement;

@Repository
public interface DepartementRepository extends JpaRepository<Departement, Long> {

    //Permet de trouver un departement par son nom
    Optional<Departement> findByNom(String nom);

    //Permet de verifier si le nom du departement existe dans la base 
    boolean existsByNom(String nom);

}
