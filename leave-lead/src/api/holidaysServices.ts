// URL de base correspondant à votre @RequestMapping("/api/jours-feries")
const HOLIDAY_API_URL = "http://localhost:8080/conge-absence/api/jours-feries";

interface Holiday {
  id: number;
  nom: string;
  date: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const holidayService = {
  // Initialiser les fêtes fixes pour une année donnée
  initializeYear: async (year: number) => {
    const response = await fetch(`${HOLIDAY_API_URL}/initialiser/${year}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de l'initialisation");
    return response.text(); // Retourne "Initialisation faite"
  },

  // Ajouter un jour férié (ex: jours lunaires)
  addHoliday: async (holiday: { nom: string; date: string }) => {
    const response = await fetch(`${HOLIDAY_API_URL}/ajouter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(holiday),
    });
    if (!response.ok) throw new Error("Cette date existe déjà ou est invalide");
    return response.json();
  },

  // Récupérer tous les jours fériés
  getAll: async (): Promise<Holiday[]> => {
    const response = await fetch(`${HOLIDAY_API_URL}/feries`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération");
    return response.json();
  },

  // Modifier un jour férié
  update: async (id: number, holiday: { nom: string; date: string }) => {
    const response = await fetch(`${HOLIDAY_API_URL}/modifier/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(holiday),
    });
    if (!response.ok) throw new Error("Erreur lors de la modification");
    return response.json();
  },

  // Supprimer un jour férié
  delete: async (id: number) => {
    const response = await fetch(`${HOLIDAY_API_URL}/supprimer/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression");
    return response.text();
  }
};