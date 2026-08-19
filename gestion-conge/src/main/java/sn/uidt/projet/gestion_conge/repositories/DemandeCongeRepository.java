package sn.uidt.projet.gestion_conge.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.entities.StatutPointage;

@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {

    //Permet de trouver les demandes de conges d'un utilisateur par son id
    List<DemandeConge> findByUserId(Long userId);

    //Permet de trouver les demandes de conges en attente pour le chef d'equipe
    List<DemandeConge> findByStatutAndUserChefEquipeId(String statut, Long chefId);

    //Permet de trouver les demandes de conges en attente pour le chef de departement
    List<DemandeConge> findByStatutAndUserDepartementId(String statut, Long departementID);

    //Permet de trouver les demandes de conges en en attente pour le DRH
    List<DemandeConge> findByStatut(String statut);

    //Permet de savoir si le conge existe dans les demandes 
    boolean existsByTypeCongeId(Long typeId);

    // Récupérer TOUTES les demandes validées (passées et actuelles)
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee' ORDER BY d.dateDebut DESC")
    List<DemandeConge> findAllValidees();

    @Query("SELECT COUNT(d) > 0 FROM DemandeConge d WHERE d.user.id = :userId " +
            "AND d.statut = 'validee' " +
            "AND d.dateDebut <= :date AND d.dateFin >= :date")
    boolean isUserEnCongeValide(@Param("userId") Long userId, @Param("date") LocalDate date);

    //Tous les absents d'un departements
    @Query("SELECT d FROM DemandeConge d WHERE d.user.manager.id = :managerId "
            + "AND d.statut = 'validee' "
            + "AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAbsentByManager(@Param("managerId") Long managerId, @Param("date") LocalDate date);

    //Tous les absents d'une equipe
    @Query("SELECT d FROM DemandeConge d WHERE d.user.chefEquipe.id = :chefId" + " AND d.statut = 'validee' " + "AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAbsentByChefEquipe(@Param("chefId") Long chefId, @Param("date") LocalDate date);

    //Tous les absents d'un organisation
    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee'" + " AND :date BETWEEN d.dateDebut AND d.dateFin")
    List<DemandeConge> findAllAbsent(@Param("date") LocalDate date);

    @Query("SELECT COUNT(d) > 0 FROM DemandeConge d WHERE d.user.id = :userId " +
           "AND d.statut NOT IN ('refusee', 'annulee') " +
           "AND d.dateDebut <= :dateFin AND d.dateFin >= :dateDebut")
    boolean existsOverlappingRequest(@Param("userId") Long userId, @Param("dateDebut") LocalDate dateDebut, @Param("dateFin") LocalDate dateFin);

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee' " + " AND d.dateFin < :date AND d.retourConfirme = false")
    List<DemandeConge> findRetards(@Param("date") LocalDate date);

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee' " + " AND d.dateFin < :date AND d.retourConfirme = false" + " AND d.user.chefEquipe.id = :chefId")
    List<DemandeConge> findRetardsByChefEquipe(@Param("chefId") Long chefId, @Param("date") LocalDate date);

    @Query("SELECT d FROM DemandeConge d WHERE d.statut = 'validee' " + " AND d.dateFin < :date AND d.retourConfirme = false" + " AND d.user.manager.id = :managerId")
    List<DemandeConge> findRetardsByManager(@Param("managerId") Long managerId, @Param("date") LocalDate date);
}
