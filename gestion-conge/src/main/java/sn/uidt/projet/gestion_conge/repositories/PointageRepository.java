package sn.uidt.projet.gestion_conge.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.Pointage;
import sn.uidt.projet.gestion_conge.entities.StatutPointage;

@Repository
public interface PointageRepository extends JpaRepository<Pointage, Long> {

    //Verifier si l'utilisateur a deja pointe 
    Optional<Pointage> findByUserIdAndDate(Long userId, LocalDate date);

    //Pointage par utilisateurs
    List<Pointage> findByUserId(Long id);

    //Liste des pointage d'une equipe
    @Query("SELECT p FROM Pointage WHERE p.user.manager.id = :mangerId")
    List<Pointage> findByManagerId(Long managerId);

    //Lister des pointage d'un departement
    @Query("SELECT p FROM Pointage WHERE p.user.departement.id = :departementId")
    List<Pointage> findByDepartemntId(Long departementrId);

    //Pointage par statut pour le drh
    List<Pointage> findByStatut(StatutPointage statut);

    //La liste des pointage pour une date donne
    List<Pointage> findByDate(LocalDate date);
}
