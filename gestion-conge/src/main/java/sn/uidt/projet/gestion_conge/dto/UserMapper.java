package sn.uidt.projet.gestion_conge.dto;

import org.springframework.stereotype.Component;

import sn.uidt.projet.gestion_conge.entities.User;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setMatricule(user.getMatricule());
        dto.setTelephone(user.getTelephone());
        dto.setPoste(user.getPoste());
        dto.setRole(user.getRole());
        dto.setDateEmbauche(user.getDateEmbauche());

        // Adaptation pour le département
        if (user.getDepartement() != null) {
            UserDTO.DepartementInfo deptInfo = new UserDTO.DepartementInfo();
            deptInfo.setId(user.getDepartement().getId());
            deptInfo.setNom(user.getDepartement().getNom());
            dto.setDepartement(deptInfo); // On passe l'objet complet au DTO
        }

        // Adaptation pour le manager
        if (user.getManager() != null) {
            UserDTO.ManagerInfo managerInfo = new UserDTO.ManagerInfo();
            managerInfo.setId(user.getManager().getId());
            managerInfo.setNom(user.getManager().getNom());
            managerInfo.setPrenom(user.getManager().getPrenom());
            dto.setManager(managerInfo); // On passe l'objet complet au DTO
        }

        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User entity = new User();
        entity.setId(dto.getId());
        entity.setNom(dto.getNom());
        entity.setPrenom(dto.getPrenom());
        entity.setEmail(dto.getEmail());
        entity.setMatricule(dto.getMatricule());
        entity.setTelephone(dto.getTelephone());
        entity.setPoste(dto.getPoste());
        entity.setRole(dto.getRole());
        entity.setDateEmbauche(dto.getDateEmbauche());

        // Note: Le département et le manager doivent toujours être chargés 
        // depuis la base de données par votre couche Service.
        return entity;
    }
}
