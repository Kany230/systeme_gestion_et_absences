package sn.uidt.projet.gestion_conge.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void envoyerEmailBienvenue(String to, String nom, String motDePasseProvisoire) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Bienvenue sur la plateforme Gestion-Congé");
        message.setText("Bonjour " + nom + ",\n\n" +
                "Votre compte a été créé avec succès.\n" +
                "Voici vos identifiants de connexion :\n" +
                "Email : " + to + "\n" +
                "Mot de passe provisoire : " + motDePasseProvisoire + "\n\n" +
                "Veuillez changer votre mot de passe dès votre première connexion.\n" +
                "Cordialement,\nL'administration.");
        
        mailSender.send(message);
    }
}