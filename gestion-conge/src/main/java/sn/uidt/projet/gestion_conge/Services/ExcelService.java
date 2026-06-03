package sn.uidt.projet.gestion_conge.services;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import sn.uidt.projet.gestion_conge.entities.Departement;
import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.entities.User;
import sn.uidt.projet.gestion_conge.repositories.DepartementRepository;

@Service
public class ExcelService {

    @Autowired
    private UserService userService;

    @Autowired
    private DepartementRepository departementRepository;

    @Transactional
    public void importerUtilisateurs(InputStream is) {
        DataFormatter formatter = new DataFormatter();
        List<User> utilisateursAImporter = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getCell(0) == null) {
                    continue;
                }

                try {
                    User user = new User();
                    user.setNom(formatter.formatCellValue(row.getCell(0)));
                    user.setPrenom(formatter.formatCellValue(row.getCell(1)));
                    user.setEmail(formatter.formatCellValue(row.getCell(2)));
                    user.setMatricule(formatter.formatCellValue(row.getCell(3)));
                    user.setPoste(formatter.formatCellValue(row.getCell(4)));
                    user.setTelephone(formatter.formatCellValue(row.getCell(5)));

                    String roleStr = formatter.formatCellValue(row.getCell(6)).trim().toLowerCase();
                    // Gestion souple de la casse pour éviter des crashs idiots sur l'enum (ex: "Chef_Equipe")
                    user.setRole(Role.valueOf(roleStr));

                    if (row.getCell(7) != null) {
                        try {
                            java.util.Date dateExcel = row.getCell(7).getDateCellValue();
                            user.setDateEmbauche(dateExcel.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate());
                        } catch (Exception e) {
                            user.setDateEmbauche(java.time.LocalDate.now());
                        }
                    } else {
                        user.setDateEmbauche(java.time.LocalDate.now());
                    }

                    String nomDepartement = formatter.formatCellValue(row.getCell(8));
                    Departement dept = departementRepository.findByNom(nomDepartement)
                            .orElseThrow(() -> new RuntimeException("Département '" + nomDepartement + "' introuvable"));

                    user.setDepartement(dept);

                    // On définit le mot de passe par défaut pour l'importation
                    user.setPassword("Passer123");

                    // Au lieu d'appeler le service ici, on l'ajoute à notre liste d'importation
                    utilisateursAImporter.add(user);

                } catch (Exception e) {
                    System.err.println("Erreur à la ligne " + (i + 1) + " : " + e.getMessage());
                    throw new RuntimeException("Erreur ligne " + (i + 1) + " : " + e.getMessage());
                }
            }

            // Une fois que tout le fichier est lu avec succès, on envoie la liste au traitement en masse
            if (!utilisateursAImporter.isEmpty()) {
                userService.importerUser(utilisateursAImporter);
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier Excel : " + e.getMessage());
        }
    }
}
