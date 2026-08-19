package sn.uidt.projet.gestion_conge.services;

import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.dto.UserDTO;
import sn.uidt.projet.gestion_conge.dto.UserMapper;
import sn.uidt.projet.gestion_conge.entities.Departement;
import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.DepartementRepository;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private CompteursCongesService compteursCongesService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur avec l'email " + email + " introuvable"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    @Transactional
    public UserDTO creerUser(UserDTO userDto, Double soldeInitial, String passwordBrut, Long departementId) {


        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Un collaborateur possède déjà cette adresse e-mail.");
        }

        User user = userMapper.toEntity(userDto);

        String prefixeDepartement = "MAT";

        if (departementId != null) {
            Departement dept = departementRepository.findById(departementId)
                    .orElseThrow(() -> new RuntimeException("Le département sélectionné est introuvable."));

            user.setDepartement(dept);

            String nomDeptNettoye = dept.getNom().trim().replaceAll("[^a-zA-Z]", "").toUpperCase();
            if (nomDeptNettoye.length() >= 3) {
                prefixeDepartement = nomDeptNettoye.substring(0, 3);
            } else if (!nomDeptNettoye.isEmpty()) {
                prefixeDepartement = nomDeptNettoye;
            }
        } else {
            throw new RuntimeException("L'affectation d'un département est obligatoire pour générer le matricule.");
        }

        String anneeCourante = String.valueOf(Year.now().getValue());
        String identifiantUnique = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        String matriculeAutomatique = prefixeDepartement + "-" + anneeCourante + "-" + identifiantUnique;
        user.setMatricule(matriculeAutomatique);

        user.setPassword(passwordEncoder.encode(passwordBrut));

        User userEnregistre = userRepository.save(user);

        compteursCongesService.creerOuImporteCompteur(soldeInitial, userEnregistre);

        try {
            emailService.envoyerEmailBienvenue(userEnregistre.getEmail(), userEnregistre.getPrenom(), passwordBrut);
        } catch (Exception e) {
            System.err.println("Avertissement : Impossible d'envoyer l'e-mail à l'adresse "
                    + userEnregistre.getEmail() + ". Détail : " + e.getMessage());
        }

        return userMapper.toDTO(userEnregistre);
    }

    @Transactional
    public void importerUser(List<User> users) {
        for (User u : users) {
            if (!userRepository.existsByEmail(u.getEmail())) {
                String rawPassword = (u.getPassword() != null) ? u.getPassword() : "Passer123";
                u.setPassword(passwordEncoder.encode(rawPassword));

                User saved = userRepository.save(u);
                compteursCongesService.creerOuImporteCompteur(0.0, saved);
            }
        }
    }

    @Transactional
    public void assignerManager(Long userId, Long chefId, Long managerId) {

        User managerConnecte = userRepository.findById(managerId).orElseThrow(() -> new RuntimeException("Manager introuvable"));

        if (managerConnecte.getRole() != Role.manager) {
            throw new RuntimeException("Seul un manager peut assigner un chef d'équipe");
        }

        if (userId.equals(chefId)) {
            throw new RuntimeException("Un employé ne peut pas être son propre chef d'équipe");
        }

        User employe = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Employé introuvable avec l'ID : " + userId));

        User chefEquipe = userRepository.findById(chefId).orElseThrow(() -> new RuntimeException("Chef d'Équipe introuvable avec l'ID : " + chefId));

        if (chefEquipe.getRole() != Role.chef_equipe) {
            throw new RuntimeException("L'utilisateur sélectionné n'est pas un Chef d'Équipe");
        }

        if (!employe.getDepartement().getId().equals(chefEquipe.getDepartement().getId())) {
            throw new RuntimeException("Le chef d'équipe doit appartenir au même département");
        }

        if (!employe.getDepartement().getId().equals(managerConnecte.getDepartement().getId())) {
            throw new RuntimeException("Vous ne pouvez assigner que des employés de votre département");
        }

        employe.setChefEquipe(chefEquipe);
        userRepository.save(employe);
    }

    public List<UserDTO> tousUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserDTO> ListeParMonEquipe(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'ID : " + userId));

        return userRepository.findByDepartementId(user.getDepartement().getId())
                .stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());

    }


    @Transactional
    public List<UserDTO> getManagersParDepartement(Long deptId) {
        return userRepository.findManagersByDepartement(deptId).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserDTO> getMonEquipeComplete(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<User> equipe;

        // Si l'utilisateur est un chef (n'a pas de chef au-dessus),
        // on récupère ses subordonnés directs.
        if (user.getChefEquipe() == null) {
            equipe = userRepository.findByChefEquipeId(user.getId());
        } else {
            // S'il est un employé, on récupère son équipe + son chef
            equipe = userRepository.findByChefEquipeId(user.getChefEquipe().getId());
            if (!equipe.contains(user.getChefEquipe())) {
                equipe.add(user.getChefEquipe());
            }
        }

        // Filtrage et mapping sécurisé
        return equipe.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO trouverParId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO trouverParEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'email : " + email));
        return userMapper.toDTO(user);
    }

    @Transactional
    public void supprimerUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable");
        }
        userRepository.detachSubordinates(id);
        userRepository.detachChefEquipe(id);
        userRepository.supprimerPointages(id);
        userRepository.deleteById(id);
    }

    @Transactional
    public UserDTO modifierUser(Long userId, UserDTO detailsDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setNom(detailsDto.getNom());
        user.setPrenom(detailsDto.getPrenom());
        user.setEmail(detailsDto.getEmail());
        user.setRole(detailsDto.getRole());

        if (detailsDto.getMatricule() != null) {
            user.setMatricule(detailsDto.getMatricule());
        }
        if (detailsDto.getTelephone() != null) {
            user.setTelephone(detailsDto.getTelephone());
        }
        if (detailsDto.getPoste() != null) {
            user.setPoste(detailsDto.getPoste());
        }
        if (detailsDto.getDateEmbauche() != null) {
            user.setDateEmbauche(detailsDto.getDateEmbauche());
        }

        User misAJour = userRepository.save(user);
        return userMapper.toDTO(misAJour);
    }

    @Transactional
    public void modifierMotDePasse(Long userId, String ancienMdp, String newMdp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (ancienMdp != null) {
            if (!passwordEncoder.matches(ancienMdp, user.getPassword())) {
                throw new RuntimeException("L'ancien mot de passe est incorrect");
            }
        }

        user.setPassword(passwordEncoder.encode(newMdp));
        userRepository.save(user);
    }

    @Transactional
    public List<UserDTO> getUsersByDepartement(Long deptId) {
        return userRepository.findByDepartementId(deptId).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}
