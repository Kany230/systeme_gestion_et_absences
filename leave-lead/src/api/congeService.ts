import { LeaveRequest, TypeConge, CreateLeaveRequest } from "@/data/conges";

const API_URL = "http://localhost:8080/conge-absence/api/demandes-conges";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) console.warn("ATTENTION : Aucun token trouvé dans le localStorage !");
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface EmployeCongesDTO {
  userId: number;
  userNom: string;
  userPrenom: string;
  userRole: string;
  totalJoursPris: number;
  conges: AllCongeValiderDTO[];
}

// Interface mise à jour avec totalJoursPris
export interface AllCongeValiderDTO {
  id: number;
  dateDebut: string | null;
  dateFin: string | null;
  nombreJoursDeduit: number | null;
  statut: string;
  typeConge: string | null;
  justificationUrl: string | null;
  userId: number | null;
  userNom: string | null;
  userPrenom: string | null;
  userRole: string | null;
  valideurId: number | null;
  valideurNom: string | null;
  valideurPrenom: string | null;
  totalJoursPris: number; // ✅ nouveau champ
}

// ✅ Interface mise à jour — correspond exactement au record Java
export interface DemandeCongeAdmin {
  id: number;
  dateDebut: string | null;
  dateFin: string | null;
  nombreJoursDeduit: number | null;
  statut: string;
  typeConge: string | null;        // ← 6ème position comme dans le record
  justificationUrl: string | null;
  // Demandeur
  demandeurId: number | null;
  demandeurNom: string | null;
  demandeurPrenom: string | null;
  demandeurRole: string | null;
  // Valideur
  valideurId: number | null;
  valideurNom: string | null;
  valideurPrenom: string | null;
}

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

  uploadJustificatif: async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const response = await fetch(
    "http://localhost:8080/conge-absence/api/demandes-conges/upload-justificatif",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Erreur lors de l'upload du justificatif");
  }
  return response.text();
},

//Absents par équipe
getAbsentsByEquipe: async (chefId: number, date: string): Promise<LeaveRequest[]> => {
  const response = await fetch(`${API_URL}/chef-equipe/${chefId}/absents?date=${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération des absents de l'équipe");
  return response.json();
},

//Retards par équipe
getRetardsByEquipe: async (chefId: number): Promise<LeaveRequest[]> => {
  const response = await fetch(`${API_URL}/chef-equipe/${chefId}/retards`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération des retards de l'équipe");
  return response.json();
},

//Absents par département
getAbsentsByDepartement: async (managerId: number, date: string): Promise<LeaveRequest[]> => {
  const response = await fetch(`${API_URL}/manager/${managerId}/absents?date=${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération des absents du département");
  return response.json();
},

//Retards par département 
getRetardsByDepartement: async (managerId: number): Promise<LeaveRequest[]> => {
  const response = await fetch(`${API_URL}/manager/${managerId}/retards`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération des retards du département");
  return response.json();
},

//Tous les absents
getTousLesAbsents: async (date: string): Promise<LeaveRequest[]> => {
  const response = await fetch(`${API_URL}/drh/absents?date=${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la récupération de tous les absents");
  return response.json();
},


getById: async (id: number): Promise<LeaveRequest> => {
  const response = await fetch(`${API_URL}/${id}`, { 
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Erreur");
  }
  return response.json();
},

  getTypeConges: async (): Promise<TypeConge[]> => {
  const response = await fetch(`http://localhost:8080/conge-absence/api/type-conge/types`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors du chargement des types de congé");
  return response.json();
},

getAllCongesValides: async (): Promise<AllCongeValiderDTO[]> => {
    const response = await fetch(`${API_URL}/admin/toutes`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors du chargement des congés validés");
    }
    return response.json();
  },

  // ✅ Congés groupés par employé avec total
  getCongesParEmploye: async (): Promise<EmployeCongesDTO[]> => {
    const response = await fetch(`${API_URL}/conges/valides/par-employe`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors du chargement des congés par employé");
    }
    return response.json();
  },
}