import { useEffect, useState, useCallback } from "react";
import { attendanceService } from "@/api/pointageService";
import { Attendance, StatutPointage } from "@/data/pointage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import {
  Clock, UserCheck, UserX, RefreshCw, Loader2, Search,
  LogIn, LogOut, AlertTriangle, CheckCircle2, Users,
} from "lucide-react";
import { toast } from "sonner";

// Définition du type pour le filtre incluant l'Enum et la valeur "tous"
type StatutFilterType = StatutPointage | "tous";

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Stat Card ──────────────────────────────────────────────────────────────
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

// ── Page ──────────────────────────────────────────────────────────────────
export default function AttendanceAdminPage() {
  const { user } = useAuth();
  const [attendances, setAttendances]   = useState<Attendance[]>([]);
  const [loading, setLoading]           = useState(true);
  const [detecting, setDetecting]       = useState(false);
  const [search, setSearch]             = useState("");
  // Correction ici : Utilisation du type défini plus haut
  const [statutFilter, setStatutFilter] = useState<StatutFilterType>("tous");
  const [checkingIn, setCheckingIn]     = useState(false);
  const [checkingOut, setCheckingOut]   = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAll();
      console.log("Données reçues :", data);           // ← voir ce qui arrive
    console.log("Format date exemple :", data[0]?.date); // ← voir le format
    console.log("isoDate attendu :", isoDate);
      setAttendances(data);
    } catch {
      toast.error("Erreur de chargement des pointages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTriggerDetection = async () => {
    setDetecting(true);
    try {
      const msg = await attendanceService.triggerAbsenceDetection();
      toast.success(msg || "Détection des absences terminée");
      loadData();
    } catch {
      toast.error("Échec de la détection");
    } finally {
      setDetecting(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setCheckingIn(true);
    try {
      await attendanceService.checkIn(user.id!);
      toast.success("Arrivée pointée avec succès");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du pointage d'arrivée");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setCheckingOut(true);
    try {
      await attendanceService.checkOut(user.id!);
      toast.success("Départ pointé avec succès");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du pointage de départ");
    } finally {
      setCheckingOut(false);
    }
  };

  const myToday = attendances.find(
    (a) => a.user?.id === user?.id && a.date === isoDate
  );

  const todayRecords = attendances.filter((a) => a.date === isoDate);
  const nbPresent    = todayRecords.filter((a) => a.statut === StatutPointage.present).length;
  const nbRetard     = todayRecords.filter((a) => a.statut === StatutPointage.retard).length;
  const nbAbsent     = todayRecords.filter((a) => a.statut === StatutPointage.absent).length;

  const filtered = attendances.filter((a) => {
    const matchSearch = `${a.user?.prenom ?? ""} ${a.user?.nom ?? ""}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatut = statutFilter === "tous" ? true : a.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pointage & Présences</h1>
          <p className="text-sm text-slate-400 mt-1 capitalize">{todayStr}</p>
        </div>
        <Button
          onClick={handleTriggerDetection}
          disabled={detecting}
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shrink-0"
        >
          {detecting
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Détection en cours...</>
            : <><UserX className="mr-2 h-4 w-4" />Détecter les absences</>}
        </Button>
      </div>

      {/* ── Stats du jour ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enregistrés" value={todayRecords.length} icon={Users} iconBg="bg-slate-100" iconColor="text-slate-600" borderColor="bg-slate-400" sub="Pointages du jour" />
        <StatCard label="Présents" value={nbPresent} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" borderColor="bg-emerald-500" sub={nbPresent > 0 ? "En poste" : "Aucun présent"} />
        <StatCard label="En retard" value={nbRetard} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" borderColor="bg-amber-500" sub={nbRetard > 0 ? "Arrivée tardive" : "Aucun retard"} />
        <StatCard label="Absents" value={nbAbsent} icon={UserX} iconBg="bg-red-50" iconColor="text-red-600" borderColor="bg-red-500" sub={nbAbsent > 0 ? "Non pointés" : "Aucune absence"} />
      </div>

      {/* ── Carte pointage personnel ── */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border-none shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Mon pointage du jour</p>
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
                    <UserCheck className="h-3.5 w-3.5" /> En poste
                  </span>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-sm mt-2">Aucun pointage enregistré aujourd'hui.</p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleCheckIn} disabled={!!myToday?.heureArrive || checkingIn || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30">
              {checkingIn ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />En cours...</> : <><LogIn className="h-4 w-4 mr-2" />Pointer arrivée</>}
            </Button>
            <Button onClick={handleCheckOut} disabled={!myToday?.heureArrive || !!myToday?.heureDepart || checkingOut || loading} variant="destructive" className="shadow-lg">
              {checkingOut ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />En cours...</> : <><LogOut className="h-4 w-4 mr-2" />Pointer départ</>}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Recherche + filtre statut ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input placeholder="Rechercher un employé..." className="pl-10 bg-white border-slate-200 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
          {[
            { val: "tous" as const, label: "Tous" },
            { val: StatutPointage.present, label: "Présents" },
            { val: StatutPointage.retard, label: "Retards" },
            { val: StatutPointage.absent, label: "Absents" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setStatutFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statutFilter === val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="icon" onClick={loadData} disabled={loading} title="Actualiser" className="text-slate-400 hover:text-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Tableau ── */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Employé</TableHead>
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Arrivée</TableHead>
              <TableHead className="font-semibold text-slate-600">Départ</TableHead>
              <TableHead className="font-semibold text-slate-600">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 animate-pulse">Chargement des pointages...</p>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <p className="text-sm font-medium text-slate-500">Aucun pointage trouvé</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => {
                const cfg = statutConfig[a.statut] ?? { label: a.statut, badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
                return (
                  <TableRow key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {a.user?.prenom?.[0]}{a.user?.nom?.[0]}
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">{a.user?.prenom} {a.user?.nom}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{new Date(a.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{a.heureArrive ? <span className="text-emerald-600 font-semibold">{a.heureArrive}</span> : "—"}</TableCell>
                    <TableCell>{a.heureDepart ? <span className="text-orange-500 font-semibold">{a.heureDepart}</span> : "—"}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.badge}`}>{cfg.label}</span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}