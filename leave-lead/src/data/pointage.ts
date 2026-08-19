export interface Attendance {
  id?: number;
  date: string;
  heureArrive?: string;
  heureDepart?: string;
  estEnConge: boolean;
  statut: StatutPointage;
  user: User;
}

export interface User {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  matricule?: string;
  telephone?: string;
}

const today = new Date().toISOString().split("T")[0];

export enum StatutPointage {
  present = "present",
  retard  = "retard",
  absent  = "absent",
}
