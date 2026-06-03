package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.dto.JustificationRequestDTO;
import sn.uidt.projet.gestion_conge.entities.Absence;
import sn.uidt.projet.gestion_conge.services.AbsenceService;

@RestController
@RequestMapping("/api/absences")
public class AbsenceController {

    @Autowired
    private AbsenceService absenceService;

    //Delencher manuellement
    @PostMapping("/detecter")
    public ResponseEntity<String> detecterAbsence() {
        absenceService.detecterAbsence();
        return ResponseEntity.ok("Une absence a été detectée");
    }

    //La liste des absences pour un user
    @GetMapping("/user/{userId}")
    public List<Absence> listeAbsenceUser(@PathVariable Long userId) {
        return absenceService.listParUser(userId);
    }

    //La liste des absences dans une equipe
    @GetMapping("/manager/{managerId}")
    public List<Absence> listeAbsenceEquipe(@PathVariable Long managerId) {
        return absenceService.listParEquipe(managerId);
    }

    //La liste des absences dans une equipe
    @GetMapping("/departement/{departementId}")
    public List<Absence> listeAbsenceDepartement(@PathVariable Long departementId) {
        return absenceService.listParDepartement(departementId);
    }

    //La liste des absences dans une equipe
    @GetMapping("/absences")
    public List<Absence> getAll() {
        return absenceService.getAll();
    }

    @PutMapping(value = "/{id}/justifier", consumes = {"multipart/form-data"})
    public ResponseEntity<?> justifierAbscence(@PathVariable Long id, @ModelAttribute JustificationRequestDTO request) {

        try {
            if (request.getFile() == null || request.getFile().isEmpty()) {
                return ResponseEntity.badRequest().body("Le fichier de justificatif est obligatoire.");
            }

            Absence absence = absenceService.justifierAbsence(id, request.getMotifJustifie(), request.getFile());

            return ResponseEntity.ok(absence);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }
}
