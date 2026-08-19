import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "@/api/congeService";
import { TypeConge } from "@/data/conges";
import {
  Plus, FileText, Loader2, CalendarDays, Clock,
  CheckCircle2, XCircle, AlertCircle, UploadCloud, X,
} from "lucide-react";
import { toast } from "sonner";

// ── Statut config ─────────────────────────────────────────────────────────
const statutConfig: Record<string, { label: string; badge: string }> = {
  en_attente_chef_equipe: { label: "En attente chef",  badge: "bg-amber-50 text-amber-700 border border-amber-100" },
  en_attente_manager:     { label: "En attente manager", badge: "bg-amber-50 text-amber-700 border border-amber-100" },
  en_attente_drh:         { label: "En attente DRH",   badge: "bg-orange-50 text-orange-700 border border-orange-100" },
  validee:                { label: "Validée",           badge: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  refusee:                { label: "Refusée",           badge: "bg-red-50 text-red-700 border border-red-100" },
  annulee:                { label: "Annulée",           badge: "bg-slate-100 text-slate-500 border border-slate-200" },
  terminee:               { label: "Terminée",          badge: "bg-slate-100 text-slate-500 border border-slate-200" },
};

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

const isCancellable = (statut: string) =>
  ["en_attente_chef_equipe", "en_attente_manager", "en_attente_drh"].includes(statut?.toLowerCase());

function calcOuvrables(start: string, end: string): number {
  if (!start || !end) return 0;
  let count = 0;
  const cur = new Date(start);
  const fin = new Date(end);
  while (cur <= fin) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// ── Page ──────────────────────────────────────────────────────────────────
const LeavesPage = () => {
  const { user } = useAuth();
  const [leaves,     setLeaves]     = useState<any[]>([]);
  const [typesConge, setTypesConge] = useState<TypeConge[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [open,       setOpen]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const [form, setForm] = useState({
    typeId: "", startDate: "", endDate: "",
    justificationFile: null as File | null,
  });

  const typeSelectionne  = typesConge.find((t) => String(t.id) === form.typeId);
  const justifRequise    = Boolean(typeSelectionne?.demandeJustification);
  const joursCalcules    = useMemo(() => calcOuvrables(form.startDate, form.endDate), [form.startDate, form.endDate]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [data, types] = await Promise.all([
        leaveService.getMyLeaves(user.id),
        leaveService.getTypeConges(),
      ]);
      setLeaves(data);
      setTypesConge(types);
    } catch (e: any) {
      toast.error(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user?.id]);

  const resetForm = () => setForm({ typeId: "", startDate: "", endDate: "", justificationFile: null });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (justifRequise && !form.justificationFile) {
      toast.error("Un justificatif est obligatoire pour ce type de congé.");
      return;
    }
    if (form.startDate > form.endDate) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }
    setSubmitting(true);
    try {
      let justificationUrl = "";
      if (form.justificationFile) {
        justificationUrl = await leaveService.uploadJustificatif(form.justificationFile);
      }
      await leaveService.createLeave({
        user: { id: user.id },
        dateDebut: form.startDate,
        dateFin: form.endDate,
        typeConge: { id: parseInt(form.typeId) } as any,
        justificationUrl,
      });
      toast.success("Demande envoyée avec succès !");
      setOpen(false);
      resetForm();
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      const msg = await leaveService.cancelLeave(id);
      toast.success(msg || "Demande annulée");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Impossible d'annuler cette demande");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm text-slate-400 animate-pulse">Chargement de vos congés...</p>
    </div>
  );

  const pending = leaves.filter((l) => isCancellable(l.statut)).length;

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes demandes de congé</h1>
          <p className="text-sm text-slate-400 mt-1">
            {leaves.length} demande{leaves.length > 1 ? "s" : ""} au total
            {pending > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {pending} en attente de validation
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" /> Nouvelle demande
        </Button>
      </div>

      {/* ── Tableau ── */}
      <Card className="p-0 overflow-hidden border-slate-100 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Type de congé</TableHead>
              <TableHead className="font-semibold text-slate-600">Période</TableHead>
              <TableHead className="font-semibold text-slate-600">Jours</TableHead>
              <TableHead className="font-semibold text-slate-600">Statut</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Aucune demande de congé</p>
                  <p className="text-xs text-slate-400 mt-1">Cliquez sur "Nouvelle demande" pour commencer</p>
                  <Button size="sm" onClick={() => setOpen(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Poser un congé
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((l: any) => {
                const st = statutConfig[l.statut?.toLowerCase()] ?? { label: l.statut, badge: "bg-slate-100 text-slate-500" };
                const isCanc = isCancellable(l.statut);
                return (
                  <TableRow key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <CalendarDays className="h-4 w-4 text-blue-500" />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">{l.typeCongeNom ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {fmt(l.dateDebut)} → {fmt(l.dateFin)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600 text-sm">
                        {l.nombreJoursDeduit ?? "—"} j
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${st.badge}`}>
                        {st.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isCanc && (
                        <Button variant="ghost" size="sm"
                          disabled={cancelling === l.id}
                          onClick={() => handleCancel(l.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-8">
                          {cancelling === l.id
                            ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Annulation...</>
                            : <><XCircle className="h-3.5 w-3.5 mr-1.5" />Annuler</>}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ── Dialog Nouvelle Demande ── */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800">
                  Nouvelle demande de congé
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Renseignez le type, les dates et un justificatif si nécessaire
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4 pt-1">

            {/* Type de congé */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Type de congé <span className="text-red-500">*</span>
              </Label>
              <Select value={form.typeId} onValueChange={(v) => setForm({ ...form, typeId: v })}>
                <SelectTrigger className="border-slate-200 h-10">
                  <SelectValue placeholder="Choisir le type de congé..." />
                </SelectTrigger>
                <SelectContent>
                  {typesConge.length === 0
                    ? <SelectItem value="no-type" disabled>Aucun type disponible</SelectItem>
                    : typesConge.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>{t.nomType}</SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">
                  Date de début <span className="text-red-500">*</span>
                </Label>
                <Input id="startDate" type="date" required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="border-slate-200 h-10" disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700">
                  Date de fin <span className="text-red-500">*</span>
                </Label>
                <Input id="endDate" type="date" required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="border-slate-200 h-10" disabled={submitting}
                />
              </div>
            </div>

            {/* Calcul jours ouvrables en temps réel */}
            {form.startDate && form.endDate && form.startDate <= form.endDate && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                <p className="text-sm text-blue-700">
                  <span className="font-black text-blue-800">{joursCalcules}</span> jour{joursCalcules > 1 ? "s" : ""} ouvrable{joursCalcules > 1 ? "s" : ""} estimé{joursCalcules > 1 ? "s" : ""}
                </p>
                {typeSelectionne?.estDeductible && (
                  <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    Déductible
                  </span>
                )}
              </div>
            )}

            {/* Justificatif */}
            {form.typeId && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  Justificatif{" "}
                  {justifRequise
                    ? <span className="text-red-500">*</span>
                    : <span className="text-slate-400 font-normal">(optionnel)</span>}
                </Label>
                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  form.justificationFile
                    ? "border-blue-300 bg-blue-50/60"
                    : justifRequise
                      ? "border-red-200 bg-red-50/40 hover:bg-red-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60"
                } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {form.justificationFile ? (
                    <div className="flex items-center gap-3 px-4">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-blue-700 truncate">{form.justificationFile.name}</p>
                        <p className="text-[10px] text-blue-400">{(form.justificationFile.size / 1024).toFixed(1)} Ko</p>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); setForm({ ...form, justificationFile: null }); }}
                        className="ml-auto text-blue-400 hover:text-red-500 shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <UploadCloud className="h-5 w-5" />
                      <span className="text-xs font-medium">Cliquez pour sélectionner</span>
                      <span className="text-[10px] text-slate-300">PNG · JPG · PDF</span>
                    </div>
                  )}
                  <input type="file" accept="image/*,.pdf" className="hidden" disabled={submitting}
                    onChange={(e) => setForm({ ...form, justificationFile: e.target.files?.[0] ?? null })} />
                </label>
                {justifRequise && !form.justificationFile && (
                  <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Obligatoire pour ce type de congé
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2"
              disabled={submitting || !form.typeId || (justifRequise && !form.justificationFile)}>
              {submitting
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</>
                : <><CheckCircle2 className="h-4 w-4 mr-2" />Envoyer la demande</>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavesPage;
