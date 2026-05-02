package sn.uidt.projet.gestion_conge.services;

import java.io.InputStream;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public void importerUtilisateurs(InputStream is) {
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0); // On prend la première feuille

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // i=1 pour sauter l'entête
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }

                User user = new User();
                user.setNom(row.getCell(0).getStringCellValue());
                user.setPrenom(row.getCell(1).getStringCellValue());
                user.setEmail(row.getCell(2).getStringCellValue());
                user.setMatricule(row.getCell(3).getStringCellValue());
                user.setPoste(row.getCell(4).getStringCellValue());
                user.setTelephone(String.valueOf((long) row.getCell(5).getNumericCellValue()));
                String roleExtraite = row.getCell(6).getStringCellValue().trim();
                user.setRole(Role.valueOf(roleExtraite));
                if (row.getCell(7) != null) {
                    try {
                        // On récupère la date au format classique Excel/Java
                        java.util.Date dateExcel = row.getCell(7).getDateCellValue();

                        // On convertit java.util.Date en java.time.LocalDate
                        java.time.LocalDate dateConvertie = dateExcel.toInstant()
                                .atZone(java.time.ZoneId.systemDefault())
                                .toLocalDate();

                        user.setDateEmbauche(dateConvertie);
                    } catch (Exception e) {
                        // En cas de format invalide dans l'Excel
                        user.setDateEmbauche(java.time.LocalDate.now());
                    }
                } else {
                    // Si la cellule est vide
                    user.setDateEmbauche(java.time.LocalDate.now());
                }
                String nomDepartement = row.getCell(8).getStringCellValue();
                Departement dept = departementRepository.findByNom(nomDepartement).orElseThrow(() -> new RuntimeException("Departement introuvable"));

// 3. Associer le département à l'utilisateur
                user.setDepartement(dept);

                // On genere un mot de passe par défaut pour l'import
                user.setPassword("Passer123");

                // On appelle ton service existant pour créer l'user + compteur + mail
                userService.creerUser(user, 22.0);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier Excel : " + e.getMessage());
        }
    }
}
