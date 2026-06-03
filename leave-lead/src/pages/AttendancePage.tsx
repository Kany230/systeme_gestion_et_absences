import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { attendanceService } from "@/api/pointageService";
import { Attendance, StatutPointage } from "@/data/pointage";
import {
  LogIn,
  LogOut,
  UserX,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const todayStr = new Date().toLocaleDateString("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});
const isoDate = new Date().toISOString().split("T")[0];

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // ─── Chargement selon le rôle ──────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const roleNorm = user.role?.toLowerCase();
      let data: Attendance[] = [];

      if (filter === "late") {
        // Filtre retards : disponible pour DRH, manager, chef_equipe
        data = await attendanceService.getLateComers();
      } else {
        // Filtre "tous" selon le rôle :
        if (roleNorm === "drh") {
          // DRH → tous les pointages de l'entreprise
          data = await attendanceService.getAll();

        } else if (roleNorm === "manager") {
          // Manager → tous les pointages de son département
          data = await attendanceService.getByDepartement(user.departement?.id!);

        } else if (roleNorm === "chef_equipe") {
          // Chef d'équipe → pointages de son équipe uniquement
          data = await attendanceService.getByManager(user.id!);

        } else {
          // Employé → uniquement ses propres pointages
          data = await attendanceService.getByUser(user.id!);
        }
      }

      setRecords(data);
    } catch (error: any) {
      toast.error("Erreur de chargement des pointages");
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (!user) return null;

  const roleNorm = user.role?.toLowerCase();

  // Pointage du jour de l'utilisateur connecté
  const myToday = records.find(
    (r) => r.user?.id === user.id && r.date === isoDate
  );

  // ─── Actions de pointage ───────────────────────────────────────────────
  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn(user.id!);
      toast.success("Arrivée pointée avec succès");
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du pointage d'arrivée");
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut(user.id!);
      toast.success("Départ pointé avec succès");
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du pointage de départ");
    }
  };

  // ─── Action DRH : détecter les absences ───────────────────────────────
  const handleTriggerDetection = async () => {
    try {
      const message = await attendanceService.triggerAbsenceDetection();
      toast.success(message || "Détection des absences terminée");
      fetchRecords();
    } catch (error: any) {
      toast.error("Erreur lors de la détection des absences");
    }
  };

  // ─── Titre dynamique selon le rôle ────────────────────────────────────
  const getDescription = () => {
    if (roleNorm === "drh") return "Vue globale — tous les pointages de l'entreprise";
    if (roleNorm === "manager") return `Département : ${user.departement?.nom || "—"}`;
    if (roleNorm === "chef_equipe") return "Pointages de votre équipe";
    return "Vos pointages personnels";
  };

  // ─── Onglets visibles selon le rôle ───────────────────────────────────
  const showTabs = roleNorm === "drh" || roleNorm === "manager" || roleNorm === "chef_equipe";

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex justify-between items-start">
        <PageHeader
          title="Pointage & Présences"
          description={getDescription()}
        />
        {/* Bouton détection absences — DRH uniquement */}
        {roleNorm === "drh" && (
          <Button
            onClick={handleTriggerDetection}
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            <UserX className="h-4 w-4 mr-2" />
            Détecter les absences
          </Button>
        )}
      </div>

      {/* ── Carte de pointage du jour ── */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-none shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Aujourd'hui
            </p>
            <p className="text-2xl font-bold text-slate-800 capitalize">
              {todayStr}
            </p>
            {myToday && (
              <div className="flex gap-4 mt-2 text-sm">
                <span className="bg-white px-2 py-1 rounded shadow-sm">
                  Entrée : <b className="text-emerald-600">{myToday.heureArrive || "--:--"}</b>
                </span>
                {myToday.heureDepart && (
                  <span className="bg-white px-2 py-1 rounded shadow-sm">
                    Sortie : <b className="text-orange-600">{myToday.heureDepart}</b>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={!!myToday?.heureArrive || loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Pointer arrivée
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={!myToday?.heureArrive || !!myToday?.heureDepart || loading}
              variant="destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Pointer départ
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Onglets filtre (DRH / Manager / Chef seulement) ── */}
      {showTabs && (
        <Tabs defaultValue="all" onValueChange={setFilter} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="late" className="flex gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              Retards
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* ── Tableau des pointages ── */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {/* Colonne Employé masquée pour l'employé lui-même */}
              {roleNorm !== "employe" && (
                <TableHead className="font-bold text-slate-700">Employé</TableHead>
              )}
              <TableHead className="font-bold text-slate-700">Date</TableHead>
              <TableHead className="font-bold text-slate-700">Arrivée</TableHead>
              <TableHead className="font-bold text-slate-700">Départ</TableHead>
              <TableHead className="font-bold text-slate-700">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={roleNorm !== "employe" ? 5 : 4}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="animate-pulse">Chargement des pointages...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={roleNorm !== "employe" ? 5 : 4}
                  className="text-center py-12 text-slate-400 italic"
                >
                  Aucun pointage trouvé pour cette sélection.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow
                  key={r.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Nom de l'employé — masqué pour l'employé lui-même */}
                  {roleNorm !== "employe" && (
                    <TableCell className="font-medium text-slate-900">
                      {r.user?.prenom} {r.user?.nom}
                    </TableCell>
                  )}
                  <TableCell className="text-slate-600">
                    {new Date(r.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="font-mono text-emerald-600 font-semibold">
                    {r.heureArrive || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-orange-600 font-semibold">
                    {r.heureDepart || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={StatutPointage[r.statut]} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AttendancePage;