package sn.uidt.projet.gestion_conge.Services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import sn.uidt.projet.gestion_conge.entities.Absence;
import sn.uidt.projet.gestion_conge.entities.Pointage;
import sn.uidt.projet.gestion_conge.entities.StatutAbsence;
import sn.uidt.projet.gestion_conge.entities.StatutPointage;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.AbsenceRepository;
import sn.uidt.projet.gestion_conge.repositories.PointageRepository;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;

@Service
public class PointageService {

    @Autowired
    private PointageRepository pointageRepository;

    @Autowired
    private AbsenceRepository absenceRepository;

    @Autowired
    private UserRepository userRepository;

    private static final LocalTime heureLimite = LocalTime.of(8, 30);

    //Pointage arrive
    public Pointage pointageArrive(Long userId) {

        LocalDate date = LocalDate.now();
        LocalTime heure = LocalTime.now();

        if (pointageRepository.findByUserIdAndDate(userId, date).isPresent()) {
            throw new RuntimeException("Tu as deja pointe");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Pointage pointage = new Pointage();
        pointage.setUser(user);
        pointage.setDate(date);
        pointage.setHeureArrive(heure);
        pointage.setEstEnConge(false);

        if (heure.isAfter(heureLimite)) {
            pointage.setStatut(StatutPointage.retard);
        } else {
            pointage.setStatut(StatutPointage.absent);
        }

        return pointageRepository.save(pointage);

    }

    //Pointage depart
    public Pointage pointageDepart(Long userId) {
        LocalDate today = LocalDate.now();

        Pointage pointage = pointageRepository.findByUserIdAndDate(userId, today).orElseThrow(() -> new RuntimeException("Vous n'avez pas pointer votre arrive"));

        if (pointage.getHeureDepart() != null) {
            throw new RuntimeException("Vous avez deja engistre votre heure de sortie");
        }

        pointage.setHeureDepart(LocalTime.now());
        return pointageRepository.save(pointage);
    }

    //detecter les absences à partir de 10h
    @Scheduled(cron = "0 0 10 * * MON-FRI")
    public void detecterAbsences() {
        LocalDate today = LocalDate.now();
        List<User> users = userRepository.findAll();

        for (User user : users) {
            //faire une recherche dans la BD et le garder
            Optional<Pointage> pointage = pointageRepository.findByUserIdAndDate(user.getId(), today);

            if (pointage.isEmpty()) {
                //On verifie si il est en conge
                boolean enConge = user.getDemandeConges() != null && user.getDemandeConges().stream().anyMatch(d -> d.getDateDebut() != null && d.getDateFin() != null && !today.isBefore(d.getDateDebut()) && ! !today.isAfter(d.getDateFin()));

                //Creer un pointage absence
                Pointage absent = new Pointage();
                absent.setUser(user);
                absent.setDate(today);
                absent.setStatut(StatutPointage.absent);
                absent.setEstEnConge(enConge);
                pointageRepository.save(absent);

                //S'il n'est pas en conge on cree une absence
                if (!enConge) {
                    Absence newAbsence = new Absence();
                    newAbsence.setUser(user);
                    newAbsence.setDateAbsence(today);
                    newAbsence.setDateDetecter(today);
                    newAbsence.setStatut(StatutAbsence.pas_justifie);
                    absenceRepository.save(newAbsence);
                }
            }
        }
    }

    //LES LISTES
    public List<Pointage> ListParEquipe(Long managerId) {
        return pointageRepository.findByManagerId(managerId);
    }

    public List<Pointage> ListParDepartement(Long departementId) {
        return pointageRepository.findByDepartemntId(departementId);
    }

    public List<Pointage> getAll() {
        return pointageRepository.findAll();
    }

    public List<Pointage> getAbsences() {
        return pointageRepository.findByStatut(StatutPointage.absent);
    }

    public List<Pointage> getRetards() {
        return pointageRepository.findByStatut(StatutPointage.retard);
    }
}
