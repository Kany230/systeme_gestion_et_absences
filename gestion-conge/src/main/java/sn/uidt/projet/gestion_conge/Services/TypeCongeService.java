package sn.uidt.projet.gestion_conge.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sn.uidt.projet.gestion_conge.entities.TypeConge;
import sn.uidt.projet.gestion_conge.repositories.DemandeCongeRepository;
import sn.uidt.projet.gestion_conge.repositories.TypeCongeRepository;

@Service
public class TypeCongeService {
    @Autowired
    private TypeCongeRepository typeCongeRepository;
    @Autowired
    private DemandeCongeRepository demandeCongeRepository;

    //Liste toute les types de conge 
    public List<TypeConge> tousLesType(){
        return typeCongeRepository.findAll();
    }

    //Permet d'ajouter des types
    public TypeConge creerTypeConge(TypeConge typeConge){
        return typeCongeRepository.save(typeConge);
    }

    //Recupere un type par son id
    public TypeConge getTypeId(Long typeId){
        return typeCongeRepository.findById(typeId).orElseThrow(()->new RuntimeException("Type introuvable"));
    }

    //Supprime un type 
    public void supprimerType(Long typeId){
        boolean estUtilise = demandeCongeRepository.existsByTypeCongeId(typeId);

        if(estUtilise){
            throw new RuntimeException("Impossible de supprime");
        }

        typeCongeRepository.deleteById(typeId);
    }
}
