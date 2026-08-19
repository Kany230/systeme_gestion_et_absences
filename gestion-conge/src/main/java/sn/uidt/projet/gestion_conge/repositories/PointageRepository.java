package sn.uidt.projet.gestion_conge.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("SELECT p FROM Pointage p WHERE p.user.chefEquipe.id = :chefId OR p.user.id = :chefId")
    List<Pointage> findByManagerId(@Param("chefId") Long chefId);

    //Lister des pointage d'un departement
    @Query("SELECT p FROM Pointage p WHERE p.user.manager.id = :managerId OR p.user.id = :managerId")
    List<Pointage> findByManagerDepartementId(@Param("managerId") Long managerId);

    //Pointage par statut pour le drh
    List<Pointage> findByStatut(StatutPointage statut);

}
