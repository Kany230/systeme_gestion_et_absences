import { useEffect, useState } from "react";
import { holidayService } from "@/api/holidaysServices";
import { HolidayCalendar } from "@/components/HolidayCalendar";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus, Loader2, RefreshCcw, AlertCircle,
  CalendarDays, ShieldAlert, Trash2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Holiday { id: number; nom: string; date: string; }

export default function HolidaysPage() {
  const { user } = useAuth();
  const canManage = user?.role === "DRH" || user?.role === "admin";

  const [holidays, setHolidays]         = useState<Holiday[]>([]);
  const [loading, setLoading]           = useState(true);
  const [initLoading, setInitLoading]   = useState(false);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<number | null>(null);
  const [holidayName, setHolidayName]   = useState("");
  const [holidayDate, setHolidayDate]   = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      setHolidays(await holidayService.getAll());
    } catch {
      toast.error("Erreur lors du chargement des jours fériés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHolidays(); }, []);

  const openAdd = (dateStr = "") => {
    if (!canManage) return;
    setSelectedHolidayId(null);
    setHolidayName("");
    setHolidayDate(dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (holidayId: number) => {
    if (!canManage) return;
    const h = holidays.find((h) => h.id === holidayId);
    if (h) { setSelectedHolidayId(holidayId); setHolidayName(h.nom); setHolidayDate(h.date); setIsModalOpen(true); }
  };

  const handleInitialize = async () => {
    if (!canManage) return;
    const year = new Date().getFullYear();
    setInitLoading(true);
    try {
      await holidayService.initializeYear(year);
      toast.success(`Jours fériés ${year} initialisés`);
      await loadHolidays();
    } catch { toast.error("Erreur lors de l'initialisation"); }
    finally { setInitLoading(false); }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setSubmitLoading(true);
    try {
      if (selectedHolidayId) {
        await holidayService.update(selectedHolidayId, { nom: holidayName, date: holidayDate });
        toast.success("Jour férié mis à jour");
      } else {
        await holidayService.addHoliday({ nom: holidayName, date: holidayDate });
        toast.success("Jour férié ajouté");
      }
      setIsModalOpen(false);
      await loadHolidays();
    } catch { toast.error("Opération impossible"); }
    finally { setSubmitLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!canManage || !selectedHolidayId) return;
    setSubmitLoading(true);
    try {
      await holidayService.delete(selectedHolidayId);
      toast.success("Jour férié supprimé");
      setConfirmDeleteOpen(false);
      setIsModalOpen(false);
      await loadHolidays();
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setSubmitLoading(false); }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-sm text-slate-400 animate-pulse">Chargement du calendrier...</p>
    </div>
  );

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jours Fériés</h1>
          <p className="text-sm text-slate-400 mt-1">
            {holidays.length} jour{holidays.length > 1 ? "s" : ""} férié{holidays.length > 1 ? "s" : ""} configuré{holidays.length > 1 ? "s" : ""} · {currentYear}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleInitialize} disabled={initLoading}
              className="border-slate-200 text-slate-600 hover:bg-slate-50">
              {initLoading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Initialisation...</>
                : <><RefreshCcw className="h-4 w-4 mr-2" />Initialiser {currentYear}</>}
            </Button>
            <Button onClick={() => openAdd()} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Ajouter un jour
            </Button>
          </div>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid gap-6 lg:grid-cols-4">

        {/* Calendrier (3/4) */}
        <div className="lg:col-span-3">
          <HolidayCalendar
            holidays={holidays}
            onDateClick={canManage ? openAdd : undefined}
            onEventClick={canManage ? handleEventClick : undefined}
          />
        </div>

        {/* Panneau latéral (1/4) */}
        <div className="space-y-4">

          {/* Légende */}
          <Card className="p-4 border-slate-100 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-indigo-500" /> Légende
            </h4>
            <hr className="border-slate-100" />
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-sm bg-indigo-100 border border-indigo-200 shrink-0" />
              <span className="font-medium text-indigo-700">Jour férié</span>
            </div>
          </Card>

          {/* Liste des prochains jours fériés */}
          <Card className="p-4 border-slate-100 shadow-sm">
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Prochains jours fériés
            </h4>
            {holidays
              .filter((h) => new Date(h.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-indigo-600">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{h.nom}</p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {new Date(h.date).toLocaleDateString("fr-FR", { weekday: "long", month: "long" })}
                    </p>
                  </div>
                </div>
              ))}
            {holidays.filter((h) => new Date(h.date) >= new Date()).length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Aucun jour férié à venir
              </p>
            )}
          </Card>

          {/* Info rôle */}
          {canManage ? (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Mode édition actif</p>
                <p>Cliquez sur une date du calendrier pour ajouter ou modifier un jour férié.</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3 items-start">
              <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500">
                <p className="font-semibold text-slate-600">Mode lecture seule</p>
                <p className="mt-0.5">Seul le service DRH peut modifier les jours fériés.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ Modals (DRH/Admin uniquement) ══ */}
      {canManage && (
        <>
          {/* Modal Ajouter / Modifier */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-800">
                      {selectedHolidayId ? "Modifier le jour férié" : "Ajouter un jour férié"}
                    </DialogTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedHolidayId ? "Mettez à jour les informations" : "Renseignez le nom et la date"}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="h-nom" className="text-sm font-semibold text-slate-700">
                    Nom de l'événement <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="h-nom"
                    placeholder="Ex : Fête de l'Indépendance, Tabaski..."
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    required disabled={submitLoading}
                    className="border-slate-200 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="h-date" className="text-sm font-semibold text-slate-700">
                    Date exacte <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="h-date" type="date"
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    required disabled={submitLoading}
                    className="border-slate-200 h-10"
                  />
                </div>

                <DialogFooter className="gap-2 pt-2">
                  {selectedHolidayId && (
                    <Button type="button" variant="outline"
                      onClick={() => setConfirmDeleteOpen(true)}
                      disabled={submitLoading}
                      className="border-red-200 text-red-600 hover:bg-red-50 mr-auto">
                      <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}
                    disabled={submitLoading} className="border-slate-200">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitLoading || !holidayName.trim() || !holidayDate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {submitLoading
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
                      : <><CheckCircle2 className="h-4 w-4 mr-2" />Enregistrer</>}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog confirmation suppression */}
          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <div className="h-11 w-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <DialogTitle className="text-base font-bold text-slate-800">
                  Supprimer ce jour férié ?
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-semibold text-slate-700">{holidayName}</span> sera définitivement supprimé du calendrier.
                </p>
              </DialogHeader>
              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}
                  disabled={submitLoading} className="border-slate-200">
                  Annuler
                </Button>
                <Button onClick={handleDeleteConfirm} disabled={submitLoading}
                  className="bg-red-600 hover:bg-red-700 text-white">
                  {submitLoading
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Suppression...</>
                    : "Confirmer la suppression"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
