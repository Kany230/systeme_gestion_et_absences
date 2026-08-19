import { User } from "@/data/users";

const API_URL = "http://localhost:8080/conge-absence/api/users";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ✅ Payload de création mis à jour : le matricule est retiré (géré par le serveur)
// et le departementId devient obligatoire pour piloter l'autogénération.
export interface CreateUserPayload {
  nom: string,
  prenom: string,
  email: string,
  password: string,
  role: string,
  departementId: number,
  telephone?: string,
  poste?: string,
  dateEmbauche?: string,
  
}

export const userService = {
  /** Récupère tous les collaborateurs */
  list: async (): Promise<User[]> => {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des collaborateurs");
    return response.json();
  },

  /** Récupération d'un collaborateur par son adresse email */
  getByEmail: async (email: string): Promise<User> => {
    const response = await fetch(`${API_URL}/by-email/${email}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Profil introuvable");
    return response.json();
  },

  /** Récupération par identifiant unique (via le filtre de liste globale) */
  getById: async (id: number): Promise<User> => {
    const users = await userService.list();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  },

  /** ✅ Création d'un collaborateur avec mot de passe et affectation de sa structure */
  create: async (payload: CreateUserPayload, solde: number = 0.0): Promise<User> => {
  const body = {
    ...payload,
    role: payload.role.trim(), 
    departementId: Number(payload.departementId),
  };

  const response = await fetch(`${API_URL}/creer?solde=${solde}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Erreur lors de la création du compte");
  }
  return response.json();
},

  /** Modification d'un compte — Le mot de passe est exclu du traitement pour sécurité */
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const { password, ...safePayload } = user as User & { password?: string };
    const response = await fetch(`${API_URL}/modifier/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(safePayload),
    });
    if (!response.ok) throw new Error("Erreur lors de la modification du collaborateur");
    return response.json();
  },

  /** Assignation d'un manager référent à un utilisateur */
  assignManager: async (
    userId: number,
    chefId: number,
    managerId: number   // ← le manager qui fait l'action
): Promise<string> => {
    const response = await fetch(
      `${API_URL}/${userId}/assigner-manager/${chefId}?managerId=${managerId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Erreur lors de l'assignation");
    return response.text();
},

  /** Modification sécurisée du mot de passe utilisateur */
  updatePassword: async (
    id: number,
    ancienMdp: string,
    newMdp: string
  ): Promise<string> => {
    const response = await fetch(`${API_URL}/${id}/modifier-mdp`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword: ancienMdp, newPassword: newMdp }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Erreur lors du changement de mot de passe");
    }
    return response.text();
  },

  /** Filtre les membres d'une équipe rattachés à un manager */
  getByManager: async (managerId: number): Promise<User[]> => {
    const response = await fetch(`${API_URL}/manager/${managerId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur de récupération de l'équipe");
    return response.json();
  },

  /** Récupère la liste filtrée selon la logique métier de ListeParMonEquipe */
getMonEquipe: async (ChefId: number): Promise<User[]> => {
  const response = await fetch(`${API_URL}/chef-equipe/${ChefId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération de l'équipe");
  return response.json();
},

  /** Filtre les collaborateurs affectés à un département spécifique */
  getByDepartement: async (deptId: number): Promise<User[]> => {
    const response = await fetch(`${API_URL}/departement/${deptId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur de récupération du département");
    return response.json();
  },

  /** Récupère la liste des encadrants/managers d'un département donné */
  getManagersByDept: async (deptId: number): Promise<User[]> => {
    const response = await fetch(
      `${API_URL}/departement/${deptId}/managers`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Erreur de récupération des managers de cette structure");
    return response.json();
  },

  getMonEquipeComplete: async (userId: number): Promise<User[]> => {
  const response = await fetch(`${API_URL}/equipe-complete/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur de récupération de l'équipe");
  return response.json();
},

getByDepartement1: async (deptId: number): Promise<User[]> => {
  const response = await fetch(`${API_URL}/departement/${deptId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur de récupération de l'équipe");
  return response.json();
},

  /** Suppression définitive d'un compte utilisateur */
  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/supprimer/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression de l'utilisateur");
    return response.text();
  },

  /** Importation de masse de collaborateurs via fichier Excel (.xlsx) */
  importExcel: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/import-excel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error("Erreur lors de l'importation du fichier");
    return response.text();
  },

  /** Liste l'ensemble des responsables (Utile pour vos filtres et formulaires d'attribution) */
  listManagers: async (): Promise<User[]> => {
    const users = await userService.list();
    return users.filter(
      (u) => u.role === "manager" || u.role === "chef_equipe"
    );
  },

  /** ✅ AJOUT : Récupère la liste complète des structures / départements */
  getDepartements: async (): Promise<any[]> => {
    const DEPT_API_URL = "http://localhost:8080/conge-absence/api/departement/departements";
    const response = await fetch(DEPT_API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des départements");
    return response.json();
  },
};