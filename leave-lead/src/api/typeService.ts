import { TypeConge } from "@/data/type";

const API_URL = "http://localhost:8080/conge-absence/api/type-conge";

// Fonction utilitaire pour récupérer les headers avec le token à jour
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const leaveTypeService = {
  /**
   * Récupère tous les types de congés paramétrés
   */
  getAll: async (): Promise<TypeConge[]> => {
    const response = await fetch(`${API_URL}/types`, {
      method: "GET",
      headers: getAuthHeaders(), // Corrigé : passé en argument du fetch
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des types de congés");
    return response.json();
  },

  /**
   * Ajoute un nouveau type de congé
   */
  create: async (type: Partial<TypeConge>): Promise<TypeConge> => {
    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(), // Ajouté ici aussi
      body: JSON.stringify(type),
    });
    if (!response.ok) throw new Error("Erreur lors de la création du type de congé");
    return response.json();
  },

  /**
   * Récupère un type spécifique par son ID
   */
  getById: async (id: number): Promise<TypeConge> => {
    const response = await fetch(`${API_URL}/show/${id}`, {
      method: "GET",
      headers: getAuthHeaders(), // Ajouté ici aussi
    });
    if (!response.ok) throw new Error("Type de congé introuvable");
    return response.json();
  },

  /**
   * Supprime un type de congé
   */
  delete: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(), // Ajouté ici aussi
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Impossible de supprimer ce type de congé");
    }
    return response.text();
  }
};