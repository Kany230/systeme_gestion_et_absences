package sn.uidt.projet.gestion_conge.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.HistoriqueConge;


@Repository
public interface HistoriqueCongeRepository extends JpaRepository<HistoriqueConge, Long> {
}
