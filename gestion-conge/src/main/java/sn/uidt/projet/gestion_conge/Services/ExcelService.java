package sn.uidt.projet.gestion_conge.Services;

import java.io.InputStream;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import sn.uidt.projet.gestion_conge.entities.Role;
import sn.uidt.projet.gestion_conge.entities.User;

@Service
public class ExcelService {

    @Autowired
    private UserService userService;

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
                user.setTelephone(String.valueOf((long) row.getCell(4).getNumericCellValue()));
                user.setDateEmbauche(new java.util.Date());
                String roleExtraite = row.getCell(5).getStringCellValue().trim();
                user.setRole(Role.valueOf(roleExtraite));

                // On génère un mot de passe par défaut pour l'import
                user.setPassword("Passer123");

                // On appelle ton service existant pour créer l'user + compteur + mail
                userService.creerUser(user, 22.0);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier Excel : " + e.getMessage());
        }
    }
}
