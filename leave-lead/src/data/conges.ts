export type LeaveStatus = "en_attente_chef_equipe" | "en_attente_manager" | "en_attente_DRH" | "validee" | "refusee" | "annulee" | "terminee";

export interface LeaveRequest {
  id?: number;
  userId?: number;        // DTO expose userId, pas l'objet User complet
  typeCongeId?: number;   // idem
  typeCongeNom?: string;  // nouveau champ du DTO
  dateDebut: string;
  dateFin: string;
  nombreJoursDeduit: number;
  statut: LeaveStatus;
  justificationUrl: string;
  user?: User; 
  typeConge?: TypeConge;
  userNom?: string;    
  userPrenom?: string;
  userMatricule?: string;
}

export interface User {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  matricule?: string;
  telephone?: string;
}

export interface TypeConge {
  id: number;
  nomType: string;
  dureMax?: string;
  demandeJustification: boolean;
  estDeductible: boolean;
}

// Type spécifique pour la création d'une demande (ce qu'on envoie au backend)
export interface CreateLeaveRequest {
  user: { id: number };
  dateDebut: string;
  dateFin: string;
  typeConge: { id: number };
  justificationUrl: string;
}

export const leaveStatusLabel: Record<LeaveStatus, string> = {
  en_attente_chef_equipe: "En attente",
  en_attente_manager: "En attente",
  en_attente_DRH: "En attente",
  validee: "Approuvé",
  refusee: "Rejeté",
  annulee: "Annulé", 
  terminee: "Terminé"
};
