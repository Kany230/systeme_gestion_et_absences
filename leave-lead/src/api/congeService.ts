import { LeaveRequest, TypeConge, CreateLeaveRequest } from "@/data/conges";

const API_URL = "http://localhost:8080/gestion-conge/api/demandes-conges";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) console.warn("ATTENTION : Aucun token trouvé dans le localStorage !");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const leaveService = {
  /**
   * Crée une nouvelle demande de congé
   */
  createLeave: async (leaveData: CreateLeaveRequest): Promise<LeaveRequest> => {
    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(leaveData),
    });
    // Optionnel mais recommandé : intercepter le message d'erreur du backend (ex: Solde insuffisant)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors de la création de la demande");
    }
    return response.json();
  },

  /**
   * Récupère les demandes de l'utilisateur connecté (Historique personnel)
   * CORRECTION : Ajout du 's' à /mes-demandes
   */
  getMyLeaves: async (userId: number): Promise<LeaveRequest[]> => {
    const response = await fetch(`${API_URL}/mes-demandes/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Le serveur a répondu avec une erreur :", errorText);
      throw new Error("Erreur lors de la récupération des congés");
    }

    return response.json();
  },

  /**
   * Annule une demande (si pas encore validée par DRH)
   */
  cancelLeave: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/annuler/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Erreur lors de l'annulation");
    }
    return response.text();
  },

  /**
   * Valide une demande (Aiguillage géré automatiquement par le token au backend)
   * CORRECTION : Changement de PUT à POST / Retrait du paramètre de rôle inutile
   */
  validateLeave: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/valider/${id}`, {
      method: "POST", // Changement de PUT à POST pour correspondre à @PostMapping
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors de la validation");
    }
    return response.text();
  },

  /**
   * Refuse une demande
   */
  rejectLeave: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/refuser/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors du refus");
    }
    return response.text();
  },

  /**
   * Confirme le retour effectif de l'employé
   */
  confirmReturn: async (id: number): Promise<string> => {
    const response = await fetch(`${API_URL}/confirme-retour/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la confirmation du retour");
    return response.text();
  },

  /**
   * Récupère les listes de demandes en attente selon le rôle pour les managers
   * CORRECTION : Ajustement de l'URL pour le DRH (/api/demandes-conges/drh)
   */
  getPendingByRole: async (role: "chef-equipe" | "departement" | "drh", id?: number): Promise<LeaveRequest[]> => {
    let url = `${API_URL}`;
    if (role === "drh") {
      url += "/demande/drh"; 
    } else {
      url += `/${role}/${id}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des listes");
    return response.json();
  },

  /**
   * Récupère les retards de retour (pour le DRH/Admin)
   */
  getLateReturns: async (): Promise<LeaveRequest[]> => {
    const response = await fetch(`${API_URL}/retours`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des retards");
    return response.json();
  },

  getTypeConges: async (): Promise<TypeConge[]> => {
  const response = await fetch(`http://localhost:8080/gestion-conge/api/type-conge/types`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors du chargement des types de congé");
  return response.json();
},
};