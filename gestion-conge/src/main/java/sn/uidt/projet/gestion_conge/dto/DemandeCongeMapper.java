package sn.uidt.projet.gestion_conge.dto;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import sn.uidt.projet.gestion_conge.entities.DemandeConge;

@Component
public class DemandeCongeMapper {

    public DemandeCongeDTO toDTO(DemandeConge entity) {
        if (entity == null) {
            return null;
        }

        DemandeCongeDTO dto = new DemandeCongeDTO();
        dto.setId(entity.getId());
        dto.setDateDebut(entity.getDateDebut());
        dto.setDateFin(entity.getDateFin());
        dto.setNombreJoursDeduit(entity.getNombreJoursDeduit());
        dto.setStatut(entity.getStatut());
        dto.setJustificationUrl(entity.getJustificationUrl());
        dto.setUserId(entity.getUser().getId());
        dto.setUserNom(entity.getUser().getNom());
        dto.setUserPrenom(entity.getUser().getPrenom());
        dto.setUserMatricule(entity.getUser().getMatricule());

        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }

        if (entity.getTypeConge() != null) {
            dto.setTypeCongeId(entity.getTypeConge().getId());
            dto.setTypeCongeNom(entity.getTypeConge().getNomType());
        }

        return dto;
    }

    public List<DemandeCongeDTO> toDTOList(List<DemandeConge> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream().map(this::toDTO).collect(Collectors.toList());
    }
}
