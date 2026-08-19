import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { absenceService } from "@/api/absenceService";
import { leaveService } from "@/api/congeService";
import {
  Eye, FileCheck, AlertCircle, Calendar, Filter, Loader2,
  UploadCloud, FileText, Users, Clock, CheckCircle2,
  XCircle, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Absence, StatutAbsence } from "@/data/absences";
import { LeaveRequest } from "@/data/conges";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────
type PeriodeFiltre = "toutes" | "jour" | "mois" | "annee";
type StatutFiltre  = "tous" | "justifie" | "non_justifie";

const BACKEND_BASE_URL = "http://localhost:8080/conge-absence";
const isImage   = (url: string) => !!url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
const getFullUrl = (url: string) => url?.startsWith("http") ? url : `${BACKEND_BASE_URL}${url}`;
const todayISO  = () => new Date().toISOString().split("T")[0];

// ── Modal Justifier ────────────────────────────────────────────────────────
interface JustifierModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motif: string, file: File) => Promise<void>;
}

const JustifierModal = ({ open, onClose, onConfirm }: JustifierModalProps) => {
  const [motif, setMotif] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!motif.trim() || !file) return;
    setLoading(true);
    try { await onConfirm(motif, file); setMotif(""); setFile(null); }
    finally { setLoading(false); }
  };

  const handleClose = () => {
    if (loading) return;
    setMotif(""); setFile(null); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800">
                Justifier l'absence
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Renseignez le motif et joignez un justificatif
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Motif */}
          <div className="space-y-1.5">
            <Label htmlFor="motif" className="text-sm font-semibold text-slate-700">
              Motif <span className="text-red-500">*</span>
            </Label>
            <Input
              id="motif"
              placeholder="Ex : Maladie, rendez-vous médical, urgence familiale..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              disabled={loading}
              className="border-slate-200 focus:ring-indigo-500 h-10"
            />
          </div>

          {/* Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">
              Justificatif <span className="text-red-500">*</span>
            </Label>
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                ${file
                  ? "border-indigo-300 bg-indigo-50/60"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/30"}
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-1.5 text-indigo-600">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-center px-4 truncate max-w-full">{file.name}</span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {(file.size / 1024).toFixed(1)} Ko
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Glissez ou cliquez pour choisir</span>
                  <span className="text-[10px] text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">
                    PNG · JPG · PDF acceptés
                  </span>
                </div>
              )}
              <Input id="file-upload" type="file" accept="image/*,.pdf"
                className="hidden" disabled={loading}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}
            className="border-slate-200 text-slate-600">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!motif.trim() || !file || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Envoi en cours...</>
              : <><CheckCircle2 className="h-4 w-4 mr-2" />Confirmer</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Modal Voir Justificatif ────────────────────────────────────────────────
interface ViewJustificationModalProps {
  open: boolean;
  onClose: () => void;
  absence: Absence | null;
}

const ViewJustificationModal = ({ open, onClose, absence }: ViewJustificationModalProps) => {
  if (!absence) return null;
  const url = absence.justificationUrl ? getFullUrl(absence.justificationUrl) : null;
  const dateLabel = new Date(
    absence.dateAbsence?.includes("T") ? absence.dateAbsence : `${absence.dateAbsence}T00:00:00`
  ).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800">
                Justificatif d'absence
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">{dateLabel}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {absence.motifJustifie && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Motif déclaré
              </p>
              <p className="text-sm font-medium text-slate-800">{absence.motifJustifie}</p>
            </div>
          )}

          {url ? (
            isImage(url) ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={url} alt="Justificatif" className="w-full max-h-80 object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-8 bg-slate-50 rounded-xl border border-slate-200">
                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Document PDF</p>
                  <p className="text-xs text-slate-400 mt-0.5">Cliquez pour l'ouvrir dans un nouvel onglet</p>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" /> Ouvrir le justificatif
                </a>
              </div>
            )
          ) : (
            <div className="py-8 text-center text-slate-400">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm italic">Aucun fichier joint à cette absence.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Tableau En Congé / Retards ─────────────────────────────────────────────
interface LeaveTableProps {
  rows: LeaveRequest[];
  emptyMsg: string;
  emptyIcon?: React.ElementType;
  loading?: boolean;
}

const LeaveTable = ({ rows, emptyMsg, emptyIcon: EmptyIcon = AlertCircle, loading = false }: LeaveTableProps) => (
  <Table>
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="font-semibold text-slate-600">Employé</TableHead>
        <TableHead className="font-semibold text-slate-600">Début</TableHead>
        <TableHead className="font-semibold text-slate-600">Fin</TableHead>
        <TableHead className="font-semibold text-slate-600">Type de congé</TableHead>
        <TableHead className="font-semibold text-slate-600">Statut</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <span className="text-sm text-slate-400 animate-pulse">Chargement...</span>
          </TableCell>
        </TableRow>
      ) : rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <EmptyIcon className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 italic">{emptyMsg}</p>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((r, i) => (
          <TableRow key={r.id ?? i} className="hover:bg-slate-50/60 transition-colors">
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] shrink-0">
                  {(r.user?.prenom?.[0] || r.userPrenom?.[0])}
                  {(r.user?.nom?.[0] || r.userNom?.[0])}
                </div>
                <span className="font-medium text-slate-800 text-sm">
                  {r.user ? `${r.user.prenom} ${r.user.nom}` : (r.userPrenom ? `${r.userPrenom} ${r.userNom}` : "—")}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
              {new Date(r.dateDebut).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
              {new Date(r.dateFin).toLocaleDateString("fr-FR")}
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
              {r.typeConge?.nomType || r.typeCongeNom || "—"}
            </TableCell>
            <TableCell>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full
                ${r.statut === "validee"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                {r.statut === "validee" ? "Validé" : r.statut}
              </span>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

// ── Filtres + Tableau Absences ─────────────────────────────────────────────
interface AbsencesFiltersAndTableProps {
  absencesFiltrees: Absence[];
  loading: boolean;
  periode: PeriodeFiltre;
  setPeriode: (p: PeriodeFiltre) => void;
  statut: StatutFiltre;
  setStatut: (s: StatutFiltre) => void;
  roleNorm: string | undefined;
  currentUserId: number | undefined;
  onJustify: (id: number) => void;
  onView: (a: Absence) => void;
}

const AbsencesFiltersAndTable = ({
  absencesFiltrees, loading,
  periode, setPeriode, statut, setStatut,
  roleNorm, currentUserId, onJustify, onView,
}: AbsencesFiltersAndTableProps) => {
  const nonJustif = absencesFiltrees.filter(a => a.statut === StatutAbsence.pas_justifie).length;
  const justif    = absencesFiltrees.filter(a => a.statut === StatutAbsence.justifie).length;

  return (
    <div className="space-y-4">
      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Période */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as PeriodeFiltre)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="toutes">Toutes périodes</option>
            <option value="jour">Aujourd'hui</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value as StatutFiltre)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="tous">Tous les statuts</option>
            <option value="justifie">Justifiées</option>
            <option value="non_justifie">Non justifiées</option>
          </select>
        </div>

        {/* Compteurs rapides */}
        <div className="ml-auto flex items-center gap-3">
          {nonJustif > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              <XCircle className="h-3 w-3" /> {nonJustif} non justifiée{nonJustif > 1 ? "s" : ""}
            </span>
          )}
          {justif > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> {justif} justifiée{justif > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {absencesFiltrees.length} résultat{absencesFiltrees.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Tableau */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {roleNorm !== "employe" && (
                <TableHead className="font-semibold text-slate-600 w-[200px]">Employé</TableHead>
              )}
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Motif</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Statut / Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={roleNorm !== "employe" ? 4 : 3} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 animate-pulse">Chargement des absences...</p>
                </TableCell>
              </TableRow>
            ) : absencesFiltrees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={roleNorm !== "employe" ? 4 : 3} className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Aucune absence trouvée</p>
                  <p className="text-xs text-slate-400 mt-1">Essayez de modifier les filtres</p>
                </TableCell>
              </TableRow>
            ) : (
              absencesFiltrees.map((a, index) => (
                <TableRow key={a.id ?? index} className="hover:bg-slate-50/60 transition-colors">
                  {roleNorm !== "employe" && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] shrink-0">
                          {a.user?.prenom?.[0]}{a.user?.nom?.[0]}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">
                          {a.user ? `${a.user.prenom} ${a.user.nom}` : "Inconnu"}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-slate-600 text-sm">
                    {new Date(
                      a.dateAbsence?.includes("T") ? a.dateAbsence : `${a.dateAbsence}T00:00:00`
                    ).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {a.motifJustifie
                      ? <span className="text-slate-700">{a.motifJustifie}</span>
                      : <span className="text-slate-300 italic">Motif non renseigné</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {a.statut === StatutAbsence.justifie ? (
                        <>
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Justifiée
                          </span>
                          <Button variant="outline" size="sm"
                            className="h-8 gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
                            onClick={() => onView(a)}>
                            <Eye className="h-3.5 w-3.5" /> Voir
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                            <XCircle className="h-3 w-3" /> Non justifiée
                          </span>
                          {/* ✅ MODIF : bouton Justifier visible pour tous les rôles, mais uniquement sur ses propres absences */}
                          {a.user?.id === currentUserId && (
                            <Button size="sm"
                              className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
                              onClick={() => onJustify(a.id)}>
                              <FileCheck className="h-3.5 w-3.5" /> Justifier
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer compteur */}
        {!loading && absencesFiltrees.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs text-slate-400">
              {absencesFiltrees.length} absence{absencesFiltrees.length > 1 ? "s" : ""} affichée{absencesFiltrees.length > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── Page Principale ────────────────────────────────────────────────────────
const AbsencesPage = () => {
  const { user } = useAuth();
  const [absences,       setAbsences]       = useState<Absence[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [periode,        setPeriode]        = useState<PeriodeFiltre>("toutes");
  const [statut,         setStatut]         = useState<StatutFiltre>("tous");
  const [modalOpen,      setModalOpen]      = useState(false);
  const [absenceIdAJustifier, setAbsenceIdAJustifier] = useState<number | null>(null);
  const [viewOpen,       setViewOpen]       = useState(false);
  const [absenceAVoir,   setAbsenceAVoir]   = useState<Absence | null>(null);
  const [absentsConges,  setAbsentsConges]  = useState<LeaveRequest[]>([]);
  const [retards,        setRetards]        = useState<LeaveRequest[]>([]);
  const [loadingConges,  setLoadingConges]  = useState(false);

  const roleNorm = user?.role?.toLowerCase();

  const fetchAbsences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: Absence[] = [];

      if (roleNorm === "employe") {
        // Employé : uniquement ses propres absences
        data = await absenceService.getByUser(user.id!);
      } else if (roleNorm === "chef_equipe") {
        // ✅ MODIF : ses propres absences + celles de son équipe
        const [mine, team] = await Promise.all([
          absenceService.getByUser(user.id!),
          absenceService.getByChef(user.id!),
        ]);
        data = [...mine, ...team];
      } else if (roleNorm === "manager") {
        // ✅ MODIF : ses propres absences + celles de son département
        const [mine, team] = await Promise.all([
          absenceService.getByUser(user.id!),
          absenceService.getByManager(user.id!),
        ]);
        data = [...mine, ...team];
      } else if (roleNorm === "drh" || roleNorm === "admin") {
        // DRH / Admin : toutes les absences (les leurs sont incluses)
        data = await absenceService.getAll();
      }

      setAbsences(data);
    } catch (e: any) {
      toast.error(e.message || "Erreur de chargement des absences");
    } finally {
      setLoading(false);
    }
  };

  const fetchCongesData = async () => {
    if (!user || roleNorm === "employe") return;
    setLoadingConges(true);
    try {
      const today = todayISO();
      if (roleNorm === "chef_equipe") {
        const [abs, ret] = await Promise.all([
          leaveService.getAbsentsByEquipe(user.id!, today),
          leaveService.getRetardsByEquipe(user.id!),
          
        ]);
        setAbsentsConges(abs); setRetards(ret);
      } else if (roleNorm === "manager") {
        const [abs, ret] = await Promise.all([
          leaveService.getAbsentsByDepartement(user.id!, today),
          leaveService.getRetardsByDepartement(user.id!),
        ]);
        setAbsentsConges(abs); setRetards(ret);
      } else if (roleNorm === "drh" || roleNorm === "admin") {
        const [abs, ret] = await Promise.all([
          leaveService.getTousLesAbsents(today),
          leaveService.getLateReturns(),
        ]);
        setAbsentsConges(abs); setRetards(ret);
        console.log("Données retards reçues :", ret);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur de chargement des données congés");
    } finally {
      setLoadingConges(false);
    }
  };

  useEffect(() => { fetchAbsences(); fetchCongesData(); }, [user]);

  if (!user) return null;

  const handleJustify = (id: number) => { setAbsenceIdAJustifier(id); setModalOpen(true); };
  const handleViewJustification = (a: Absence) => { setAbsenceAVoir(a); setViewOpen(true); };

  const handleConfirmJustification = async (motif: string, file: File) => {
    if (!absenceIdAJustifier) return;
    try {
      await absenceService.justifier(absenceIdAJustifier, motif, file);
      toast.success("Absence justifiée avec succès !");
      setModalOpen(false); setAbsenceIdAJustifier(null);
      await fetchAbsences();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la justification");
      throw e;
    }
  };

  const absencesFiltrees = absences.filter((a) => {
    const d = new Date(
      a.dateAbsence?.includes("T") ? a.dateAbsence : `${a.dateAbsence}T00:00:00`
    );
    const now = new Date();
    const okPeriode =
      periode === "toutes" ? true :
      periode === "jour"   ? d.toDateString() === now.toDateString() :
      periode === "mois"   ? d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() :
                             d.getFullYear() === now.getFullYear();
    const okStatut =
      statut === "tous"      ? true :
      statut === "justifie"  ? a.statut === StatutAbsence.justifie :
                               a.statut === StatutAbsence.pas_justifie;
    return okPeriode && okStatut;
  });

  // Compteurs globaux pour les badges d'onglets
  const totalNonJustif = absences.filter(a => a.statut === StatutAbsence.pas_justifie).length;

  const getHeaderDescription = () => {
    if (roleNorm === "employe")      return "Consultez et justifiez vos absences";
    if (roleNorm === "chef_equipe")  return "Absences des membres de votre équipe";
    if (roleNorm === "manager")      return `Département ${user.departement?.nom || ""} — absences et congés`;
    return "Vue globale · Toutes les absences de l'entreprise";
  };

  const showCongesTabs = roleNorm !== "employe";

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Absences</h1>
          <p className="text-sm text-slate-500 mt-1">{getHeaderDescription()}</p>
        </div>

        {/* Résumé rapide en haut à droite */}
        {totalNonJustif > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {totalNonJustif} absence{totalNonJustif > 1 ? "s" : ""} non justifiée{totalNonJustif > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Contenu principal ── */}
      {showCongesTabs ? (
        <Tabs defaultValue="absences">
          <TabsList className="bg-slate-100/80 rounded-xl p-1 gap-1">
            {/* Onglet Absences */}
            <TabsTrigger value="absences"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4" />
              Absences
              {totalNonJustif > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalNonJustif}
                </span>
              )}
            </TabsTrigger>

            {/* Onglet En congé */}
            <TabsTrigger value="absents-conge"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              En congé aujourd'hui
              {absentsConges.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {absentsConges.length}
                </span>
              )}
            </TabsTrigger>

            {/* Onglet Retards */}
            <TabsTrigger value="retards"
              className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" />
              Retards de retour
              {retards.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {retards.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="absences" className="mt-5">
            <AbsencesFiltersAndTable
              absencesFiltrees={absencesFiltrees} loading={loading}
              periode={periode} setPeriode={setPeriode}
              statut={statut} setStatut={setStatut}
              roleNorm={roleNorm}
              currentUserId={user.id}
              onJustify={handleJustify} onView={handleViewJustification}
            />
          </TabsContent>

          <TabsContent value="absents-conge" className="mt-5">
            <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
              <LeaveTable
                rows={absentsConges} loading={loadingConges}
                emptyMsg="Aucun employé en congé aujourd'hui."
                emptyIcon={Calendar}
              />
            </Card>
          </TabsContent>

          <TabsContent value="retards" className="mt-5">
            <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
              <LeaveTable
                rows={retards} loading={loadingConges}
                emptyMsg="Aucun retard de retour détecté."
                emptyIcon={Clock}
              />
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <AbsencesFiltersAndTable
          absencesFiltrees={absencesFiltrees} loading={loading}
          periode={periode} setPeriode={setPeriode}
          statut={statut} setStatut={setStatut}
          roleNorm={roleNorm}
          currentUserId={user.id}
          onJustify={handleJustify} onView={handleViewJustification}
        />
      )}

      {/* ── Modals ── */}
      <JustifierModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setAbsenceIdAJustifier(null); }}
        onConfirm={handleConfirmJustification}
      />
      <ViewJustificationModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setAbsenceAVoir(null); }}
        absence={absenceAVoir}
      />
    </div>
  );
};

export default AbsencesPage;