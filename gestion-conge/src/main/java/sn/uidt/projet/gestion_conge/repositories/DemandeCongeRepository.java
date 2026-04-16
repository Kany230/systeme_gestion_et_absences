package sn.uidt.projet.gestion_conge.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.DemandeConge;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {

    //Permet de trouver les demandes de conges d'un utilisateur par son id
    List<DemandeConge> findByUserId(Long userId);

    //Permet de trouver les demandes de conges en attente pour le chef d'equipe
    List<DemandeConge> findByStatutAndUserId(String statut, Long managerId);

    //Permet de trouver les demandes de conges en attente pour le chef de departement
    List<DemandeConge> findByStatutAndUserDepartementId(String statut, Long departementID);

    //Permet de trouver les demandes de conges en en attente pour le DRH
    List<DemandeConge> findByStatut(String statut);

    //Permet de savoir si le conge existe dans les demandes 
    boolean existsByTypeCongeId(Long typeId);

    //Tous les absents d'un departements
    @Query("SELECT d FROM DemandeConge d WHERE d.user.departement.id = :departementId "
            + "AND d.statut = 'validee' "
            + "AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAbsentByDepartement(Long departementId, LocalDate date);

    //Tous les absents d'une equipe
    @Query("SELECT d FROM DemandeConge d WHERE d.user.manager.id = :managerId" + " AND d.statut = 'validee' " + "AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAbsentByManager(Long managerId, LocalDate date);

    //Tous les absents d'un organisation
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee'" + " AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAllAbsent(LocalDate date);

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee' " + " AND d.dateFin < :date AND d.retourConfirme = false")
    List<DemandeConge> findRetards(LocalDate date);
}
