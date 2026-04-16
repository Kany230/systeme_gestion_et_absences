package sn.uidt.projet.gestion_conge.Services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.CompteursConges;
import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.entities.JourFerie;
import sn.uidt.projet.gestion_conge.entities.TypeConge;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.CompteursCongesRepository;
import sn.uidt.projet.gestion_conge.repositories.DemandeCongeRepository;
import sn.uidt.projet.gestion_conge.repositories.JourFerieRepository;

@Service
public class DemandeCongeService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;
    @Autowired
    private JourFerieRepository jourFerieRepository;
    @Autowired
    private CompteursCongesRepository compteursCongesRepository;

    //Calcul le nombre de jours ouvrables hors dimanche et jours feries
    public double calculerJoursOuvrable(LocalDate debut, LocalDate fin) {
        if (debut.isAfter(fin)) {
            throw new RuntimeException("la date de debut doit etre avant la fin");
        }

        double joursOuvrables = 0;
        LocalDate dateD = debut;

        List<LocalDate> joursFeries = jourFerieRepository.findAll().stream().map(JourFerie::getDate).toList();
        while (!dateD.isAfter(fin)) {
            boolean estDimanche = dateD.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean estJourFerie = joursFeries.contains(dateD);

            if (!estDimanche && !estJourFerie) {
                joursOuvrables++;
            }
            dateD = dateD.plusDays(1);
        }
        return joursOuvrables;
    }

    //Soumettre une demande de conge
    public DemandeConge creerDemandeConge(User user, LocalDate debut, LocalDate fin, TypeConge typeConge) {
        double duree = calculerJoursOuvrable(debut, fin);

        //Verification du solde de conge
        if (typeConge.getEstDeductible() && user.getCompteursConges().getSoldeAn() < duree) {
            throw new RuntimeException("Solde de conge insuffisant");
        }

        DemandeConge demandeConge = new DemandeConge();
        demandeConge.setUser(user);
        demandeConge.setDateDebut(debut);
        demandeConge.setDateFin(fin);
        demandeConge.setTypeConge(typeConge);
        demandeConge.setNombreJoursDeduit(duree);
        demandeConge.setStatut("en_attente_chef_equipe");

        return demandeCongeRepository.save(demandeConge);
    }

    @Transactional //Sert à que toutes les operations dans cette methode reuississent ensemble, sinon on annule tout
    //Valider une demande de conge
    public void validerDemandeConge(Long demandeId, String role) {
        DemandeConge demandeConge = demandeCongeRepository.findById(demandeId).orElseThrow(() -> new RuntimeException("Demande de conge non trouvee"));

        if (role.equals("chef_equipe") && demandeConge.getStatut().equals("en_attente_chef_equipe")) {
            demandeConge.setStatut("en_attente_chef_departement");
        } else if (role.equals("chef_departement") && demandeConge.getStatut().equals("en_attente_chef_departement")) {
            demandeConge.setStatut("en_attente_DRH");
        } else if (role.equals("DRH") && demandeConge.getStatut().equals("en_attente_DRH")) {
            demandeConge.setStatut("validee");
            this.appliquerMajCompteur(demandeConge);
        } else {
            throw new RuntimeException("Action non autorisee");
        }

        demandeCongeRepository.save(demandeConge);

    }

    //Deduire le solde de conge dans le compteur
    public void appliquerMajCompteur(DemandeConge demandeConge) {
        CompteursConges compteursConges = demandeConge.getUser().getCompteursConges();

        if (demandeConge.getTypeConge().getEstDeductible()) {
            double newSolde = compteursConges.getSoldeAn() - demandeConge.getNombreJoursDeduit();

            if (newSolde < 0) {
                throw new RuntimeException("Solde ne peut pas etre nagatif");
            }
            compteursConges.setSoldeAn(newSolde);
            compteursCongesRepository.save(compteursConges);

        }

    }

    //Refuser une demande de conge
    public void refuserDemandeConge(Long demandeId) {
        DemandeConge demandeConge = demandeCongeRepository.findById(demandeId).orElseThrow(() -> new RuntimeException("Demande de conge non trouvee"));

        demandeConge.setStatut("refusee");

        demandeCongeRepository.save(demandeConge);

    }

    @Transactional
    //Annuler une demande de conge
    public void annulerDemandeConge(Long demandeId) {
        DemandeConge demandeConge = demandeCongeRepository.findById(demandeId).orElseThrow(() -> new RuntimeException("Demande Introuvable"));

        if (demandeConge.getStatut().equals("validee")) {
            throw new RuntimeException("Demandes deja validee par le DRH");
        }

        if (demandeConge.getStatut().equals("refusee") || demandeConge.getStatut().equals("annulee")) {
            throw new RuntimeException("La demande est deja rejetee ou annule");
        }

        demandeConge.setStatut("annulee");
        demandeCongeRepository.save(demandeConge);
    }

    //Voir mes demandes par l'utilisateur
    public List<DemandeConge> voirMesDemandes(Long userId) {
        return demandeCongeRepository.findByUserId(userId);
    }

    //A valider pour chef d'equipe
    public List<DemandeConge> vuByChefEquipe(Long managerId) {
        return demandeCongeRepository.findByStatutAndUserId("en_attente_chef_equipe", managerId);
    }

    //A valider pour chef departement
    public List<DemandeConge> vuByChefDepartement(Long departementId) {
        return demandeCongeRepository.findByStatutAndUserDepartementId("en_attente_chef_departement", departementId);
    }

    //A valider pour DRH
    public List<DemandeConge> vuByDRH() {
        return demandeCongeRepository.findByStatut("en_attente_DRH");
    }

    @Transactional
    public void confirmeRetour(Long demandeId) {
        DemandeConge demande = demandeCongeRepository.findById(demandeId).orElseThrow(() -> new RuntimeException("Demande introuuvable"));

        if (!demande.getStatut().equals("validee")) {
            throw new RuntimeException("Cette demande n'a pas ete validee");
        }

        demande.setRetourConfirme(true);
        demande.setDateRetour(LocalDate.now());
        demande.setStatut("terminee");

        demandeCongeRepository.save(demande);
    }

    //Voir les retards de retourd
    public List<DemandeConge> lesRetardDeRetours() {
        LocalDate hier = LocalDate.now().minusDays(1);

        return demandeCongeRepository.findRetards(hier);
    }

}
