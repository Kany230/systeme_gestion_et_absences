package sn.uidt.projet.gestion_conge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeCongesDTO {
    private Long userId;
    private String userNom;
    private String userPrenom;
    private String userRole;
    private Integer totalJoursPris;
    private List<AllCongeValiderDTO> conges;
}
