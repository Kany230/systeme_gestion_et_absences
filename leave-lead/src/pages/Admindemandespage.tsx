import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle, Search, CheckCircle2, FileText, Clock,
  Users, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { leaveService } from "@/api/congeService";
import { AllCongeValiderDTO } from "@/api/congeService"; // ✅ nouveau type
import { PageHeader } from "@/components/common/PageHeader";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("fr-FR") : "—";

const ROLE_LABELS: Record<string, string> = {
  employe:     "Employé",
  chef_equipe: "Chef d'équipe",
  manager:     "Manager",
  DRH:         "DRH",
  admin:       "Admin",
};

// ── Avatar ─────────────────────────────────────────────────────────────────
const Avatar = ({
  prenom, nom, color = "indigo",
}: { prenom?: string | null; nom?: string | null; color?: string }) => (
  <div
    className={`h-8 w-8 rounded-full bg-${color}-100 flex items-center justify-center
      text-${color}-700 font-bold text-[11px] shrink-0`}
  >
    {(prenom?.[0] ?? "").toUpperCase()}{(nom?.[0] ?? "").toUpperCase()}
  </div>
);

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) => (
  <Card className="p-5 rounded-2xl border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`h-11 w-11 rounded-xl bg-${color}-50 flex items-center justify-center shrink-0`}>
      <Icon className={`h-5 w-5 text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </Card>
);

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminDemandesPage() {
  const [demandes, setDemandes]     = useState<AllCongeValiderDTO[]>([]); // ✅
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filtreRole, setFiltreRole] = useState("tous");

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllCongesValides(); // retourne AllCongeValiderDTO[]
      setDemandes(data);
    } catch {
      toast.error("Erreur lors du chargement des demandes validées");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  // Filtrage ✅ userNom/userPrenom/userRole au lieu de demandeurNom...
  const demandesFiltrees = demandes.filter((d) => {
    const matchSearch =
      `${d.userPrenom ?? ""} ${d.userNom ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
      (d.typeConge ?? "").toLowerCase().includes(search.toLowerCase()) ||
      `${d.valideurPrenom ?? ""} ${d.valideurNom ?? ""}`.toLowerCase().includes(search.toLowerCase());

    const matchRole = filtreRole === "tous" || d.userRole === filtreRole; // ✅

    return matchSearch && matchRole;
  });

  // Stats ✅
  const stats = {
    total:    demandes.length,
    employes: demandes.filter(d => d.userRole === "employe").length,
    managers: demandes.filter(d => d.userRole === "manager" || d.userRole === "chef_equipe").length,
    drh:      demandes.filter(d => d.userRole === "DRH").length,
  };

  if (loading) return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">

      <PageHeader
        title="Congés Validés"
        description="Liste de toutes les demandes de congé approuvées et leur valideur."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Total validés"    value={stats.total}    color="emerald" />
        <StatCard icon={Users}        label="Employés"         value={stats.employes} color="indigo"  />
        <StatCard icon={Calendar}     label="Chefs / Managers" value={stats.managers} color="violet"  />
        <StatCard icon={FileText}     label="DRH"              value={stats.drh}      color="amber"   />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par employé, type de congé, valideur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-slate-200 rounded-xl h-10"
          />
        </div>

        <select
          value={filtreRole}
          onChange={(e) => setFiltreRole(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700
            focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="tous">Tous les rôles</option>
          <option value="employe">Employé</option>
          <option value="chef_equipe">Chef d'équipe</option>
          <option value="manager">Manager</option>
          <option value="DRH">DRH</option>
        </select>

        <span className="text-xs text-slate-400 ml-auto shrink-0">
          {demandesFiltrees.length} résultat{demandesFiltrees.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-sm rounded-2xl">
        <Table>
          {/* Remplacer le TableHeader par ceci — tout sur une ligne, sans commentaires entre les tags */}
<TableHeader className="bg-slate-50">
  <TableRow>
    <TableHead className="font-semibold text-slate-600">Employé</TableHead>
    <TableHead className="font-semibold text-slate-600">Type de congé</TableHead>
    <TableHead className="font-semibold text-slate-600">Période</TableHead>
    <TableHead className="font-semibold text-slate-600">Jours</TableHead>
    <TableHead className="font-semibold text-slate-600">Total pris</TableHead>
    <TableHead className="font-semibold text-slate-600">Validé par</TableHead>
  </TableRow>
</TableHeader>

          <TableBody>
            {demandesFiltrees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Aucune demande trouvée</p>
                  <p className="text-xs text-slate-400 mt-1">Essayez de modifier les filtres</p>
                </TableCell>
              </TableRow>
            ) : (
              demandesFiltrees.map((d) => (
                <TableRow key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar prenom={d.userPrenom} nom={d.userNom} color="indigo" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {d.userPrenom} {d.userNom}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ROLE_LABELS[d.userRole ?? ""] ?? d.userRole}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-slate-600">
                      <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {d.typeConge ?? "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      {fmt(d.dateDebut)} → {fmt(d.dateFin)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-slate-700">
                      {d.nombreJoursDeduit ?? "—"}
                      <span className="font-normal text-slate-400 text-xs ml-1">j</span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {d.totalJoursPris ?? 0} j cumulés
                    </span>
                  </TableCell>

                  {/* Validé par */}
                  <TableCell>
                    {d.valideurId ? (
                      <div className="flex items-center gap-2">
                        <Avatar prenom={d.valideurPrenom} nom={d.valideurNom} color="emerald" />
                        <span className="text-sm text-slate-700">
                          {d.valideurPrenom} {d.valideurNom}
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                        <Clock className="h-3 w-3" /> Non renseigné
                      </span>
                    )}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {demandesFiltrees.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              {demandesFiltrees.length} congé{demandesFiltrees.length > 1 ? "s" : ""} validé{demandesFiltrees.length > 1 ? "s" : ""} affiché{demandesFiltrees.length > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}