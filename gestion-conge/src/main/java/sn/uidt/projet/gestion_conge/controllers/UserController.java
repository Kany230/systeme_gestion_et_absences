package sn.uidt.projet.gestion_conge.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.services.ExcelService;
import sn.uidt.projet.gestion_conge.services.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private ExcelService excelService;

    //Creer un utilisateur
    @PostMapping("/creer")
    public ResponseEntity<User> creerUser(@RequestBody User user, @RequestParam(defaultValue = "0.0") Double solde) {
        User newUser = userService.creerUser(user, solde);
        return ResponseEntity.ok(newUser);
    }

    //Importer une liste 
    @PostMapping("/import-excel")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Le fichier est vide");
        }

        try {
            excelService.importerUtilisateurs(file.getInputStream());
            return ResponseEntity.ok("Importation de la liste réussie !");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur : " + e.getMessage());
        }
    }

    //Trouver l'utilisateur
    @GetMapping("/by-email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.trouverParEmail(email);
        return ResponseEntity.ok(user);
    }

    //Lister tout le monde
    @GetMapping
    public List<User> getUsers() {
        return userService.tousUsers();
    }

    //Lister tous les membres d'un equipe
    @GetMapping("/manager/{id}")
    public List<User> getEquipe(@PathVariable Long id) {
        return userService.ListeParMonEquipe(id);
    }

    //Lister tous les membres d'un equipe
    @GetMapping("/departement/{id}")
    public List<User> getDepartement(@PathVariable Long id) {
        return userService.ListeParDepartement(id);
    }

    //Assigner un manager a un employe
    @PutMapping("/{userId}/assigner-manager/{managerId}")
    public ResponseEntity<String> assignerManager(@PathVariable Long userId, @PathVariable Long managerId) {
        userService.assignerManger(userId, managerId);
        return ResponseEntity.ok("Assignation faite");
    }

    //Modifier un utilisateur
    @PutMapping("/modifier/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.modifierUser(id, user));
    }

    @PatchMapping("/{id}/modifier-mdp")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {

        String ancienMdp = passwords.get("ancienMdp");
        String newMdp = passwords.get("newMdp");

        userService.modifierMotDePasse(id, ancienMdp, newMdp);
        return ResponseEntity.ok("Mot de passe mis à jour");
    }

    //Supprimer un utilisateur
    @DeleteMapping("/supprimer/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        userService.supprimerUser(id);
        return ResponseEntity.ok("User supprime");
    }
}
