const API_URL = "http://localhost:8080/conge-absence/api/users";

export const authService = {
  /**
   * Connexion et stockage du token
   */
  login: async (email: string, password: string): Promise<any> => {
    // 1. On prépare un objet JSON simple
    const loginData = {
      email: email, // Assure-toi que c'est "email" et non "username"
      password: password
    };

    // 2. Appel à la nouvelle route API
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // On passe en JSON
      },
      body: JSON.stringify(loginData), // On convertit l'objet en chaîne JSON
      credentials: "omit", // Pour le JWT pur, "include" n'est plus nécessaire
    });

    if (!response.ok) {
      // Si 403 ou 401, on récupère le message d'erreur
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Identifiants invalides");
    }

    const data = await response.json();

    // 3. Stockage du token (ton backend renvoie { "token": "..." })
    if (data.token) {
      localStorage.setItem("token", data.token);
      // Optionnel : stocker le reste des infos user si besoin
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      console.log("Token JWT stocké avec succès");
    }

    return data;
  },

  logout: async () => {
    // Le logout en JWT est principalement local
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};