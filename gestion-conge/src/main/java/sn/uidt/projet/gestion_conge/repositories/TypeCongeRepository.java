package sn.uidt.projet.gestion_conge.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import sn.uidt.projet.gestion_conge.entities.TypeConge;

@Repository
public interface TypeCongeRepository extends JpaRepository<TypeConge, Long> {

    Optional<TypeConge> findByNomType(String nomType);
}
