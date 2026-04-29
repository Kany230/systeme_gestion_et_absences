package sn.uidt.projet.gestion_conge.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.UserRepository;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompteursCongesService compteursCongesService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    //Connexion
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Utilisateur avec l'email " + email + " introuvable"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .roles(user.getRole().name())
                .build();
    }

    //Inscription
    @Transactional
    public User creerUser(User user, Double soldeInitial) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Cet email existe deja");
        }

        String mdpBrut = user.getPassword();

        //Encodage du mot de passe avant sauvegarde
        user.setPassword(passwordEncoder.encode(mdpBrut));

        User enregistreUser = userRepository.save(user);

        //Initialisation automatique du compteur de congrs
        compteursCongesService.creerOuImporteCompteur(soldeInitial, enregistreUser);

        try {
            emailService.envoyerEmailBienvenue(user.getEmail(), user.getPrenom(), mdpBrut);
        } catch (Exception e) {
            System.err.println("Erreur d'envoi d'email : " + e.getMessage());
        }

        return enregistreUser;
    }

    //Importation excel
    @Transactional
    public void importerUser(List<User> users) {
        for (User u : users) {
            if (!userRepository.existsByEmail(u.getEmail())) {
                //On definie MDP par defaut
                String rawPassword = (u.getPassword() != null) ? u.getPassword() : "Passer123";
                u.setPassword(passwordEncoder.encode(rawPassword));

                User saved = userRepository.save(u);
                compteursCongesService.creerOuImporteCompteur(0.0, saved);
            }
        }
    }

    @Transactional
    public void assignerManger(Long userId, Long managerId) {
        if (userId.equals(managerId)) {
            throw new RuntimeException("Un employe ne peut pas etre son propre chef");
        }

        User employe = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Employe introuvable"));

        User manager = userRepository.findById(managerId).orElseThrow(() -> new RuntimeException("Manager introuvable"));

        employe.setManager(manager);
        userRepository.save(employe);
    }

    public List<User> tousUsers() {
        return userRepository.findAll();
    }

    public List<User> ListeParDepartement(Long departementId) {
        return userRepository.findByDepartementId(departementId);
    }

    public List<User> ListeParMonEquipe(Long managerId) {
        return userRepository.findByManagerId(managerId);
    }

    @Transactional
    public void supprimerUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur introuvable");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public User modifierUser(Long userId, User details) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setNom(details.getNom());
        user.setPrenom(details.getPrenom());
        user.setEmail(details.getEmail());
        user.setMatricule(details.getMatricule());
        user.setDateEmbauche(details.getDateEmbauche());
        user.setTelephone(details.getTelephone());
        user.setRole(details.getRole());
        user.setDepartement(details.getDepartement());

        return userRepository.save(user);
    }

    public User trouverParEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'email : " + email));
    }

    /**
     * Modifie le mot de passe d'un utilisateur.
     *
     * @param userId ID de l'utilisateur
     * @param ancienMdp Mot de passe actuel (peut être null si c'est un admin
     * qui force le changement)
     * @param nouveauMdp Nouveau mot de passe à encoder
     */
    @Transactional
    public void modifierMotDePasse(Long userId, String ancienMdp, String newMdp) {

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        //Si un ancien mot de passe est fourni, on verifie s'il correspond
        if (ancienMdp != null) {
            if (!passwordEncoder.matches(ancienMdp, user.getPassword())) {
                throw new RuntimeException("L'ancien mot de passe est incorrect");
            }
        }

        // Hachage et mise à jour du nouveau mot de passe
        user.setPassword(passwordEncoder.encode(newMdp));
        userRepository.save(user);
    }
}
