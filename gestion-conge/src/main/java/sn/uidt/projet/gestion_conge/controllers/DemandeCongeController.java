package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.services.DemandeCongeService;

@RestController
@RequestMapping("/api/demandes-conges")
@CrossOrigin(origins = "*")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;

    //Creer une demande
    @PostMapping("/create")
    public ResponseEntity<DemandeConge> creerDemande(@RequestBody DemandeConge demande) {
        DemandeConge demandeConge = demandeCongeService.creerDemandeConge(demande.getUser(), demande.getDateDebut(), demande.getDateFin(), demande.getTypeConge(), demande.getJustificationUrl());

        return ResponseEntity.ok(demandeConge);
    }

    //Voir demandesmes 
    @GetMapping("/mes-demande/{userId}")
    public List<DemandeConge> voirMesDemande(@PathVariable Long userId) {

        return demandeCongeService.voirMesDemandes(userId);
    }

    //Confirme le retour d'un utilisateur
    @PutMapping("/confirme-retour/{id}")
    public ResponseEntity<String> confirmeRetour(@PathVariable Long id) {

        demandeCongeService.confirmeRetour(id);

        return ResponseEntity.ok("Retour confirme");
    }

    @PutMapping("/annuler/{id}")
    public ResponseEntity<String> annulerDemande(@PathVariable Long id) {

        demandeCongeService.annulerDemandeConge(id);

        return ResponseEntity.ok("Demande annule");
    }

    @PutMapping("/valider/{id}")
    public ResponseEntity<String> valideDemande(@PathVariable Long id, @RequestParam String role) {

        demandeCongeService.validerDemandeConge(id, role);

        return ResponseEntity.ok("Demande validee");
    }

    @PutMapping("/refuser/{id}")
    public ResponseEntity<String> refuserDemande(@PathVariable Long id) {

        demandeCongeService.refuserDemandeConge(id);

        return ResponseEntity.ok("Demande refusee");
    }

    //Lister des demandes pour le chef d'equipe
    @GetMapping("/chef-equipe/{managerId}")
    public List<DemandeConge> getDemandeChefEquipe(@PathVariable Long managerId) {
        return demandeCongeService.vuByChefEquipe(managerId);
    }

    //Lister des demandes pour le chef de departement
    @GetMapping("/departement/{departementId}")
    public List<DemandeConge> getDemandeChefDepartement(@PathVariable Long departementId) {
        return demandeCongeService.vuByChefDepartement(departementId);
    }

    //Lister des demandes pour le DRH
    @GetMapping("/demande/drh")
    public List<DemandeConge> getDemandeDRH() {
        return demandeCongeService.vuByDRH();
    }

    //Lister des retours
    @GetMapping("/retours")
    public List<DemandeConge> getRetour() {
        return demandeCongeService.lesRetardDeRetours();
    }
}
