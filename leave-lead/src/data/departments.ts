export interface Department {
  id: number;
  nom: string;
  code?: string;
  manager: User;
  employeeCount?: number;
}
export interface User {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  matricule?: string;
  telephone?: string;
}

