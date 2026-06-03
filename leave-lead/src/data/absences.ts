export interface Absence {
  id: number;
  dateAbsence: string;
  dateDetecter: string;
  motifJustifie: string;
  justificationUrl: string;
  statut?: StatutAbsence;
  user: User;
  demandeConge?: any;
}

export enum StatutAbsence{
  justifie = 0,
  pas_justifie = 1
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  telephone: string;
}

// Mapping pour l'affichage dans les composants (Tableaux/Badges)
export const absenceStatusLabel: Record<StatutAbsence, string> = {
  [StatutAbsence.justifie]: "Justifiée",
  [StatutAbsence.pas_justifie]: "Non justifiée"
};

// Couleurs pour tes composants UI (optionnel mais recommandé)
export const absenceStatusColor: Record<StatutAbsence, string> = {
  [StatutAbsence.justifie]: "text-green-600 bg-green-100",
  [StatutAbsence.pas_justifie]: "text-red-600 bg-red-100"
};
