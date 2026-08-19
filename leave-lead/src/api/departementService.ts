import { Department} from "@/data/departments";
import { userService } from "./userService";
import { User } from "@/data/users";

const API_URL = "http://localhost:8080/conge-absence/api/departement";

// Fonction utilitaire pour récupérer les headers avec le token à jour
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const departmentService = {
  /**
   * Récupère la liste de tous les départements
   */
  list: async (): Promise<Department[]> => {
    const response = await fetch(`${API_URL}/departements`, {
      method: "GET",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Erreur lors du chargement des départements");
    const data = await response.json();
    return data as Department[];
  },

  /**
   * Récupère un département par son ID
   */
  getById: async (id: number): Promise<Department> => {
    const response = await fetch(`${API_URL}/show/${id}`, {
      method: "GET",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Département introuvable");
    return response.json();
  },

  /**
   * Crée un nouveau département
   */
  create: async (dept: Partial<Department>): Promise<Department> => {
    const response = await fetch(`${API_URL}/creer`, {
      method: "POST",
      headers: getAuthHeaders(), // Corrigé pour inclure le token
      body: JSON.stringify(dept),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Erreur lors de la création du département");
    }
    return response.json();
  },

  /**
   * Assigne un manager (chef) à un département
   */
  assignChef: async (deptId: number, managerId: number): Promise<Department> => {
    const response = await fetch(`${API_URL}/${deptId}/chef/${managerId}`, {
      method: "PUT",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Erreur lors de l'assignation du chef");
    return response.json();
  },


  /**
   * Supprime un département
   */
  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Erreur lors de la suppression");
    }
    return response.text();
  },


  /**
   * Met à jour un département
   */
  update: async (id: number, dept: Partial<Department>): Promise<Department> => {
    const response = await fetch(`${API_URL}/modifier/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(dept),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Erreur lors de la modification");
    }
    return response.json();
  },
  
  getManagersByDept: async (deptId: number): Promise<User[]> => {
    const response = await fetch(`http://localhost:8080/conge-absence/api/users/departement/${deptId}/managers`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des managers");
    return response.json();
  },
};

  
