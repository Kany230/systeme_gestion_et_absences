package sn.uidt.projet.gestion_conge.services;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.Absence;
import sn.uidt.projet.gestion_conge.entities.Pointage;
import sn.uidt.projet.gestion_conge.entities.StatutAbsence;
import sn.uidt.projet.gestion_conge.entities.StatutPointage;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.*;

@Service
public class PointageService {

    @Autowired
    private PointageRepository pointageRepository;

    @Autowired
    private AbsenceRepository absenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JourFerieRepository jourFerieRepository;

    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    private static final LocalTime heureLimite = LocalTime.of(12, 30);
    private static final LocalTime heureLimitePointage = LocalTime.of(14, 0);
    private static final LocalTime heureOuverture = LocalTime.of(7, 0);

    private void disponibilitePointage(){
        LocalDate now =  LocalDate.now();
        LocalTime nowHour = LocalTime.now();
        DayOfWeek today = now.getDayOfWeek();

        if (today == DayOfWeek.SUNDAY){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aujourd'hui c'est Dimanche, donc il n'y a pas de pointage");
        }

        if (jourFerieRepository.existsByDate(now)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Jour ferie, donc il n'y a pas de pointage");
        }

        if (nowHour.isBefore(heureOuverture)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le pointage n'est pas encore disponible. Revenez à partir de 06h.");
        }

        if (nowHour.isAfter(heureLimitePointage)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le pointage est clôturé après 12h. Revenez demain.");
        }
    }

    // Pointage arrivée
    public Pointage pointageArrive(Long userId) {
        disponibilitePointage();
        LocalDate date = LocalDate.now();
        LocalTime heure = LocalTime.now();

        boolean estEnConge = demandeCongeRepository.isUserEnCongeValide(userId, date);
        if (estEnConge){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous êtes en congé aujourd'hui, le pointage n'est pas autorisé");
        }

        Optional<Pointage> existant = pointageRepository.findByUserIdAndDate(userId, date);

        if (existant.isPresent()) {
            Pointage p = existant.get();

            // Pointage absent généré automatiquement → on le met à jour
            if (p.getStatut() == StatutPointage.absent && p.getHeureArrive() == null) {

                if (heure.isAfter(heureLimitePointage)){
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le pointage est cloture apres 12h. Revenez demain");
                }
                p.setHeureArrive(heure);
                p.setEstEnConge(false);
                p.setStatut(heure.isAfter(heureLimite)
                        ? StatutPointage.retard
                        : StatutPointage.present);
                return pointageRepository.save(p);
            }

            // Sinon, déjà pointé manuellement
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vous avez déjà pointé votre arrivée aujourd'hui"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Utilisateur introuvable"
        ));

        Pointage pointage = new Pointage();
        pointage.setUser(user);
        pointage.setDate(date);
        pointage.setHeureArrive(heure);
        pointage.setEstEnConge(false);
        pointage.setStatut(heure.isAfter(heureLimite)
                ? StatutPointage.retard
                : StatutPointage.present);

        return pointageRepository.save(pointage);
    }

// Pointage départ
    public Pointage pointageDepart(Long userId) {

        LocalDate today = LocalDate.now();

        Pointage pointage = pointageRepository.findByUserIdAndDate(userId, today)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Vous n'avez pas encore pointé votre arrivée"
        ));

        if (pointage.getHeureArrive() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vous n'avez pas encore pointé votre arrivée"
            );
        }

        if (pointage.getHeureDepart() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vous avez déjà enregistré votre heure de sortie"
            );
        }

        pointage.setHeureDepart(LocalTime.now());
        return pointageRepository.save(pointage);
    }


    @Transactional
    public void detecterAbsences() {
        LocalDate today = LocalDate.now();
        LocalTime  heure = LocalTime.now();

        if (today.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Détection annulée : c'est dimanche.");

        }
        if (jourFerieRepository.existsByDate(today)) {

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Détection annulée : c'est Ferie.");
        }

        if (heure.isBefore(heureLimitePointage)){

            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "C'est trop tot pour detecter les absents.");
        }
        List<User> users = userRepository.findAll();

        for (User user : users) {
            // Vérifier si un pointage existe déjà (présent ou retard)
            Optional<Pointage> pointageExistant = pointageRepository.findByUserIdAndDate(user.getId(), today);

            if (pointageExistant.isEmpty()) {
                // Vérifier si l'utilisateur est en congé VALIDÉ
                boolean enConge = user.getDemandeConges() != null && user.getDemandeConges().stream()
                        .anyMatch(d -> "validee".equals(d.getStatut())
                        && d.getDateDebut() != null
                        && d.getDateFin() != null
                        && !today.isBefore(d.getDateDebut())
                        && !today.isAfter(d.getDateFin()));

                // Créer un pointage de type absent
                Pointage absent = new Pointage();
                absent.setUser(user);
                absent.setDate(today);
                absent.setStatut(StatutPointage.absent);
                absent.setEstEnConge(enConge);
                pointageRepository.save(absent);

                // Si pas en congé, on crée une absence à justifier
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
    public List<Pointage> ListParEquipe(Long chefId) {

        return pointageRepository.findByManagerId(chefId);
    }

    public List<Pointage> ListParDepartement(Long managerId) {

        return pointageRepository.findByManagerDepartementId(managerId);
    }

    public List<Pointage> getAll() {
        return pointageRepository.findAll();
    }

    public List<Pointage> getAbsences() {
        return pointageRepository.findByStatut(StatutPointage.absent);
    }

    // ✅ Ajouter dans PointageService
    public List<Pointage> ListParUser(Long userId) {
        return pointageRepository.findByUserId(userId);
    }

    public List<Pointage> getRetards() {
        return pointageRepository.findByStatut(StatutPointage.retard);
    }
}
