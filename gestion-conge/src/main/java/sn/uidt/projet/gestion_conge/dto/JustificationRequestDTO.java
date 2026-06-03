package sn.uidt.projet.gestion_conge.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class JustificationRequestDTO {

    private String motifJustifie;
    private MultipartFile file;
}
