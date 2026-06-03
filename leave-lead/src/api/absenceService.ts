import { Absence } from "@/data/absences";

const API_URL = "http://localhost:8080/gestion-conge/api/absences";

const getAuthHeaders = (isMultipart = false): Record<string, string> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("Token manquant, veuillez vous reconnecter.");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

// ✅ Utilitaire centralisé pour les erreurs HTTP
const handleResponse = async <T>(response: Response, errorMessage: string): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || errorMessage);
  }
  return response.json();
};

export const absenceService = {

  getAll: async (): Promise<Absence[]> => {
    const response = await fetch(`${API_URL}/absences`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Absence[]>(response, "Erreur lors de la récupération des absences");
  },

  getByUser: async (userId: number): Promise<Absence[]> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Absence[]>(response, "Impossible de charger vos absences");
  },

  getByManager: async (managerId: number): Promise<Absence[]> => {
    const response = await fetch(`${API_URL}/manager/${managerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Absence[]>(response, "Erreur lors de la récupération des absences de l'équipe");
  },

  getByDepartement: async (departementId: number): Promise<Absence[]> => {
    const response = await fetch(`${API_URL}/departement/${departementId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Absence[]>(response, "Erreur lors de la récupération des absences du département");
  },

  justifier: async (id: number, motif: string, file: File): Promise<Absence> => {
    const formData = new FormData();
    formData.append("motifJustifie", motif);
    formData.append("file", file);

    const response = await fetch(`${API_URL}/${id}/justifier`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<Absence>(response, "Erreur lors de la justification de l'absence");
  },

  triggerDetection: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/detecter`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors du déclenchement de la détection");
    }
    return response.text(); // ← text() et non json() car le back renvoie une String
  },
};