import { CompteursConges } from "@/data/compteurs";

const API_URL = "http://localhost:8080/gestion-conge/api/comptes-conges";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const counterService = {
  /** Récupère le compteur complet d'un utilisateur */
  getSoldeById: async (userId: number): Promise<CompteursConges> => {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Réponse brute du serveur (Compteur):", text);
      throw new Error("Erreur lors de la récupération du compteur");
    }
    return response.json();
  },

  /**
   * Permet au RH de modifier manuellement un solde
   * ✅ CORRIGÉ : PUT /modifier/{userId}?newSolde=X&motif=Y
   *    correspond au @PutMapping("/modifier/{id}") du backend
   */
  updateBalanceByRH: async (
    userId: number,
    newSolde: number,
    motif: string
  ): Promise<string> => {
    const url = `${API_URL}/modifier/${userId}?newSolde=${newSolde}&motif=${encodeURIComponent(motif)}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Erreur lors de la mise à jour du solde");
    }
    return response.text();
  },

  /**
   * Déclenche manuellement l'ajout mensuel
   * ✅ CORRIGÉ : POST /execute-ajout-mois
   *    correspond au @PostMapping("/execute-ajout-mois") du backend
   */
  triggerMonthlyCredit: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/execute-ajout-mois`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Erreur lors du crédit mensuel");
    return response.text();
  },
};