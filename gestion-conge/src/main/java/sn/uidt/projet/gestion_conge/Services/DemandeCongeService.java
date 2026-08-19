package sn.uidt.projet.gestion_conge.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sn.uidt.projet.gestion_conge.dto.AllCongeValiderDTO;
import sn.uidt.projet.gestion_conge.dto.EmployeCongesDTO;
import sn.uidt.projet.gestion_conge.entities.CompteursConges;
import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.entities.JourFerie;
import sn.uidt.projet.gestion_conge.entities.TypeConge;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.*;

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
    @Autowired
    private TypeCongeRepository typeCongeRepository;

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
    @Transactional
    public DemandeConge creerDemandeConge(Long userId, LocalDate debut, LocalDate fin, TypeConge typeConge, String justificationUrl) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!debut.isAfter(LocalDate.now())) {
            throw new RuntimeException("La demande de congé doit être soumise au moins un jour avant la date de début.");
        }

        TypeConge typeCongeCharge = typeCongeRepository.findById(typeConge.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Type de congé introuvable"));

        double duree = calculerJoursOuvrable(debut, fin);

        if (duree > typeCongeCharge.getDureMax()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La duree ne doit pas depasser la duree maximale");

        }

        // 0. Vérification du chevauchement
        if (demandeCongeRepository.existsOverlappingRequest(userId, debut, fin)) {
            throw new RuntimeException("Vous avez déjà une demande de congé (validée ou en attente) sur cette période.");
        }

        // 1. Vérification de la justification obligatoire
        if (Boolean.TRUE.equals(typeConge.getDemandeJustification())) {
            if (justificationUrl.equalsIgnoreCase("null")  // ← string "null"
                    || justificationUrl.equalsIgnoreCase("undefined") || justificationUrl.trim().isEmpty()) {
                throw new RuntimeException("Un document justificatif est obligatoire pour ce type de congé.");
            }
        }

        // 2. Vérification du solde
        if (Boolean.TRUE.equals(typeCongeCharge.getEstDeductible())) {
            if (Boolean.TRUE.equals(typeCongeCharge.getEstUnePermission())) {
                if (user.getCompteursConges().getSoldePermission() < duree) {
                    throw new RuntimeException("Solde de permission insuffisant");
                }
            } else {
                if (user.getCompteursConges().getSoldeAn() < duree) {
                    throw new RuntimeException("Solde annuel insuffisant");
                }
            }
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
            case "employe" -> {
                // Vérifier si l'employé a un chef d'équipe
                if (user.getChefEquipe() != null) {
                    demandeConge.setStatut("en_attente_chef_equipe");
                } else if (user.getManager() != null) {
                    // Pas de chef d'équipe → on saute directement au manager
                    demandeConge.setStatut("en_attente_manager");
                } else {
                    // Ni chef d'équipe ni manager → va directement au DRH
                    demandeConge.setStatut("en_attente_DRH");
                }
            }

            case "chef_equipe" -> // Le chef de département doit être validé par le Manager ou DRH
                // Selon ta logique : "Manager puis DRH"
                demandeConge.setStatut("en_attente_manager");

            case "manager" -> // Le manager va directement chez le DRH
                demandeConge.setStatut("en_attente_DRH");

            default ->
                demandeConge.setStatut("en_attente_DRH");
        }

        return demandeCongeRepository.save(demandeConge);
    }

    @Transactional
    public void validerDemandeConge(Long demandeId
    ) {
        DemandeConge demandeConge = demandeCongeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande de conge non trouvee"));

        // Récupération sécurisée des rôles de l'utilisateur connecté
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        List<String> roles = auth.getAuthorities().stream()
                .map(r -> r.getAuthority().replace("ROLE_", "").toLowerCase())
                .toList();

        String emailConnecter = auth.getName();
        User valideur = userRepository.findByEmail(emailConnecter).orElseThrow(() -> new RuntimeException("User not found"));
        String statutActuel = demandeConge.getStatut();
        String roleDemandeur = demandeConge.getUser().getRole().name();
        if (demandeConge.getUser().getEmail().equals(emailConnecter)) {
            throw new RuntimeException("Vous ne pouvez pas valider votre propre demande de congé.");
        }

        boolean estAutoriseDrhOuAdmin = roles.contains("drh") || roles.contains("admin");

        if (roles.contains("chef_equipe") && "en_attente_chef_equipe".equals(statutActuel)) {
            demandeConge.setStatut("en_attente_manager");
        } else if (roles.contains("manager") && "en_attente_manager".equals(statutActuel)) {
            demandeConge.setStatut("en_attente_DRH");
        } else if (estAutoriseDrhOuAdmin && "en_attente_DRH".equalsIgnoreCase(statutActuel)) {
            if ("DRH".equals(roleDemandeur) && !roles.contains("admin")) {
                throw new RuntimeException("Seul l'admin peut valider la demande d'un DRH.");
            }
            demandeConge.setStatut("validee");
            this.appliquerMajCompteur(demandeConge);
        } else {
            throw new RuntimeException("Action non autorisée ou statut de la demande incompatible");
        }

        demandeConge.setValideurId(valideur.getId());
        demandeCongeRepository.save(demandeConge);
    }
    //Deduire le solde de conge dans le compteur

    public void appliquerMajCompteur(DemandeConge demandeConge) {
        System.out.println("DEBUG: Entrée dans appliquerMajCompteur");

        CompteursConges compteursConges = compteursCongesRepository
                .findByUserId(demandeConge.getUser().getId())
                .orElseThrow(() -> new RuntimeException("L'utilisateur n'a pas de compteur configuré."));

        TypeConge type = demandeConge.getTypeConge();
        System.out.println("DEBUG: typeConge = " + type);
        System.out.println("DEBUG: estDeductible = " + (type != null ? type.getEstDeductible() : "N/A"));

        // Sortie anticipée si pas de type ou non déductible
        if (type == null || !Boolean.TRUE.equals(type.getEstDeductible())) {
            System.out.println("DEBUG: Type non déductible ou absent, pas de déduction.");
            return;
        }

        double joursADeduire = demandeConge.getNombreJoursDeduit();
        // Ligne 159 - type est garanti non-null ici
        boolean estUnePermission = Boolean.TRUE.equals(type.getEstUnePermission());

        if (estUnePermission) {
            int currentSoldePerm = compteursConges.getSoldePermission();
            if (currentSoldePerm < joursADeduire) {
                throw new RuntimeException(
                        "Solde de permission insuffisant (" + currentSoldePerm + " jours restants)");
            }
            compteursConges.setSoldePermission(currentSoldePerm - (int) joursADeduire);
            System.out.println("DEBUG: Solde Permission mis à jour : " + compteursConges.getSoldePermission());
        } else {
            double currentSoldeAn = compteursConges.getSoldeAn();
            if (currentSoldeAn < joursADeduire) {
                throw new RuntimeException(
                        "Solde annuel insuffisant (" + currentSoldeAn + " jours restants)");
            }
            compteursConges.setSoldeAn(currentSoldeAn - joursADeduire);
            System.out.println("DEBUG: Solde Annuel mis à jour : " + compteursConges.getSoldeAn());
        }

        compteursCongesRepository.saveAndFlush(compteursConges);
        System.out.println("DEBUG: Compteur sauvegardé avec succès.");
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
    public List<DemandeConge> vuByChefEquipe(Long chefId) {
        return demandeCongeRepository.findByStatutAndUserChefEquipeId("en_attente_chef_equipe", chefId);
    }

    //A valider pour manager
    public List<DemandeConge> vuByChefDepartement(Long departementId) {
        return demandeCongeRepository.findByStatutAndUserDepartementId("en_attente_manager", departementId);
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

    //Voir tous les retards
    public List<DemandeConge> lesRetardDeRetours() {
        LocalDate hier = LocalDate.now().minusDays(1);

        return demandeCongeRepository.findRetards(hier);
    }

    //Absents pour le manager
    public List<DemandeConge> getAbsentsByDepartement(Long managerId, LocalDate date) {
        return demandeCongeRepository.findAbsentByManager(managerId, date);
    }

    //Absents pour chef equipe
    public List<DemandeConge> getAbsentsByEquipe(Long chefId, LocalDate date) {
        return demandeCongeRepository.findAbsentByChefEquipe(chefId, date);
    }

    //Tous les absents
    @Transactional
    public List<DemandeConge> getTousLesAbsents(LocalDate date) {
        return demandeCongeRepository.findAllAbsent(date);
    }

    //Retards pour le chef
    public List<DemandeConge> getRetardsByChefEquipe(Long chefId) {
        LocalDate hier = LocalDate.now().minusDays(1);
        return demandeCongeRepository.findRetardsByChefEquipe(chefId, hier);
    }

    //Retards pour manager
    @Transactional
    public List<DemandeConge> getRetardsByManager(Long managerId) {
        LocalDate hier = LocalDate.now().minusDays(1);
        return demandeCongeRepository.findRetardsByManager(managerId, hier);
    }

    @Transactional
    public List<AllCongeValiderDTO> allCongeValiders() {
        // ✅ Toutes les demandes validées, passées et actuelles
        List<DemandeConge> demandeCongeList = demandeCongeRepository.findAllValidees();

        // Calculer le total de jours par employé
        Map<Long, Integer> totalJoursParEmploye = demandeCongeList.stream()
                .filter(d -> d.getUser() != null && d.getNombreJoursDeduit() != null)
                .collect(Collectors.groupingBy(
                        d -> d.getUser().getId(),
                        Collectors.summingInt(d -> d.getNombreJoursDeduit().intValue()) // ✅ Double → int
                ));

        return demandeCongeList.stream().map(d -> {
            String[] valideurInfo = {null, null};
            if (d.getValideurId() != null) {
                userRepository.findById(d.getValideurId()).ifPresent(v -> {
                    valideurInfo[0] = v.getNom();
                    valideurInfo[1] = v.getPrenom();
                });
            }

            // Total cumulé de cet employé
            Integer totalJours = d.getUser() != null
                    ? totalJoursParEmploye.getOrDefault(d.getUser().getId(), 0)
                    : 0;

            return new AllCongeValiderDTO(
                    d.getId(),
                    d.getDateDebut()  != null ? d.getDateDebut().toString()  : null,
                    d.getDateFin()    != null ? d.getDateFin().toString()     : null,
                    d.getNombreJoursDeduit() != null ? d.getNombreJoursDeduit().intValue() : null, // ✅ Double → Integer
                    d.getStatut(),
                    d.getTypeConge()  != null ? d.getTypeConge().getNomType() : null,
                    d.getJustificationUrl(),
                    d.getUser()       != null ? d.getUser().getId()           : null,
                    d.getUser()       != null ? d.getUser().getNom()          : null,
                    d.getUser()       != null ? d.getUser().getPrenom()       : null,
                    d.getUser()       != null ? d.getUser().getRole().name()  : null,
                    d.getValideurId(),
                    valideurInfo[0],
                    valideurInfo[1],
                    totalJours
            );
        }).toList();
    }

    // ✅ Nouvelle fonction : groupé par employé
    public List<EmployeCongesDTO> allCongeValiderGroupeParEmploye() {
        List<AllCongeValiderDTO> tousLesConges = allCongeValiders();

        // Grouper par userId
        Map<Long, List<AllCongeValiderDTO>> grouped = tousLesConges.stream()
                .filter(d -> d.getUserId() != null)
                .collect(Collectors.groupingBy(AllCongeValiderDTO::getUserId));

        return grouped.entrySet().stream().map(entry -> {
            List<AllCongeValiderDTO> congesEmploye = entry.getValue();
            AllCongeValiderDTO premier = congesEmploye.get(0);

            return new EmployeCongesDTO(
                    premier.getUserId(),
                    premier.getUserNom(),
                    premier.getUserPrenom(),
                    premier.getUserRole(),
                    premier.getTotalJoursPris(),
                    congesEmploye
            );
        }).toList();
    }

}
