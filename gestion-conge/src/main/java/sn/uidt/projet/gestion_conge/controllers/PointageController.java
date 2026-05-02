package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.entities.Pointage;
import sn.uidt.projet.gestion_conge.services.PointageService;

@RestController
@RequestMapping("/api/pointages")
public class PointageController {

    @Autowired
    private PointageService pointageService;

    //Employe arrivee
    @PostMapping("/arrivee/{userId}")
    public ResponseEntity<Pointage> arriveePointer(@PathVariable Long userId) {
        return ResponseEntity.ok(pointageService.pointageArrive(userId));
    }

    //Employe depart
    @PostMapping("/depart/{userId}")
    public ResponseEntity<Pointage> departPointer(@PathVariable Long userId) {
        return ResponseEntity.ok(pointageService.pointageDepart(userId));
    }

    //Detecter absence
    @PostMapping("/detecter-absence")
    public ResponseEntity<String> detecterAbsences() {
        pointageService.detecterAbsences();
        return ResponseEntity.ok("Detection des absences fait");
    }

    //Les listes
    @GetMapping("/absence-equipe/{managerId}")
    public List<Pointage> listeParEquipe(@PathVariable Long managerId) {
        return pointageService.ListParEquipe(managerId);
    }

    @GetMapping("/absence-dept/{departementId}")
    public List<Pointage> listeParDept(@PathVariable Long departementId) {
        return pointageService.ListParDepartement(departementId);
    }

    @GetMapping("/absences")
    public List<Pointage> getAbsences() {
        return pointageService.getAbsences();
    }

    @GetMapping("/retards")
    public List<Pointage> getRetards() {
        return pointageService.getRetards();
    }

    @GetMapping("/all")
    public List<Pointage> getAll() {
        return pointageService.getAll();
    }
}
