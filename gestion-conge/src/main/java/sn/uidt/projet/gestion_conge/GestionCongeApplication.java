package sn.uidt.projet.gestion_conge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GestionCongeApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionCongeApplication.class, args);
	}

}
