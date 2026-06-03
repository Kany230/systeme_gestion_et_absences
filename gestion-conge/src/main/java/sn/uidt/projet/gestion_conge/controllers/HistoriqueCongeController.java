package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import sn.uidt.projet.gestion_conge.entities.HistoriqueConge;
import sn.uidt.projet.gestion_conge.services.HistoriqueCongeServices;

@RestController
@RequestMapping("/api/historique")
public class HistoriqueCongeController {

    @Autowired
    private HistoriqueCongeServices historiqueCongeServices;

    @GetMapping("/conges")
    public ResponseEntity<List<HistoriqueConge>> getAll() {
        return ResponseEntity.ok(historiqueCongeServices.getAll());
    }

    @GetMapping("/conges/{userId}")
    public ResponseEntity<List<HistoriqueConge>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(historiqueCongeServices.getByUserId(userId));
    }
}
