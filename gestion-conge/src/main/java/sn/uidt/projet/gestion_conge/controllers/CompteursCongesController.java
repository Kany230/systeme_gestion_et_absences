package sn.uidt.projet.gestion_conge.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.entities.CompteursConges;
import sn.uidt.projet.gestion_conge.services.CompteursCongesService;

@RestController
@RequestMapping("/api/comptes-conges")
@CrossOrigin(origins = "*")
public class CompteursCongesController {

    @Autowired
    private CompteursCongesService compteursCongesService;

    //Consulter le solde d'un user
    @GetMapping("/user/{userId}")
    public ResponseEntity<CompteursConges> getSoldeById(@PathVariable Long userId) {
        CompteursConges compteurs = compteursCongesService.consulterSoldeUser(userId);
        return ResponseEntity.ok(compteurs);
    }

    //Modifier le solde
    @PutMapping("/modifier/{id}")
    public ResponseEntity<String> modifierSolde(@PathVariable Long id, @RequestParam double newSolde, @RequestParam String motif) {
        compteursCongesService.ajouterSoldeParRH(id, newSolde, motif);
        return ResponseEntity.ok("Le solde est modifie par RH");
    }

    //Executer l'ajout chaque mois
    @PostMapping("/execute-ajout-mois")
    public ResponseEntity<String> declenche() {
        compteursCongesService.ajoutDuMois();
        return ResponseEntity.ok("L'ajout du mois est execute");
    }
}
