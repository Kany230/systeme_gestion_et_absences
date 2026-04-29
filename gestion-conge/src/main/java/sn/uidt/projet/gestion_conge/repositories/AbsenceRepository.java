package sn.uidt.projet.gestion_conge.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import sn.uidt.projet.gestion_conge.entities.Absence;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    //Absence par utilisateur
    List<Absence> findByUserId(Long id);

    //Les absences dans une equipe 
    @Query("SELECT a FROM Absence a WHERE a.user.manager.id = :managerId")
    List<Absence> findByManagerId(Long managerId);

    //les absences dans le departements
    @Query("SELECT a FROM Absence a WHERE a.user.departement.id = :departementId")
    List<Absence> findByDepartementId(Long departementId);
}
