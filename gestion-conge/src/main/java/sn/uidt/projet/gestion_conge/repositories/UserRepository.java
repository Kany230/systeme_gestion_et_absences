package sn.uidt.projet.gestion_conge.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // Vérifie s'il y a des users dans le département
    boolean existsByDepartementId(Long departementId);

    boolean existsByEmail(String email);

    // Tous les membres d'un département
    List<User> findByDepartementId(Long departementId);

    List<User> findByChefEquipeId(Long chefEquipeId);

    // Managers d’un département
    @Query("SELECT u FROM User u WHERE u.departement.id = :deptId AND u.role = 'manager'")
    List<User> findManagersByDepartement(@Param("deptId") Long deptId);

    //Detacher les subordonnés d’un manager
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.manager = null WHERE u.manager.id = :managerId")
    void detachSubordinates(@Param("managerId") Long managerId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.chefEquipe = null WHERE u.chefEquipe.id = :chefId")
    void detachChefEquipe(@Param("chefId") Long chefId);

    //Supprimer les pointages d’un utilisateur
    @Modifying
    @Transactional
    @Query("DELETE FROM Pointage p WHERE p.user.id = :userId")
    void supprimerPointages(@Param("userId") Long userId);

}
