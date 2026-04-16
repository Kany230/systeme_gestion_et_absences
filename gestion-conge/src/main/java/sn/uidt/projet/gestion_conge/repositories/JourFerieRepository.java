package sn.uidt.projet.gestion_conge.repositories;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.JourFerie;

@Repository
public interface JourFerieRepository extends JpaRepository<JourFerie, Long> {

    //Permet de trouver un jour ferie par sa date
    boolean existsByDate(LocalDate date);

    //Permet de trouver un departement par son nom
    JourFerie findByDate(LocalDate date);

}
