package sn.uidt.projet.gestion_conge.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import sn.uidt.projet.gestion_conge.entities.Absence;
import sn.uidt.projet.gestion_conge.entities.DemandeConge;
import sn.uidt.projet.gestion_conge.entities.StatutAbsence;
import sn.uidt.projet.gestion_conge.repositories.AbsenceRepository;
import sn.uidt.projet.gestion_conge.repositories.DemandeCongeRepository;

@Service
public class AbsenceService {

    @Autowired
    private AbsenceRepository absenceRepository;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    private final String UPLOAD_DIR = "uploads/justificatifs/";

    @Scheduled(cron = "0 0 8 * * *")//tous les jours à 08h
    public void detecterAbsence() {
        List<DemandeConge> lesRetards = demandeCongeRepository.findRetards(LocalDate.now());

        for (DemandeConge demandeConge : lesRetards) {
            boolean dejaEnregiste = absenceRepository.findByUserId(demandeConge.getUser().getId()).stream().anyMatch(a -> a.getDemandeConge().getId().equals(demandeConge.getId()));

            if (!dejaEnregiste) {
                Absence absence = new Absence();
                absence.setUser(demandeConge.getUser());
                absence.setDemandeConge(demandeConge);
                absence.setDateAbsence(demandeConge.getDateFin().plusDays(1));
                absence.setDateDetecter(LocalDate.now());
                absence.setStatut(StatutAbsence.pas_justifie);
                absenceRepository.save(absence);
            }
        }
    }

    // Assurez-vous que le paramètre s'appelle bien "file" ici 👇
    public Absence justifierAbsence(Long absenceId, String motifAbsence, MultipartFile file) {
        Absence absence = absenceRepository.findById(absenceId).orElseThrow(() -> new RuntimeException("L'absence n'a pas été trouvée"));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            //Remplacer fichier.getOriginalFilename() par file.getOriginalFilename()
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            //Remplacer fichier.getInputStream() par file.getInputStream()
            Files.copy(file.getInputStream(), filePath);

            String justificationUrl = "/uploads/justificatifs/" + fileName;

            absence.setMotifJustifie(motifAbsence);
            absence.setJustificationUrl(justificationUrl);
            absence.setStatut(StatutAbsence.justifie);

            return absenceRepository.save(absence);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier : " + e.getMessage());
        }
    }

    //Lister les absences d'un utilisateur
    public List<Absence> listParUser(Long userId) {
        return absenceRepository.findByUserId(userId);
    }

    //Lister les absences d'une equipe
    public List<Absence> listParEquipe(Long managerId) {
        return absenceRepository.findByDepartementId(managerId);
    }

    //Lister les absences d'un departement
    public List<Absence> listParDepartement(Long departementId) {
        return absenceRepository.findByDepartementId(departementId);
    }

    //Lister Tous les absences
    public List<Absence> getAll() {
        return absenceRepository.findAll();
    }
}
