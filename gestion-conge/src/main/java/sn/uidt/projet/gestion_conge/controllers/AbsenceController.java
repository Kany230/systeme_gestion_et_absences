package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.Services.AbsenceService;
import sn.uidt.projet.gestion_conge.entities.Absence;

@RestController
@RequestMapping("/api/absences")
@CrossOrigin(origins = "*")
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
    public List<Absence> listeAbsenceEquipe(@PathVariable Long managerid) {
        return absenceService.listParEquipe(managerid);
    }

    //La liste des absences dans une equipe
    @GetMapping("/departement/{departementId}")
    public List<Absence> listeAbsenceDepartement(@PathVariable Long departementid) {
        return absenceService.listParDepartement(departementid);
    }

    //La liste des absences dans une equipe
    @GetMapping("/absences")
    public List<Absence> getAll() {
        return absenceService.getAll();
    }
}
