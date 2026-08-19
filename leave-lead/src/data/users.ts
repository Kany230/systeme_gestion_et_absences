export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  matricule?: string;
  telephone?: string;
  password?: string;
  poste?: string;
  role: Role;
  dateEmbauche: string;
  departement?: {
    id: number;
    nom: string;
  };
  manager?: User;
  avatar?: string;
  compteursConges?: CompteursConges;
  demandeConges?: DemandeConge[];
}



export interface DemandeConge {
  id: number;
  dateDebut: string;
  dateFin: string;
  nombreJoursDeduit: number;
  statut: string;
  dateDemande: string;
  dateRetour?: string;
  retourConfirme: boolean;
  justificationUrl?: string;
}

export interface CompteursConges {
  id: number;
  soldeAn: number;
  soldePermission?: number;
}

export enum Role {
  employe = "employe",
  chef_equipe = "chef_equipe",
  manager = "manager", 
  DRH = "DRH",
  admin = "admin"
}
