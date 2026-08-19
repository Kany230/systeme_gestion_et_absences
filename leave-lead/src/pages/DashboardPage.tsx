import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays, Loader2, Zap, Settings, RotateCcw,
  CheckCircle2, Clock, Users, BarChart3, AlertCircle,
  ArrowRight, TrendingUp, FileCheck, Bell, LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { leaveService } from "@/api/congeService";
import { counterService } from "@/api/compteurService";

// ── Types ─────────────────────────────────────────────────────────────────
const roleLabel: Record<string, string> = {
  employe: "Employé",
  manager: "Manager",
  chef_equipe: "Chef d'équipe",
  DRH: "Directeur RH",
  admin: "Administrateur",
};

const STATUTS_VALIDES = ["validee", "terminee"];

// ── Helpers ───────────────────────────────────────────────────────────────
function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (start === end) return s.toLocaleDateString("fr-FR", { ...opts, year: "numeric" });
  return `${s.toLocaleDateString("fr-FR", opts)} – ${e.toLocaleDateString("fr-FR", { ...opts, year: "numeric" })}`;
}

function getGreeting(prenom: string) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  return `${greet}, ${prenom}`;
}

function getDateLabel() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// ── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;   // text color
  bg: string;       // icon bg
  border: string;   // card left border color
  sub?: string;
}

const StatCard = ({ title, value, icon: Icon, accent, bg, border, sub }: StatCardProps) => (
  <Card className={`relative p-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group`}>
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${border} rounded-l-xl`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-3xl font-black mt-2 ${accent}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`h-11 w-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon className={`h-5 w-5 ${accent}`} />
      </div>
    </div>
  </Card>
);

// ── Quick Action ──────────────────────────────────────────────────────────
interface QuickActionProps {
  to: string;
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  iconBg: string;
}

const QuickAction = ({ to, icon: Icon, label, sub, color, iconBg }: QuickActionProps) => (
  <Link
    to={to}
    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group"
  >
    <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 text-sm">{label}</p>
      <p className="text-xs text-slate-400 truncate">{sub}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
  </Link>
);

// ── Status Badge ──────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; cls: string }> = {
  validee: { label: "Validée", cls: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  terminee: { label: "Terminée", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
  en_attente_chef_equipe: { label: "En attente", cls: "bg-amber-50 text-amber-700 border border-amber-100" },
  en_attente_manager: { label: "En attente", cls: "bg-amber-50 text-amber-700 border border-amber-100" },
  en_attente_drh: { label: "En attente DRH", cls: "bg-orange-50 text-orange-700 border border-orange-100" },
  refusee: { label: "Refusée", cls: "bg-red-50 text-red-700 border border-red-100" },
};

// ── Page ──────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [solde, setSolde] = useState(0);
  const [soldePermission, setSoldePermission] = useState(0);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [recentLeaves, counter] = await Promise.all([
          leaveService.getMyLeaves(user.id),
          counterService.getSoldeById(user.id),
        ]);
        setLeaves(recentLeaves);
        setSolde(counter.soldeAn);
        setSoldePermission(counter.soldePermission);
      } catch {
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleConfirmReturn = async (id: number) => {
    setConfirmingId(id);
    try {
      await leaveService.confirmReturn(id);
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, statut: "terminee" } : l))
      );
      toast.success("Retour confirmé avec succès");
    } catch {
      toast.error("Erreur lors de la confirmation du retour");
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading)
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm animate-pulse">Chargement de votre espace...</p>
      </div>
    );

  const validatedLeaves = leaves.filter((l) => STATUTS_VALIDES.includes(l.statut));
  const pendingLeaves = leaves.filter((l) =>
    ["en_attente_chef_equipe", "en_attente_manager", "en_attente_drh"].includes(l.statut)
  );
  const isAdmin = user.role === "DRH" || user.role === "admin";
  const roleNorm = user.role?.toLowerCase();

  // Quick actions selon le rôle
  const quickActions: QuickActionProps[] = [
    {
      to: "/leaves",
      icon: CalendarDays,
      label: "Poser un congé",
      sub: "Soumettre une nouvelle demande",
      color: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      to: "/attendance",
      icon: LogIn,
      label: "Pointer mon arrivée",
      sub: "Enregistrer ma présence du jour",
      color: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      to: "/absences",
      icon: FileCheck,
      label: "Mes absences",
      sub: "Consulter ou justifier une absence",
      color: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    ...(roleNorm !== "employe"
      ? [{
          to: "/leaves/validate",
          icon: Bell,
          label: "Demandes en attente",
          sub: `${pendingLeaves.length > 0 ? pendingLeaves.length + " demande(s) à traiter" : "Aucune demande en attente"}`,
          color: "text-amber-600",
          iconBg: "bg-amber-50",
        }]
      : []),
  ];

  return (
    <div className="space-y-8">

      {/* ── Bannière de bienvenue ── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl px-8 py-8 overflow-hidden">
        {/* Déco blobs */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-40 h-40 bg-indigo-500/10 rounded-full -mb-10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            {/* Salutation */}
            <p className="text-blue-300 text-sm font-medium mb-1 capitalize">{getDateLabel()}</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting(user.prenom)} 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {roleLabel[user.role] || "Utilisateur"} ·{" "}
              {user.departement?.nom || "UIDT Gestion"}
            </p>
          </div>

          {/* Soldes rapides dans la bannière */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold">Solde annuel</p>
              <p className="text-2xl font-black text-white mt-0.5">{solde} <span className="text-sm font-medium text-blue-300">j</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-center">
              <p className="text-teal-200 text-[10px] uppercase tracking-wider font-semibold">Permissions</p>
              <p className="text-2xl font-black text-white mt-0.5">{soldePermission} <span className="text-sm font-medium text-teal-300">j</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grille principale ── */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <StatCard
              title="Demandes en attente"
              value={pendingLeaves.length}
              icon={AlertCircle}
              accent="text-amber-600"
              bg="bg-amber-50"
              border="bg-amber-400"
              sub={pendingLeaves.length > 0 ? "En cours de validation" : "Tout est à jour"}
            />
            <StatCard
              title="Congés validés"
              value={validatedLeaves.length}
              icon={CheckCircle2}
              accent="text-emerald-600"
              bg="bg-emerald-50"
              border="bg-emerald-400"
              sub="Sur l'ensemble de l'année"
            />
          </div>

          {/* Suivi des congés */}
          <Card className="p-6 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-800">Suivi de mes congés</h2>
                <p className="text-xs text-slate-400 mt-0.5">Congés validés et en cours</p>
              </div>
              <Link
                to="/leaves"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Tout voir <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {validatedLeaves.length === 0 ? (
              <div className="py-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">Aucun congé validé pour l'instant</p>
                <p className="text-xs text-slate-400 mt-1">Vos congés approuvés apparaîtront ici</p>
                <Link to="/leaves">
                  <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-xs">
                    Poser un congé
                  </Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {validatedLeaves.slice(0, 5).map((l) => {
                  const isConfirming = confirmingId === l.id;
                  const isTerminee = l.statut === "terminee";
                  const st = statusConfig[l.statut] ?? { label: l.statut, cls: "bg-slate-100 text-slate-500" };

                  return (
                    <li
                      key={l.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {l.typeCongeNom ?? "Congé"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatRange(l.dateDebut, l.dateFin)}
                            {l.nombreJoursDeduit
                              ? ` · ${l.nombreJoursDeduit} jour${l.nombreJoursDeduit > 1 ? "s" : ""}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>

                        {isTerminee ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Retour confirmé
                          </span>
                        ) : (
                          <button
                            onClick={() => handleConfirmReturn(l.id!)}
                            disabled={isConfirming}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                          >
                            {isConfirming ? (
                              <><Loader2 className="h-3 w-3 animate-spin" /> En cours…</>
                            ) : (
                              <><RotateCcw className="h-3 w-3" /> Confirmer retour</>
                            )}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Demandes en attente (si il y en a) */}
          {pendingLeaves.length > 0 && (
            <Card className="p-6 border-amber-100 bg-amber-50/30 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Demandes en cours de validation
                </h2>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {pendingLeaves.length}
                </span>
              </div>
              <ul className="space-y-2">
                {pendingLeaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{l.typeCongeNom ?? "Congé"}</p>
                      <p className="text-xs text-slate-400">{formatRange(l.dateDebut, l.dateFin)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusConfig[l.statut]?.cls ?? "bg-slate-100 text-slate-500"}`}>
                      {statusConfig[l.statut]?.label ?? l.statut}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">

          {/* Actions rapides */}
          <Card className="p-6 border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
              Actions rapides
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <QuickAction key={i} {...action} />
              ))}
            </div>
          </Card>

          {/* Administration RH — DRH & Admin uniquement */}
          {isAdmin && (
            <Card className="p-6 border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-500" />
                Administration RH
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => counterService.triggerMonthlyCredit()}
                  className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all text-sm font-medium text-slate-700 text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Crédit mensuel</p>
                    <p className="text-xs text-slate-400">Déclencher les crédits de solde</p>
                  </div>
                </button>

                <Link
                  to="/users"
                  className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all text-sm font-medium text-slate-700"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Gérer le personnel</p>
                    <p className="text-xs text-slate-400">Comptes, rôles et départements</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 ml-auto" />
                </Link>

                <Link
                  to="/leave-types"
                  className="w-full flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all text-sm font-medium text-slate-700"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Types de congés</p>
                    <p className="text-xs text-slate-400">Configurer les règles et quotas</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 ml-auto" />
                </Link>
              </div>
            </Card>
          )}

          {/* Indicateur solde visuel */}
          <Card className="p-6 border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">
              Mes soldes
            </h3>

            <div className="space-y-5">
              {/* Solde annuel */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-medium text-slate-500">Annuel</span>
                  <span className="text-sm font-black text-blue-600">{solde} j</span>
                </div>
                <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((solde / 30) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Sur 30 jours maximum</p>
              </div>

              {/* Solde permission */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-medium text-slate-500">Permissions</span>
                  <span className="text-sm font-black text-teal-600">{soldePermission} j</span>
                </div>
                <div className="h-2 w-full bg-teal-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((soldePermission / 5) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Sur 10 jours maximum</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;