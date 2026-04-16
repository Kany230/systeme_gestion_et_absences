package sn.uidt.projet.gestion_conge.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.CompteursConges;

@Repository
public interface CompteursCongesRepository extends JpaRepository<CompteursConges, Long> {

    //Permet de trouver les compteurs de conges d'un utilisateur par son id
    Optional<CompteursConges> findByUserId(Long userId);
}
