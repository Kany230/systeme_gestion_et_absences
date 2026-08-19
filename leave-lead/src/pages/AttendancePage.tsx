import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { attendanceService } from "@/api/pointageService";
import { Attendance, StatutPointage } from "@/data/pointage";
import {
  LogIn, LogOut, UserX, AlertTriangle, Loader2,
  Search, RefreshCw, Users, Clock, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────
const isoDate  = new Date().toISOString().split("T")[0];
const todayStr = new Date().toLocaleDateString("fr-FR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

const statutConfig: Record<string, { label: string; badge: string; dot: string }> = {
  [StatutPointage.present]: {
    label: "Présent",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot:   "bg-emerald-500",
  },
  [StatutPointage.retard]: {
    label: "En retard",
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    dot:   "bg-amber-500",
  },
  [StatutPointage.absent]: {
    label: "Absent",
    badge: "bg-red-50 text-red-700 border border-red-100",
    dot:   "bg-red-500",
  },
};

// ── Stat Card ─────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  sub?: string;
}
const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, borderColor, sub }: StatCardProps) => (
  <Card className="relative p-5 border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${borderColor} rounded-l-xl`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800 mt-1.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`h-11 w-11 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);
type StatutFilterType = "tous" | StatutPointage;

// ── Page ──────────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords]           = useState<Attendance[]>([]);
  const [loading, setLoading]           = useState(true);
  const [tabFilter, setTabFilter]       = useState<"all" | "late">("all");
  const [search, setSearch]             = useState("");
  const [statutFilter, setStatutFilter] = useState<StatutFilterType>("tous");
  const [detecting, setDetecting]       = useState(false);
  const [checkingIn, setCheckingIn]     = useState(false);
  const [checkingOut, setCheckingOut]   = useState(false);

  // ── Chargement ────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
  if (!user) return;
  setLoading(true);
  try {
    const roleNorm = user.role?.toLowerCase();
    let data: Attendance[] = [];

    console.log("Role détecté :", roleNorm);        // ← voir le rôle
    console.log("User id :", user.id);              // ← voir l'id
    console.log("Departement :", user.departement); // ← voir le département

    if (tabFilter === "late") {
      data = await attendanceService.getLateComers();
    } else {
      if      (roleNorm === "drh" || roleNorm === "admin") data = await attendanceService.getAll();
      else if (roleNorm === "manager")     data = await attendanceService.getByDepartement(user.id!);
      else if (roleNorm === "chef_equipe") data = await attendanceService.getByManager(user.id!);
      else                                data = await attendanceService.getByUser(user.id!);
    }

    console.log("Données reçues :", data);          // ← voir ce qui revient
    setRecords(data);
  } catch (e) {
    console.error("Erreur fetch :", e);             // ← voir l'erreur exacte
    toast.error("Erreur de chargement des pointages");
  } finally {
    setLoading(false);
  }
}, [user, tabFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  if (!user) return null;
  const roleNorm = user.role?.toLowerCase();

  // ── Mon pointage du jour ──────────────────────────────────────────────
  const myToday = records.find((r) => r.user?.id === user.id && r.date === isoDate);

  // ── Actions pointage ──────────────────────────────────────────────────
  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceService.checkIn(user.id!);
      toast.success("Arrivée pointée avec succès");
      fetchRecords();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du pointage d'arrivée");
    } finally { setCheckingIn(false); }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await attendanceService.checkOut(user.id!);
      toast.success("Départ pointé avec succès");
      fetchRecords();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du pointage de départ");
    } finally { setCheckingOut(false); }
  };

  const handleTriggerDetection = async () => {
    setDetecting(true);
    try {
      const msg = await attendanceService.triggerAbsenceDetection();
      toast.success(msg || "Détection des absences terminée");
      fetchRecords();
    } catch {
      toast.error("Erreur lors de la détection des absences");
    } finally { setDetecting(false); }
  };

  // ── Stats du jour ─────────────────────────────────────────────────────
  const todayRecords = records.filter((r) => r.date === isoDate);
  const nbPresent    = todayRecords.filter((r) => r.statut === StatutPointage.present).length;
  const nbRetard     = todayRecords.filter((r) => r.statut === StatutPointage.retard).length;
  const nbAbsent     = todayRecords.filter((r) => r.statut === StatutPointage.absent).length;

  // ── Filtrage combiné ──────────────────────────────────────────────────
  const filteredRecords = records.filter((r) => {
    const matchSearch  = !search.trim() ||
      `${r.user?.prenom ?? ""} ${r.user?.nom ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatut  = statutFilter === "tous" || r.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const showSupervisorUI =
    roleNorm === "drh" || roleNorm === "admin" ||
    roleNorm === "manager" || roleNorm === "chef_equipe";

  const getDescription = () => {
    if (roleNorm === "drh" || roleNorm === "admin") return "Vue globale — tous les pointages de l'entreprise";
    if (roleNorm === "manager") return `Département : ${user.departement?.nom || "—"}`;
    if (roleNorm === "chef_equipe") return "Pointages de votre équipe";
    return "Vos pointages personnels";
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pointage & Présences</h1>
          <p className="text-sm text-slate-400 mt-1">{getDescription()}</p>
        </div>
        {(roleNorm === "drh" || roleNorm === "admin") && (
          <Button
            onClick={handleTriggerDetection}
            disabled={detecting}
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shrink-0"
          >
            {detecting
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Détection en cours...</>
              : <><UserX className="h-4 w-4 mr-2" />Détecter les absences</>}
          </Button>
        )}
      </div>

      {/* ── Stats du jour (superviseurs) ── */}
      {showSupervisorUI && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Enregistrés" value={todayRecords.length}
            icon={Users} iconBg="bg-slate-100" iconColor="text-slate-600"
            borderColor="bg-slate-400" sub="Pointages du jour" />
          <StatCard label="Présents" value={nbPresent}
            icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            borderColor="bg-emerald-500" sub={nbPresent > 0 ? "En poste" : "Aucun présent"} />
          <StatCard label="En retard" value={nbRetard}
            icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600"
            borderColor="bg-amber-500" sub={nbRetard > 0 ? "Arrivée tardive" : "Aucun retard"} />
          <StatCard label="Absents" value={nbAbsent}
            icon={UserX} iconBg="bg-red-50" iconColor="text-red-600"
            borderColor="bg-red-500" sub={nbAbsent > 0 ? "Non pointés" : "Aucune absence"} />
        </div>
      )}

      {/* ── Carte pointage personnel ── */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border-none shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Mon pointage du jour
            </p>
            <p className="text-white text-xl font-bold capitalize">{todayStr}</p>

            {myToday ? (
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                  <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                  Arrivée : <span className="font-bold text-emerald-300 ml-1">{myToday.heureArrive || "--:--"}</span>
                </span>
                {myToday.heureDepart ? (
                  <span className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10">
                    <LogOut className="h-3.5 w-3.5 text-orange-400" />
                    Départ : <span className="font-bold text-orange-300 ml-1">{myToday.heureDepart}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> En poste
                  </span>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm mt-2">
                Aucun pointage enregistré aujourd'hui.
              </p>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleCheckIn}
              disabled={!!myToday?.heureArrive || checkingIn || loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30"
            >
              {checkingIn
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />En cours...</>
                : <><LogIn className="h-4 w-4 mr-2" />Pointer arrivée</>}
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!myToday?.heureArrive || !!myToday?.heureDepart || checkingOut || loading}
              variant="destructive" className="shadow-lg"
            >
              {checkingOut
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />En cours...</>
                : <><LogOut className="h-4 w-4 mr-2" />Pointer départ</>}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Filtres : onglets + recherche + statut ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Onglets Tous / Retards — superviseurs uniquement */}
        {showSupervisorUI && (
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            {[
              { val: "all",  label: "Tous" },
              { val: "late", label: "Retards", icon: AlertTriangle },
            ].map(({ val, label, icon: Icon }) => (
              <button
                key={val}
                onClick={() => setTabFilter(val as "all" | "late")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tabFilter === val
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filtre statut — superviseurs uniquement */}
        {showSupervisorUI && (
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            {[
              { val: "tous",                 label: "Statut" },
              { val: StatutPointage.present, label: "Présents" },
              { val: StatutPointage.retard,  label: "Retards" },
              { val: StatutPointage.absent,  label: "Absents" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setStatutFilter(val as StatutFilterType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statutFilter === val
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Recherche */}
        <div className="relative flex-1 min-w-[180px] max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Rechercher un employé..."
            className="pl-10 bg-white border-slate-200 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Refresh */}
        <Button variant="ghost" size="icon" onClick={() => fetchRecords()}
          disabled={loading} title="Actualiser"
          className="text-slate-400 hover:text-slate-700 shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Tableau ── */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {roleNorm !== "employe" && (
                <TableHead className="font-semibold text-slate-600">Employé</TableHead>
              )}
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Arrivée</TableHead>
              <TableHead className="font-semibold text-slate-600">Départ</TableHead>
              <TableHead className="font-semibold text-slate-600">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={roleNorm !== "employe" ? 5 : 4} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 animate-pulse">Chargement des pointages...</p>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={roleNorm !== "employe" ? 5 : 4} className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    {search
                      ? <Search className="h-6 w-6 text-slate-300" />
                      : <CheckCircle2 className="h-6 w-6 text-slate-300" />}
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    {search
                      ? `Aucun résultat pour "${search}"`
                      : "Aucun pointage trouvé pour cette sélection"}
                  </p>
                  
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((r) => {
                const cfg = statutConfig[r.statut] ?? {
                  label: r.statut, badge: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400",
                };
                return (
                  <TableRow key={r.id} className="hover:bg-slate-50/60 transition-colors">

                    {/* Employé avec avatar + dot statut */}
                    {roleNorm !== "employe" && (
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                              {r.user?.prenom?.[0]}{r.user?.nom?.[0]}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${cfg.dot}`} />
                          </div>
                          <span className="font-medium text-slate-800 text-sm">
                            {r.user?.prenom} {r.user?.nom}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {/* Date */}
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(r.date).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>

                    {/* Arrivée */}
                    <TableCell>
                      {r.heureArrive ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                          <LogIn className="h-3.5 w-3.5" />{r.heureArrive}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Départ */}
                    <TableCell>
                      {r.heureDepart ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-orange-500">
                          <LogOut className="h-3.5 w-3.5" />{r.heureDepart}
                        </span>
                      ) : r.heureArrive ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          En poste
                        </span>
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      <span className={`flex items-center gap-1.5 w-fit text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {r.statut === StatutPointage.present && <CheckCircle2 className="h-3 w-3" />}
                        {r.statut === StatutPointage.retard  && <AlertTriangle className="h-3 w-3" />}
                        {r.statut === StatutPointage.absent  && <UserX className="h-3 w-3" />}
                        {cfg.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        {!loading && filteredRecords.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {filteredRecords.length} pointage{filteredRecords.length > 1 ? "s" : ""} affiché{filteredRecords.length > 1 ? "s" : ""}
              {search && ` · recherche "${search}"`}
            </p>
            {(search || statutFilter !== "tous") && (
              <button
                onClick={() => { setSearch(""); setStatutFilter("tous"); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendancePage;