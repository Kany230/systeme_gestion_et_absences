package sn.uidt.projet.gestion_conge.dto;
import lombok.Data;

@Data
public class UserCreateRequest {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String poste;
    private String password;
    private String role;
    private String dateEmbauche;
    private Long departementId;
}
