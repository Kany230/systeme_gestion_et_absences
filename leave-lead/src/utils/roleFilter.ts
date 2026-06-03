import { User, Role } from "@/data/users";

/**
 * Détermine si l'utilisateur connecté peut voir les données d'une cible.
 * Cette logique est utilisée pour l'affichage (cacher/montrer des boutons).
 */
export const canSee = (currentUser: User, targetUser: User): boolean => {
  // 1. Le DRH voit tout le monde
  if (currentUser.role === Role.DRH) return true;

  // 2. Un Chef de Département voit tous ceux de son département
  if (currentUser.role === Role.manager) {
    return currentUser.departement?.id === targetUser.departement?.id;
  }

  // 3. Un Manager voit les membres de son équipe
  if (currentUser.role === Role.chef_equipe) {
    // Il se voit lui-même OU il voit ceux dont il est le manager
    return (
      currentUser.id === targetUser.id || 
      targetUser.manager?.id === currentUser.id
    );
  }

  // 4. Un employé ne voit que lui-même
  return currentUser.id === targetUser.id;
};