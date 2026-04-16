package sn.uidt.projet.gestion_conge.repositories;

import java.util.List;
import java.util.Optional; // Import manquant pour JpaRepository

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    //Permet de trouver le chef de departement
    Optional<User> findByManager(String managerId);

    //Permet de savoir s'il y'a des users dans le departement
    boolean existsByDepartementId(Long departementId);

    //Permet de savoir s'il y'a des users dans le departement
    boolean existsByEmail(String email);

    //Permet de trouver tous les membres d'un departements
    List<User> findByDepartementId(Long departementId);

    //Permet de trouver tous les membres d'un equipe d'un departement
    List<User> findByManager(Long managerId);

}
