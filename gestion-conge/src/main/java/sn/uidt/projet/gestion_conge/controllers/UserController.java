package sn.uidt.projet.gestion_conge.controllers;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
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

import sn.uidt.projet.gestion_conge.config.JwtUtils;
import sn.uidt.projet.gestion_conge.dto.UserCreateRequest;
import sn.uidt.projet.gestion_conge.dto.UserDTO;
import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.services.ExcelService;
import sn.uidt.projet.gestion_conge.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.get("email"),
                            loginRequest.get("password")
                    )
            );

            String token = jwtUtils.generateToken(loginRequest.get("email"));
            UserDTO userDTO = userService.trouverParEmail(loginRequest.get("email"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userDTO);

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect"));
        }
    }

    @PostMapping("/creer")
    public ResponseEntity<UserDTO> creerUser(
            @RequestBody UserCreateRequest request,
            @RequestParam(defaultValue = "0.0") Double solde) {

        UserDTO userDto = new UserDTO();
        userDto.setNom(request.getNom());
        userDto.setPrenom(request.getPrenom());
        userDto.setEmail(request.getEmail());
        userDto.setTelephone(request.getTelephone());
        userDto.setPoste(request.getPoste());

        // Role protégé
        try {
            userDto.setRole(Role.valueOf(request.getRole().trim()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        // Date protégée
        if (request.getDateEmbauche() != null && !request.getDateEmbauche().isBlank()) {
            try {
                userDto.setDateEmbauche(LocalDate.parse(request.getDateEmbauche()));
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }

        UserDTO created = userService.creerUser(
                userDto, solde, request.getPassword(), request.getDepartementId()
        );
        return ResponseEntity.ok(created);
    }

    @GetMapping("/equipe-complete/{userId}")
    public ResponseEntity<List<UserDTO>> getEquipeComplete(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getMonEquipeComplete(userId));
    }

    @PostMapping("/import-excel")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            excelService.importerUtilisateurs(file.getInputStream());
            return ResponseEntity.ok("Importation réussie");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.tousUsers());
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.trouverParEmail(email));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<UserDTO>> getEquipe(@PathVariable Long managerId) {
        return ResponseEntity.ok(userService.ListeParMonEquipe(managerId));
    }

    @GetMapping("/chef-equipe/{chefId}")
    public ResponseEntity<List<UserDTO>> getByChefEquipe(@PathVariable Long chefId) {
        return ResponseEntity.ok(userService.getMonEquipeComplete(chefId));
    }

    @GetMapping("/departement/{deptId}/managers")
    public ResponseEntity<List<UserDTO>> getManagersByDept(@PathVariable Long deptId) {
        return ResponseEntity.ok(userService.getManagersParDepartement(deptId));
    }

    @GetMapping("/departement/{deptId}")
    public ResponseEntity<List<UserDTO>> getByDepartement(@PathVariable Long deptId) {
        return ResponseEntity.ok(userService.getUsersByDepartement(deptId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.trouverParId(id));
    }

    @PutMapping("/{userId}/assigner-manager/{chefId}")
    public ResponseEntity<String> assignerManager(
            @PathVariable Long userId,
            @PathVariable Long chefId,
            @RequestParam Long managerId) {
        userService.assignerManager(userId, chefId, managerId);
        return ResponseEntity.ok("Assignation effectuée");
    }

    @PutMapping("/modifier/{id}")
    public ResponseEntity<UserDTO> update(
            @PathVariable Long id,
            @RequestBody UserDTO userDto) {
        return ResponseEntity.ok(userService.modifierUser(id, userDto));
    }

    @PatchMapping("/{id}/modifier-mdp")
    public ResponseEntity<String> updatePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        userService.modifierMotDePasse(
                id,
                payload.get("oldPassword"),
                payload.get("newPassword")
        );

        return ResponseEntity.ok("Mot de passe mis à jour");
    }

    @DeleteMapping("/supprimer/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        userService.supprimerUser(id);
        return ResponseEntity.ok("Utilisateur supprimé");
    }

}
