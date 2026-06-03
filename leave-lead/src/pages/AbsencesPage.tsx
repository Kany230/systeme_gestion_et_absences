import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { absenceService } from "@/api/absenceService";
import {
  Eye,
  FileCheck,
  AlertCircle,
  Calendar,
  Filter,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Absence, StatutAbsence } from "@/data/absences";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────
type PeriodeFiltre = "toutes" | "jour" | "mois" | "annee";
type StatutFiltre = "tous" | "justifie" | "non_justifie";

const BACKEND_BASE_URL = "http://localhost:8080/gestion-conge";

// ─── Modal de justification ─────────────────────────────────────────────────
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
    try {
      await onConfirm(motif, file);
      setMotif("");
      setFile(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setMotif("");
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-lg font-semibold">
            Justifier l'absence
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Motif */}
          <div className="space-y-1.5">
            <Label htmlFor="motif" className="text-sm font-medium text-slate-700">
              Motif <span className="text-red-500">*</span>
            </Label>
            <Input
              id="motif"
              placeholder="Ex : Maladie, rendez-vous médical..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              disabled={loading}
              className="border-slate-200 focus:ring-indigo-500"
            />
          </div>

          {/* Fichier */}
          <div className="space-y-1.5">
            <Label htmlFor="file" className="text-sm font-medium text-slate-700">
              Justificatif <span className="text-red-500">*</span>
            </Label>
            <label
              htmlFor="file"
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${file
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {file ? (
                <div className="flex flex-col items-center gap-1 text-indigo-600">
                  <FileCheck className="h-6 w-6" />
                  <span className="text-xs font-medium text-center px-4 truncate max-w-full">
                    {file.name}
                  </span>
                  <span className="text-xs text-indigo-400">
                    {(file.size / 1024).toFixed(1)} Ko
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <UploadCloud className="h-6 w-6" />
                  <span className="text-xs">Cliquez pour sélectionner un fichier</span>
                  <span className="text-xs text-slate-300">PNG, JPG, PDF acceptés</span>
                </div>
              )}
              <Input
                id="file"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                disabled={loading}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-slate-200"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!motif.trim() || !file || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Envoi en cours...
              </>
            ) : (
              "Confirmer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Page principale ────────────────────────────────────────────────────────
const AbsencesPage = () => {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<PeriodeFiltre>("toutes");
  const [statut, setStatut] = useState<StatutFiltre>("tous");

  // State modal
  const [modalOpen, setModalOpen] = useState(false);
  const [absenceIdAJustifier, setAbsenceIdAJustifier] = useState<number | null>(null);

  // ─── Chargement selon le rôle ─────────────────────────────────────────
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: Absence[] = [];
      const roleNorm = user.role?.toLowerCase();

      if (roleNorm === "employe") {
        data = await absenceService.getByUser(user.id!);
      } else if (roleNorm === "chef_equipe") {
        data = await absenceService.getByManager(user.id!);
      } else if (roleNorm === "manager") {
        data = await absenceService.getByManager(user.id!);
      } else if (roleNorm === "drh") {
        data = await absenceService.getAll();
      }

      setAbsences(data);
    } catch (error: any) {
      toast.error(error.message || "Erreur de chargement des absences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!user) return null;

  // ─── Ouvrir le modal ──────────────────────────────────────────────────
  const handleJustify = (id: number) => {
    setAbsenceIdAJustifier(id);
    setModalOpen(true);
  };

  // ─── Confirmer la justification depuis le modal ───────────────────────
  const handleConfirmJustification = async (motif: string, file: File) => {
    console.log("handleSubmit appelé", { motif, file });
    if (!absenceIdAJustifier) return;
    try {
        await absenceService.justifier(absenceIdAJustifier, motif, file);
        toast.success("Absence justifiée avec succès !");
    } catch (error: any) {
        toast.error(error.message || "Erreur lors de la justification");
        throw error; // 👈 re-throw pour que le modal reste ouvert
    } finally {
        fetchData(); // 👈 toujours recharger
    }
};

  // ─── Voir le justificatif ─────────────────────────────────────────────
  const handleViewJustification = (url: string) => {
    const completeUrl = url.startsWith("http") ? url : `${BACKEND_BASE_URL}${url}`;
    window.open(completeUrl, "_blank");
  };

  // ─── Filtrage ─────────────────────────────────────────────────────────
  const absencesFiltrees = absences.filter((a) => {
    const dateAbsence = new Date(
      a.dateAbsence?.includes("T") ? a.dateAbsence : `${a.dateAbsence}T00:00:00`
    );
    const aujourdhui = new Date();

    let respectePeriode = true;
    if (periode === "jour") {
      respectePeriode =
        dateAbsence.getFullYear() === aujourdhui.getFullYear() &&
        dateAbsence.getMonth() === aujourdhui.getMonth() &&
        dateAbsence.getDate() === aujourdhui.getDate();
    } else if (periode === "mois") {
      respectePeriode =
        dateAbsence.getMonth() === aujourdhui.getMonth() &&
        dateAbsence.getFullYear() === aujourdhui.getFullYear();
    } else if (periode === "annee") {
      respectePeriode = dateAbsence.getFullYear() === aujourdhui.getFullYear();
    }

    let respecteStatut = true;
    if (statut === "justifie") respecteStatut = a.statut === StatutAbsence.justifie ;
    else if (statut === "non_justifie") respecteStatut = a.statut === StatutAbsence.pas_justifie;

    return respectePeriode && respecteStatut;
  });

  // ─── Description dynamique ────────────────────────────────────────────
  const getDescription = () => {
    const roleNorm = user.role?.toLowerCase();
    if (roleNorm === "employe") return "Suivi de vos absences et justifications";
    if (roleNorm === "chef_equipe") return "Absences des membres de votre équipe";
    if (roleNorm === "manager") return `Absences du département ${user.departement?.nom || ""}`;
    return "Vue globale — toutes les absences de l'entreprise";
  };

  const roleNorm = user.role?.toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des Absences" description={getDescription()} />

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Filtre période */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 mr-1">Période :</span>
          {(["toutes", "jour", "mois", "annee"] as PeriodeFiltre[]).map((p) => (
            <Button
              key={p}
              variant={periode === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriode(p)}
            >
              {p === "toutes"
                ? "Toutes"
                : p === "jour"
                ? "Aujourd'hui"
                : p === "mois"
                ? "Ce mois"
                : "Cette année"}
            </Button>
          ))}
        </div>

        {/* Filtre statut */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 mr-1">Statut :</span>
          {(["tous", "justifie", "non_justifie"] as StatutFiltre[]).map((s) => (
            <Button
              key={s}
              variant={statut === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatut(s)}
            >
              {s === "tous" ? "Tous" : s === "justifie" ? "Justifiées" : "Non justifiées"}
            </Button>
          ))}
        </div>

        <p className="text-xs text-slate-400 ml-auto">
          {absencesFiltrees.length} absence(s)
        </p>
      </div>

      {/* Tableau des Absences */}
      <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {roleNorm !== "employe" && (
                <TableHead className="font-bold text-slate-700 w-[200px]">
                  Employé
                </TableHead>
              )}
              <TableHead className="font-bold text-slate-700">
                Date d'absence
              </TableHead>
              <TableHead className="font-bold text-slate-700">Motif</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">
                Action / Statut
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={roleNorm !== "employe" ? 4 : 3}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="animate-pulse">Chargement des absences...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : absencesFiltrees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={roleNorm !== "employe" ? 4 : 3}
                  className="text-center py-12 text-slate-400"
                >
                  <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
                  <p className="italic">Aucune absence ne correspond à vos filtres.</p>
                </TableCell>
              </TableRow>
            ) : (
              absencesFiltrees.map((a, index) => (
                <TableRow
                  key={a.id ?? index}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  {roleNorm !== "employe" && (
                    <TableCell className="font-medium text-slate-900">
                      {a.user
                        ? `${a.user.prenom} ${a.user.nom}`
                        : "Utilisateur inconnu"}
                    </TableCell>
                  )}

                  <TableCell className="text-slate-600">
                    {new Date(
                      a.dateAbsence?.includes("T")
                        ? a.dateAbsence
                        : `${a.dateAbsence}T00:00:00`
                    ).toLocaleDateString("fr-FR")}
                  </TableCell>

                  <TableCell className="italic text-slate-500 text-sm">
                    {a.motifJustifie || (
                      <span className="text-slate-300">En attente de motif...</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {a.statut === StatutAbsence.justifie  ? (
                        <>
                          <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                            <FileCheck className="h-3 w-3" /> Justifiée
                          </span>
                          {a.justificationUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              onClick={() => handleViewJustification(a.justificationUrl!)}
                            >
                              <Eye className="h-3.5 w-3.5" /> Voir
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                            Non justifiée
                          </span>
                          {roleNorm === "employe" && (
                            <Button
                              size="sm"
                              className="h-8 bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => handleJustify(a.id)}
                            >
                              Justifier
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
      </Card>

      {/* Modal de justification */}
      <JustifierModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setAbsenceIdAJustifier(null);
        }}
        onConfirm={handleConfirmJustification}
      />
    </div>
  );
};

export default AbsencesPage;