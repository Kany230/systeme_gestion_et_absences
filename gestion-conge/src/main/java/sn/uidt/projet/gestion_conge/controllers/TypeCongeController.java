package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.entities.TypeConge;
import sn.uidt.projet.gestion_conge.services.TypeCongeService;

@RestController
@RequestMapping("/api/type-conge")
@CrossOrigin(origins = "*")
public class TypeCongeController {

    @Autowired
    private TypeCongeService typeCongeService;

    //Liste de toutes les type de conges 
    @GetMapping("/types")
    public List<TypeConge> getAll() {
        return typeCongeService.tousLesType();
    }

    //Ajouter un type
    @PostMapping("/create")
    public ResponseEntity<TypeConge> ajouterType(@RequestBody TypeConge type) {
        return ResponseEntity.ok(typeCongeService.creerTypeConge(type));
    }

    //Show type
    @GetMapping("/show/{id}")
    public ResponseEntity<TypeConge> showType(@PathVariable Long id) {
        return ResponseEntity.ok(typeCongeService.getTypeId(id));
    }

    //Supprime type
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteType(@PathVariable Long id) {
        typeCongeService.supprimerType(id);
        return ResponseEntity.ok("Type supprime");
    }
}
