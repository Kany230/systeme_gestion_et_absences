package sn.uidt.projet.gestion_conge.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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

    public Absence justifierAbsence(Long absenceId, String motifAbsence, String justificationUrl) {

        Absence abscence = absenceRepository.findById(absenceId).orElseThrow(() -> new RuntimeException("L'utilisateur n'est pas trouvée"));

        //Mis à jour des informations
        abscence.setMotifJustifie(motifAbsence);
        abscence.setJustificationUrl(justificationUrl);
        abscence.setStatut(StatutAbsence.justifie);

        return absenceRepository.save(abscence);

    }

    //Lister les absences d'un utilisateur
    public List<Absence> listParUser(Long userId) {
        return absenceRepository.findByUserId(userId);
    }

    //Lister les absences d'une equipe
    public List<Absence> listParEquipe(Long managerId) {
        return absenceRepository.findByManagerId(managerId);
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
