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
import sn.uidt.projet.gestion_conge.repositories.UserRepository;

@Service
public class DemandeCongeService {

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;
    @Autowired
    private UserRepository userRepository;
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
        if (Boolean.TRUE.equals(typeConge.getEstDeductible()) && user.getCompteursConges().getSoldeAn() < duree) {
            throw new RuntimeException("Solde de conge insuffisant");
        }

        User user1 = userRepository.findById(user.getId()).get();

        DemandeConge demandeConge = new DemandeConge();
        demandeConge.setUser(user1);
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
            demandeConge.setStatut("en_attente_manager");
        } else if (role.equals("manager") && demandeConge.getStatut().equals("en_attente_manager")) {
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
        System.out.println("DEBUG: Entrée dans appliquerMajCompteur");
        CompteursConges compteursConges = demandeConge.getUser().getCompteursConges();

        if (compteursConges == null) {
            System.out.println("DEBUG: L'utilisateur n'a pas de compteur !");
            return;
        }

        // Remets la logique dynamique si tu veux que ce soit propre :
        boolean estDeductible = demandeConge.getTypeConge() != null && Boolean.TRUE.equals(demandeConge.getTypeConge().getEstDeductible());

        System.out.println("DEBUG: Est déductible ? " + estDeductible);
        System.out.println("DEBUG: Jours à déduire : " + demandeConge.getNombreJoursDeduit());

        if (estDeductible) {
            double currentSolde = compteursConges.getSoldeAn();
            double jours = demandeConge.getNombreJoursDeduit();

            if (jours <= 0) {
                System.out.println("DEBUG: Attention, nombre de jours déduits est de 0 ou moins");
            }

            double newSolde = currentSolde - jours;

            if (newSolde < 0) {
                throw new RuntimeException("Solde insuffisant (" + currentSolde + " < " + jours + ")");
            }

            compteursConges.setSoldeAn(newSolde);
            this.compteursCongesRepository.save(compteursConges);
            System.out.println("DEBUG: UPDATE Compteur envoyé à la base. Nouveau solde : " + newSolde);
        } else {
            System.out.println("DEBUG: Le type de congé n'est pas déductible, on ne réduit rien.");
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
