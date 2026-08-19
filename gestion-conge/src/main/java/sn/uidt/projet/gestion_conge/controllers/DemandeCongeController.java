package sn.uidt.projet.gestion_conge.controllers;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import sn.uidt.projet.gestion_conge.dto.AllCongeValiderDTO;
import sn.uidt.projet.gestion_conge.dto.DemandeCongeDTO;
import sn.uidt.projet.gestion_conge.dto.DemandeCongeMapper;
import sn.uidt.projet.gestion_conge.dto.EmployeCongesDTO;
import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.repositories.DemandeCongeRepository;
import sn.uidt.projet.gestion_conge.services.DemandeCongeService;

@RestController
@RequestMapping("/api/demandes-conges")
public class DemandeCongeController {

    @Autowired
    private DemandeCongeService demandeCongeService;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

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

    @GetMapping("/chef-equipe/{chefId}/absents")
    public ResponseEntity<List<DemandeConge>> absentsEquipe(
            @PathVariable Long chefId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(demandeCongeService.getAbsentsByEquipe(chefId, date));
    }


    @GetMapping("/chef-equipe/{chefId}/retards")
    public ResponseEntity<List<DemandeConge>> retardsEquipe(@PathVariable Long chefId) {
        return ResponseEntity.ok(demandeCongeService.getRetardsByChefEquipe(chefId));
    }

    @GetMapping("/manager/{managerId}/absents")
    public ResponseEntity<List<DemandeConge>> absentsDepartement(
            @PathVariable Long managerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(demandeCongeService.getAbsentsByDepartement(managerId, date));
    }

    @GetMapping("/manager/{managerId}/retards")
    public ResponseEntity<List<DemandeConge>> retardsDepartement(@PathVariable Long managerId) {
        return ResponseEntity.ok(demandeCongeService.getRetardsByManager(managerId));
    }

    @GetMapping("/demande/drh")
    public List<DemandeCongeDTO> getDemandeDRH() {

        return demandeCongeMapper.toDTOList(demandeCongeService.vuByDRH());
    }

    @GetMapping("/drh/absents")
    public ResponseEntity<List<DemandeConge>> tousLesAbsents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(demandeCongeService.getTousLesAbsents(date));
    }

    @GetMapping("/retours")
    public List<DemandeCongeDTO> getRetour() {
        return demandeCongeMapper.toDTOList(demandeCongeService.lesRetardDeRetours());
    }

    @PostMapping("/upload-justificatif")
    public ResponseEntity<String> uploadJustificatif(@RequestParam("file") MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads/justificatifs/");
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName));

            return ResponseEntity.ok("/uploads/justificatifs/" + fileName);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur upload : " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeCongeDTO> getDemandeCongeById(@PathVariable Long id){
        DemandeConge demandeConge = demandeCongeRepository.findById(id).orElseThrow(()->new RuntimeException("Demande introuvable"));
        return ResponseEntity.ok(demandeCongeMapper.toDTO(demandeConge));
    }

    @GetMapping("/admin/toutes")
    public ResponseEntity<List<AllCongeValiderDTO>> toutesLesDemandesAdmin() {
        return ResponseEntity.ok(demandeCongeService.allCongeValiders());
    }

    @GetMapping("/conges/valides/par-employe")
    public ResponseEntity<List<EmployeCongesDTO>> getCongesParEmploye() {
        return ResponseEntity.ok(demandeCongeService.allCongeValiderGroupeParEmploye());
    }
}
