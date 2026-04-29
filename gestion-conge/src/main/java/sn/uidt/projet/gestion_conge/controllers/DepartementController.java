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

import sn.uidt.projet.gestion_conge.entities.Departement;
import sn.uidt.projet.gestion_conge.services.DepartementService;

@RestController
@RequestMapping("/api/departement")
@CrossOrigin(origins = "*")
public class DepartementController {

    @Autowired
    private DepartementService departementService;

    //Creer un departement
    @PostMapping("/creer")
    public ResponseEntity<Departement> creerDept(@RequestBody Departement departement) {

        Departement dept = departementService.createDepartement(departement);

        return ResponseEntity.ok(dept);
    }

    //Lister tous les departements
    @GetMapping("/departements")
    public List<Departement> departements() {
        return departementService.tousLesDepartements();
    }

    //Voir un departement
    @GetMapping("/show/{id}")
    public ResponseEntity<Departement> getDepartement(@PathVariable Long id) {
        return ResponseEntity.ok(departementService.voirDepartement(id));
    }

    //Supprimer un departement
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteDepartement(@PathVariable Long id) {
        departementService.supprimerDepartement(id);
        return ResponseEntity.ok("Departement supprime");
    }

    //Assigner chef au departement
    @PutMapping("/{deptId}/chef/{managerId}")
    public ResponseEntity<Departement> assigneChef(@PathVariable Long managerId, @PathVariable Long deptId) {
        return ResponseEntity.ok(departementService.chefDepartement(deptId, managerId));
    }
}
