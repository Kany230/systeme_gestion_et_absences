import { Attendance, StatutPointage } from "@/data/pointage";

const API_URL = "http://localhost:8080/conge-absence/api/pointages";

// Toujours utiliser une fonction pour récupérer le token le plus récent
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const attendanceService = {
  /**
   * Enregistre l'heure d'arrivée
   */
  checkIn: async (userId: number): Promise<Attendance> => {
    const response = await fetch(`${API_URL}/arrivee/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) {
      let message = "Erreur lors du pointage d'arrivée";
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // JSON non parseable, on garde le message par défaut
    }
    throw new Error(message);
    }
    return response.json();
  },

  /**
   * Enregistre l'heure de départ
   */
  checkOut: async (userId: number): Promise<Attendance> => {
    const response = await fetch(`${API_URL}/depart/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) {
      let message = "Erreur lors du pointage de separt";
    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // JSON non parseable, on garde le message par défaut
    }
    throw new Error(message);
    }
    return response.json();
  },

  /**
   * Liste tous les pointages (RH)
   */
  getAll: async (): Promise<Attendance[]> => {
    const response = await fetch(`${API_URL}/all`, {
      method: "GET",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Erreur de chargement des pointages");
    return response.json();
  },

  /**
   * Liste des retards uniquement
   */
  getLateComers: async (): Promise<Attendance[]> => {
    const response = await fetch(`${API_URL}/retards`, {
      method: "GET",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Erreur de chargement des retards");
    return response.json();
  },

  /**
   * Déclenche manuellement la détection des absences
   */
  triggerAbsenceDetection: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/detecter-absence`, {
      method: "POST",
      headers: getAuthHeaders(), // Ajouté
    });
    if (!response.ok) throw new Error("Erreur lors de la détection");
    return response.text();
  },



getByDepartement: async (deptId: number): Promise<Attendance[]> => {
  const res = await fetch(`${API_URL}/absence-dept/${deptId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement département");
  return res.json();
},

getByManager: async (managerId: number): Promise<Attendance[]> => {
  const res = await fetch(`${API_URL}/absence-equipe/${managerId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement équipe");
  return res.json();
},

getByUser: async (userId: number): Promise<Attendance[]> => {
  const res = await fetch(`${API_URL}/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Erreur chargement pointages");
  return res.json();
},
};