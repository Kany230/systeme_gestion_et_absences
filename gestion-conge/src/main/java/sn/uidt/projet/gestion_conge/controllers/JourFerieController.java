package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.Services.JourFerieService;
import sn.uidt.projet.gestion_conge.entities.JourFerie;

@RestController
@RequestMapping("/api/jours-feries")
@CrossOrigin(origins = "*")
public class JourFerieController {

    @Autowired
    private JourFerieService jourFerieService;

    //initialiser l'annee
    @PostMapping("/initialiser/{annee}")
    public ResponseEntity<String> initialiserAN(@PathVariable int annee) {
        jourFerieService.initialiseAnnee(annee);

        return ResponseEntity.ok("Initialisation faite");
    }

    //Ajoute jours ferie
    @PostMapping("/ajouter")
    public ResponseEntity<JourFerie> ajouterJour(@RequestBody JourFerie jf) {

        System.out.println("Données reçues : Nom=" + jf.getNom() + ", Date=" + jf.getDate());
        return ResponseEntity.ok(jourFerieService.ajouterDate(jf.getDate(), jf.getNom()));
    }

    //La liste des jours feries
    @GetMapping("/feries")
    public List<JourFerie> getAll() {

        return jourFerieService.listeFeries();
    }

    //Modifier un jour ferie
    @PutMapping("/modifier/{id}")
    public ResponseEntity<JourFerie> update(@PathVariable Long id, @RequestBody JourFerie jf) {

        return ResponseEntity.ok(jourFerieService.modifiFerie(id, jf.getNom(), jf.getDate()));

    }

    //Supprime un jour
    @DeleteMapping("/supprimer/{id}")
    public ResponseEntity<String> deleteJour(@PathVariable Long id) {
        jourFerieService.supprimeFerie(id);
        return ResponseEntity.ok("Jour supprime");
    }
}
