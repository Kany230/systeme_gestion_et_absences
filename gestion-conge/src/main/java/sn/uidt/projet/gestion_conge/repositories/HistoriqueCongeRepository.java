package sn.uidt.projet.gestion_conge.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.HistoriqueConge;

@Repository
public interface HistoriqueCongeRepository extends JpaRepository<HistoriqueConge, Long> {


    List<HistoriqueConge> findAllByOrderByDateModificationDesc();

    @Query("SELECT h FROM HistoriqueConge h WHERE h.compteursConges.user.id = :userId ORDER BY h.dateModification DESC")
    List<HistoriqueConge> findByUserIdOrderByDateModificationDesc(Long userId);
}
