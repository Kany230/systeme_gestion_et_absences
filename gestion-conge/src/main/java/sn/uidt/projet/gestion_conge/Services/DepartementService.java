package sn.uidt.projet.gestion_conge.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.Departement;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.DepartementRepository;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;

@Service
public class DepartementService {

    @Autowired
    private DepartementRepository departementRepository;
    @Autowired
    private UserRepository userRepository;

    //Permet de creer un departement
    public Departement createDepartement(Departement departement) {
        if (departement.getId() == null && departementRepository.existsByNom(departement.getNom())) {
            throw new RuntimeException("Cet departemnt a deja ete creer");
        }

        return departementRepository.save(departement);

    }

    //Liste de tous les departements
    public List<Departement> tousLesDepartements() {
        return departementRepository.findAll();
    }

    //Show un departement
    public Departement voirDepartement(Long departementId) {
        return departementRepository.findById(departementId).orElseThrow(() -> new RuntimeException("Cet departement n'existe pas"));
    }

    //Supprimer un departement
    @Transactional
    public void supprimerDepartement(Long departementId) {

        if (userRepository.existsByDepartementId(departementId)) {
            throw new RuntimeException("Impossible car il y a des employes dans ce departement");
        }

        if (!departementRepository.existsById(departementId)) {
            throw new RuntimeException("Ce departement n'existe pas");
        }

        departementRepository.deleteById(departementId);
    }

    //Mettre le nom du chef de departement
    @Transactional
    public Departement chefDepartement(Long departementId, Long managerId) {
        Departement departement = voirDepartement(departementId);

        userRepository.findById(managerId).orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
        User chef = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        departement.setManager(chef);

        return departementRepository.save(departement);
    }

    public Departement updateDepartement(Long id, Departement details) {

        Departement departementt = departementRepository.findById(id).orElseThrow(() -> new RuntimeException("Département introuvable avec l'id : " + id));

        if (!departementt.getNom().equals(details.getNom()) && departementRepository.existsByNom(details.getNom())) {
            throw new RuntimeException("Un autre département porte déjà ce nom");
        }

        departementt.setNom(details.getNom());
        departementt.setCode(details.getCode());

        return departementRepository.save(departementt);
    }
}
