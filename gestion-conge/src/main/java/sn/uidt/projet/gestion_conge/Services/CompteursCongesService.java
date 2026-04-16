package sn.uidt.projet.gestion_conge.Services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.CompteursConges;
import sn.uidt.projet.gestion_conge.entities.HistoriqueConge;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.CompteursCongesRepository;
import sn.uidt.projet.gestion_conge.repositories.HistoriqueCongeRepository;

@Service
public class CompteursCongesService {

    @Autowired
    private CompteursCongesRepository compteursCongesRepository;
    @Autowired
    private HistoriqueCongeRepository historiqueCongeRepository;

    //Initialise ou importe un compteur pour un employe 
    @Transactional
    public void creerOuImporteCompteur(Double soldeInitiale, User user) {
        CompteursConges compteursConges = new CompteursConges();
        compteursConges.setUser(user);

        double solde = (soldeInitiale != null) ? soldeInitiale : 0.0;
        compteursConges.setSoldeAn(solde);

        compteursConges.setSoldePermission(10);

        compteursCongesRepository.save(compteursConges);
        enregistreHistorique(compteursConges, 0.0, solde, "Compteur employe Initialise");
    }

    //Permet d'ajoute +2 au solde chaque mois
    @Scheduled(cron = "0 0 0 1 * ?") //Sert à executer automatiquement cette metthode tous les 1ers jours de chaque mois à 00:00:00
    @Transactional
    public void ajoutDuMois() {
        List<CompteursConges> compteursConges = compteursCongesRepository.findAll();

        for (CompteursConges compteurs : compteursConges) {
            double ancienSolde = compteurs.getSoldeAn();
            double newSolde = ancienSolde + 2.0;

            compteurs.setSoldeAn(newSolde);
            compteursCongesRepository.save(compteurs);
            enregistreHistorique(compteurs, ancienSolde, newSolde, "Credit mensuel automatique");

        }
    }

    //Permet au RH de corriger un solde 
    @Transactional
    public void ajouterSoldeParRH(Long userId, double newSolde, String motif) {
        CompteursConges compteursConges = compteursCongesRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        double ancienSolde = compteursConges.getSoldeAn();
        compteursConges.setSoldeAn(newSolde);
        compteursCongesRepository.save(compteursConges);
        enregistreHistorique(compteursConges, ancienSolde, newSolde, "Changement du solde par le RH : " + motif);
    }

    //Consulter le solde d'un utilisateur
    public CompteursConges consulderSoldeUser(Long userId) {
        CompteursConges compteursConges = compteursCongesRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return compteursConges;
    }

    //Centralise la creation de l'historique
    private void enregistreHistorique(CompteursConges compteursConges, Double ancienSolde, Double newSolde, String motif) {
        HistoriqueConge historiqueConge = new HistoriqueConge();
        historiqueConge.setCompteursConges(compteursConges);
        historiqueConge.setAncienSolde(ancienSolde);
        historiqueConge.setNewSolde(newSolde);
        historiqueConge.setMotif(motif);
        historiqueConge.setDateModification(LocalDate.now());

        historiqueCongeRepository.save(historiqueConge);
    }
}
