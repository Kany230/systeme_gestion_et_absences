package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.dto.DemandeCongeDTO;
import sn.uidt.projet.gestion_conge.dto.DemandeCongeMapper;
import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.services.DemandeCongeService;

@RestController
@RequestMapping("/api/demandes-conges")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;
    @Autowired
    private DemandeCongeMapper demandeCongeMapper;

    //Creer une demande
    @PostMapping("/create")
    public ResponseEntity<DemandeCongeDTO> creerDemande(@RequestBody DemandeConge demande) {
        DemandeConge result = demandeCongeService.creerDemandeConge(
                demande.getUser().getId(),
                demande.getDateDebut(),
                demande.getDateFin(),
                demande.getTypeConge(),
                demande.getJustificationUrl()
        );
        return ResponseEntity.ok(demandeCongeMapper.toDTO(result));
    }

    //Voir demandesmes 
    @GetMapping("/mes-demandes/{userId}")
    public List<DemandeCongeDTO> voirMesDemande(@PathVariable Long userId) {

        return demandeCongeMapper.toDTOList(demandeCongeService.voirMesDemandes(userId));
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

    @PostMapping("/valider/{id}")
    public ResponseEntity<String> valideDemande(@PathVariable Long id) {

        demandeCongeService.validerDemandeConge(id);

        return ResponseEntity.ok("Demande validee");
    }

    @PutMapping("/refuser/{id}")
    public ResponseEntity<String> refuserDemande(@PathVariable Long id) {

        demandeCongeService.refuserDemandeConge(id);

        return ResponseEntity.ok("Demande refusee");
    }

    //Lister des demandes pour le chef d'equipe
    @GetMapping("/chef-equipe/{managerId}")
    public List<DemandeCongeDTO> getDemandeChefEquipe(@PathVariable Long managerId) {
        return demandeCongeMapper.toDTOList(demandeCongeService.vuByChefEquipe(managerId));
    }

    @GetMapping("/departement/{departementId}")
    public List<DemandeCongeDTO> getDemandeChefDepartement(@PathVariable Long departementId) {
        return demandeCongeMapper.toDTOList(demandeCongeService.vuByChefDepartement(departementId));
    }

    @GetMapping("/demande/drh")
    public List<DemandeCongeDTO> getDemandeDRH() {
        return demandeCongeMapper.toDTOList(demandeCongeService.vuByDRH());
    }

    @GetMapping("/retours")
    public List<DemandeCongeDTO> getRetour() {
        return demandeCongeMapper.toDTOList(demandeCongeService.lesRetardDeRetours());
    }
}
