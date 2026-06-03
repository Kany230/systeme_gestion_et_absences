

const API_URL = "http://localhost:8080/gestion-conge/api/historique";

// Fonction utilitaire pour récupérer les headers avec le token à jour
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};


export const historyService = {
  // Récupérer tout l'historique (pour le DRH)
  getAll: async () => {
    const response = await fetch(`${API_URL}/conges`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur historique");
    return response.json();
  },

  // Récupérer l'historique d'un utilisateur spécifique
  getByUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/conges/${userId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  }
};