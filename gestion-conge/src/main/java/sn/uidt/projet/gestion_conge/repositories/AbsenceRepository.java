package sn.uidt.projet.gestion_conge.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;
import sn.uidt.projet.gestion_conge.entities.Absence;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    //Absence par utilisateur
    List<Absence> findByUserId(Long id);

    //Les absences dans une equipe 
    @Query("SELECT a FROM Absence a WHERE a.user.manager.id = :managerId")
    List<Absence> findByManagerId(@Param("managerId") Long managerId);

    //les absences dans le departements
    @Query("SELECT a FROM Absence a WHERE a.user.chefEquipe.id = :chefId")
    List<Absence> findByChefEquipeId(@Param("chefId") Long chefId);


}
