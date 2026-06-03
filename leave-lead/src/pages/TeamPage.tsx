import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { User } from "@/data/users";
import {
  Users,
  Mail,
  Building2,
  ShieldCheck,
  Loader2,
  Phone,
  Hash,
} from "lucide-react";

const roleLabel: Record<string, string> = {
  employe: "Employé",
  chef_equipe: "Chef d'équipe",
  manager: "Manager",
  drh: "Directeur RH",
};

const roleBadgeClass: Record<string, string> = {
  drh: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  chef_equipe: "bg-orange-100 text-orange-700",
  employe: "bg-slate-100 text-slate-600",
};

const TeamPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalDept: 0, respDept: 0, nbGlobalDepts: 0 });
  const [loading, setLoading] = useState(true);

  const roleNorm = user?.role?.toLowerCase();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        if (!user) return;

        // 1. Récupération du tableau principal (ton équipe directe)
        let filteredTable: User[] = [];
        if (roleNorm === "drh") {
          const all = await userService.list();
          filteredTable = all.filter((u) => u.id !== user.id);
        } else if (roleNorm === "manager") {
          filteredTable = await userService.getByManager(user.id!);
        } else if (roleNorm === "chef_equipe") {
          filteredTable = await userService.getMonEquipe(user.id!);
        } else {
          if (user.departement?.id) {
            const all = await userService.getByDepartement(user.departement.id);
            filteredTable = all.filter((u) => u.id !== user.id);
          }
        }
        setMembers(filteredTable);

        // 2. Calcul des statistiques via la liste globale (Évite les bugs d'endpoints manquants)
        const allUsers: User[] = await userService.list();
        
        // Nombre global de départements dans l'entreprise
        const totalDeptsCount = new Set(allUsers.map((u) => u.departement?.id).filter(Boolean)).size;

        // Si c'est un chef d'équipe ou un employé, on cible son département
        if (user.departement?.id) {
          const matchingDeptUsers = allUsers.filter(u => u.departement?.id === user.departement?.id);
          setStats({
            totalDept: matchingDeptUsers.length,
            respDept: matchingDeptUsers.filter(u => u.role?.toLowerCase() !== "employe").length,
            nbGlobalDepts: totalDeptsCount
          });
        } else {
          // Fallback pour le DRH / Managers sans département fixe attribué
          setStats({
            totalDept: allUsers.length,
            respDept: allUsers.filter(u => u.role?.toLowerCase() !== "employe").length,
            nbGlobalDepts: totalDeptsCount
          });
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données de l'équipe :", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTeamData();
  }, [user, roleNorm]);

  if (!user) return null;

  const getHeaderInfo = () => {
    if (roleNorm === "drh")
      return { titre: "Collaborateurs", description: "Vue globale de l'entreprise" };
    if (roleNorm === "manager")
      return {
        titre: "Mon département",
        description: `Tous les membres de ${user.departement?.nom || "votre département"}`,
      };
    if (roleNorm === "chef_equipe")
      return {
        titre: "Mon équipe",
        description: "Membres qui vous sont directement assignés",
      };
    return {
      titre: "Mes collègues",
      description: `Département ${user.departement?.nom || ""}`,
    };
  };

  const { titre, description } = getHeaderInfo();

  // Mode d'affichage des compteurs : département ou entreprise globale
  const isPeleMele = roleNorm === "chef_equipe" || roleNorm === "employe";

  return (
    <div className="space-y-6">
      <PageHeader
        title={titre}
        description={`${description} — ${members.length} membre(s) dans votre équipe directe`}
      />

      {/* ── Statistiques Dynamiques ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5 border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isPeleMele ? "Total département" : "Total collaborateurs"}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "..." : isPeleMele ? stats.totalDept : members.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isPeleMele ? "Mon Département" : "Départements"}
              </p>
              <p className="text-xl font-bold text-slate-900 truncate max-w-[180px]">
                {loading ? "..." : isPeleMele ? (user.departement?.nom || "Non renseigné") : `${stats.nbGlobalDepts} enregistrés`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isPeleMele ? "Responsables pôle" : "Responsables"}
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "..." : isPeleMele ? stats.respDept : members.filter(m => m.role?.toLowerCase() !== "employe").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tableau de l'Équipe Directe ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 animate-pulse">
              Chargement de l'annuaire...
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Collaborateur</TableHead>
                <TableHead className="font-bold text-slate-700">Contact</TableHead>
                <TableHead className="font-bold text-slate-700">Rôle / Poste</TableHead>
                <TableHead className="font-bold text-slate-700">Département</TableHead>
                <TableHead className="font-bold text-slate-700">Matricule</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-slate-400 py-12 italic"
                  >
                    Aucun membre trouvé dans votre cellule ou équipe directe actuellement.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => {
                  const mRoleNorm = m.role?.toLowerCase() || "";
                  return (
                    <TableRow key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                              {m.prenom?.[0] || ""}{m.nom?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">
                              {m.prenom} {m.nom}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                              Depuis le {m.dateEmbauche || "---"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {m.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone className="h-3 w-3" />
                            {m.telephone || "N/A"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight w-fit ${roleBadgeClass[mRoleNorm] || "bg-gray-100 text-gray-600"}`}>
                            {roleLabel[mRoleNorm] || m.role}
                          </span>
                          <span className="text-xs text-slate-400 pl-1">
                            {m.poste || "—"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {m.departement?.nom || "Non affecté"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-500 font-mono text-xs">
                          <Hash className="h-3 w-3 text-slate-400" />
                          {m.matricule || "---"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default TeamPage;