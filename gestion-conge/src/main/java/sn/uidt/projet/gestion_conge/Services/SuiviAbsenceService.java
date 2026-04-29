package sn.uidt.projet.gestion_conge.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.repositories.DemandeCongeRepository;

@Service
public class SuiviAbsenceService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    //Vu chef d'equipe
    public List<DemandeConge> voirAbsentEquipe(Long managerId) {
        return demandeCongeRepository.findAbsentByManager(managerId, LocalDate.now());
    }

    //Vu chef departement
    public List<DemandeConge> voirAbsentDepartement(Long departementId) {
        return demandeCongeRepository.findAbsentByDepartement(departementId, LocalDate.now());
    }

    //Vu chef DRH
    public List<DemandeConge> voirAbsent() {
        return demandeCongeRepository.findAllAbsent(LocalDate.now());
    }
}
