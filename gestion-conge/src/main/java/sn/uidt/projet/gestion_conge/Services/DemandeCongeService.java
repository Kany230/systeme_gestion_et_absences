package sn.uidt.projet.gestion_conge.services;

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
    public DemandeConge creerDemandeConge(Long userId, LocalDate debut, LocalDate fin, TypeConge typeConge, String justificationUrl) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        double duree = calculerJoursOuvrable(debut, fin);

        // 1. Vérification de la justification obligatoire
        if (Boolean.TRUE.equals(typeConge.getDemandeJustification())) {
            if (justificationUrl == null || justificationUrl.trim().isEmpty()) {
                throw new RuntimeException("Un document justificatif est obligatoire pour ce type de congé.");
            }
        }

        // 2. Vérification du solde
        if (Boolean.TRUE.equals(typeConge.getEstDeductible()) && user.getCompteursConges().getSoldeAn() < duree) {
            throw new RuntimeException("Solde de conge insuffisant");
        }

        DemandeConge demandeConge = new DemandeConge();
        demandeConge.setUser(user);
        demandeConge.setDateDebut(debut);
        demandeConge.setDateFin(fin);
        demandeConge.setTypeConge(typeConge);
        demandeConge.setJustificationUrl(justificationUrl);
        demandeConge.setNombreJoursDeduit(duree);

        // 3. Logique dynamique du statut initial
        String role = user.getRole().name(); // On récupère le rôle (Enum ou String)

        switch (role) {
            case "EMPLOYE" -> // L'employé doit être validé par son Chef de département (CHEF_EQUIPE)
                demandeConge.setStatut("en_attente_chef_equipe");

            case "CHEF_EQUIPE" -> // Le chef de département doit être validé par le Manager ou DRH
                // Selon ta logique : "Manager puis DRH"
                demandeConge.setStatut("en_attente_manager");

            case "MANAGER" -> // Le manager va directement chez le DRH
                demandeConge.setStatut("en_attente_drh");

            default ->
                demandeConge.setStatut("en_attente_drh");
        }

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
            throw new RuntimeException("L'utilisateur n'a pas de compteur configuré.");
        }

        TypeConge type = demandeConge.getTypeConge();
        boolean estDeductible = type != null && Boolean.TRUE.equals(type.getEstDeductible());
        double joursADeduire = demandeConge.getNombreJoursDeduit();

        if (estDeductible && type != null) {

            boolean estUnePermission = type.getNomType().toLowerCase().contains("permission");

            if (estUnePermission) {
                // Logique pour le solde de Permission
                int currentSoldePerm = compteursConges.getSoldePermission();
                if (currentSoldePerm < joursADeduire) {
                    throw new RuntimeException("Solde de permission insuffisant (" + currentSoldePerm + " jours restants)");
                }
                compteursConges.setSoldePermission(currentSoldePerm - (int) joursADeduire);
                System.out.println("DEBUG: Solde Permission mis à jour : " + compteursConges.getSoldePermission());
            } else {
                // Logique par défaut pour le solde Annuel
                double currentSoldeAn = compteursConges.getSoldeAn();
                if (currentSoldeAn < joursADeduire) {
                    throw new RuntimeException("Solde annuel insuffisant (" + currentSoldeAn + " jours restants)");
                }
                compteursConges.setSoldeAn(currentSoldeAn - joursADeduire);
                System.out.println("DEBUG: Solde Annuel mis à jour : " + compteursConges.getSoldeAn());
            }

            this.compteursCongesRepository.save(compteursConges);
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
