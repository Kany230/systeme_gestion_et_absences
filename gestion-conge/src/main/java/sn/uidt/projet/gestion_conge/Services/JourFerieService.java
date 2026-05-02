package sn.uidt.projet.gestion_conge.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import sn.uidt.projet.gestion_conge.entities.JourFerie;
import sn.uidt.projet.gestion_conge.repositories.JourFerieRepository;

@Service
public class JourFerieService {

    @Autowired
    private JourFerieRepository jourFerieRepository;

    private JourFerie creerObjet(LocalDate date, String nom) {
        JourFerie jf = new JourFerie();
        jf.setDate(date);
        jf.setNom(nom);
        return jf;
    }

    //initialiser les jours feries qui ne change pas
    @Transactional
    public void initialiseAnnee(int annee) {
        List<JourFerie> feteFixes = List.of(
                creerObjet(LocalDate.of(annee, 1, 1), "Jour de l'an"),
                creerObjet(LocalDate.of(annee, 4, 4), "Fête de l'Indépendance"),
                creerObjet(LocalDate.of(annee, 5, 1), "Fête du Travail"),
                creerObjet(LocalDate.of(annee, 12, 25), "Noël"),
                creerObjet(LocalDate.of(annee, 8, 15), "Assomption"),
                creerObjet(LocalDate.of(annee, 11, 1), "Toussaint"),
                creerObjet(LocalDate.of(annee, 12, 25), "Noël"),
                creerObjet(LocalDate.of(annee, 5, 25), "Pentecote"),
                creerObjet(LocalDate.of(annee, 4, 6), "Paques")
        );

        for (JourFerie jf : feteFixes) {
            if (!jourFerieRepository.existsByDate(jf.getDate())) {
                jourFerieRepository.save(jf);
            }
        }
    }

    //Creer un jours pour ce qui depend de la lune
    public JourFerie ajouterDate(LocalDate date, String nom) {

        if (jourFerieRepository.existsByDate(date)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "La date " + date + " est déjà dans le calendrier"
            );
        }

        JourFerie jf = new JourFerie();
        jf.setDate(date);
        jf.setNom(nom);

        return jourFerieRepository.save(jf);
    }

    //Lister Tous les jours feries
    public List<JourFerie> listeFeries() {
        return jourFerieRepository.findAll();
    }

    @Transactional
    public JourFerie modifiFerie(Long id, String newName, LocalDate newDate) {
        JourFerie jf = jourFerieRepository.findById(id).orElseThrow(() -> new RuntimeException("Jour introuvable"));

        if (!jf.getDate().equals(newDate) && jourFerieRepository.existsByDate(newDate)) {
            throw new RuntimeException("Date existe deja");
        }

        jf.setDate(newDate);
        jf.setNom(newName);

        return jourFerieRepository.save(jf);
    }

    //Supprime une date
    public void supprimeFerie(Long id) {
        if (!jourFerieRepository.existsById(id)) {
            throw new RuntimeException("cette date n'existe pas");
        }

        jourFerieRepository.deleteById(id);
    }
}
