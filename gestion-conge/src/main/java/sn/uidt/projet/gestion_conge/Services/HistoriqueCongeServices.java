package sn.uidt.projet.gestion_conge.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sn.uidt.projet.gestion_conge.entities.HistoriqueConge;
import sn.uidt.projet.gestion_conge.repositories.HistoriqueCongeRepository;

@Service
public class HistoriqueCongeServices {

    @Autowired
    private HistoriqueCongeRepository historiqueCongeRepository;

    public List<HistoriqueConge> getAll() {
        return historiqueCongeRepository.findAllByOrderByDateModificationDesc();
    }

    public List<HistoriqueConge> getByUserId(Long userId) {
        return historiqueCongeRepository.findByUserIdOrderByDateModificationDesc(userId);
    }
}
