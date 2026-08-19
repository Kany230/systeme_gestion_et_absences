import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import {
  Plus, Pencil, Trash2, Building2, Loader2,
  UserCheck, AlertCircle, Search, Users,
} from "lucide-react";
import { toast } from "sonner";
import { departmentService } from "@/api/departementService";
import { Department } from "@/data/departments";
import { User } from "@/data/users";

// ── Confirmation Dialog ────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}
const ConfirmDialog = ({ open, title, description, onConfirm, onCancel, danger }: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onCancel}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${danger ? "bg-red-50" : "bg-amber-50"}`}>
          <AlertCircle className={`h-5 w-5 ${danger ? "text-red-500" : "text-amber-500"}`} />
        </div>
        <DialogTitle className="text-base font-bold text-slate-800">{title}</DialogTitle>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </DialogHeader>
      <DialogFooter className="gap-2 mt-2">
        <Button variant="outline" onClick={onCancel} className="border-slate-200">Annuler</Button>
        <Button
          onClick={onConfirm}
          className={danger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
        >
          Confirmer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ── Page ──────────────────────────────────────────────────────────────────
const DepartmentsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === "DRH" || user?.role === "admin";

  const [items, setItems]                         = useState<Department[]>([]);
  const [managersDisponibles, setManagersDisponibles] = useState<User[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [loadingManagers, setLoadingManagers]     = useState(false);
  const [saving, setSaving]                       = useState(false);
  const [search, setSearch]                       = useState("");

  // Modals
  const [open, setOpen]                           = useState(false);
  const [assignModalOpen, setAssignModalOpen]     = useState(false);
  const [confirmDeleteId, setConfirmDeleteId]     = useState<number | null>(null);

  // Formulaire
  const [editing, setEditing]                     = useState<Department | null>(null);
  const [selectedDept, setSelectedDept]           = useState<Department | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [nom, setNom]                             = useState("");
  const [code, setCode]                           = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      setItems(await departmentService.list());
    } catch {
      toast.error("Erreur lors de la récupération des départements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── CRUD ──────────────────────────────────────────────────────────────
  const openNew = () => {
    if (!canManage) return toast.error("Action non autorisée");
    setEditing(null); setNom(""); setCode(""); setOpen(true);
  };

  const openEdit = (d: Department) => {
    if (!canManage) return toast.error("Action non autorisée");
    setEditing(d); setNom(d.nom); setCode(d.code || ""); setOpen(true);
  };

  const saveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setSaving(true);
    try {
      if (editing?.id) {
        await departmentService.update(editing.id, { nom, code });
        toast.success("Département mis à jour");
      } else {
        await departmentService.create({ nom, code });
        toast.success("Département créé avec succès");
      }
      setOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const removeDepartment = async (id: number) => {
    try {
      await departmentService.delete(id);
      toast.success("Département supprimé");
      setConfirmDeleteId(null);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    }
  };

  // ── Assignation Manager ───────────────────────────────────────────────
  const handleOpenAssign = async (dept: Department) => {
    if (!canManage) return toast.error("Action non autorisée");
    setSelectedDept(dept);
    setSelectedManagerId(dept.manager?.id?.toString() || "");
    setAssignModalOpen(true);
    setLoadingManagers(true);
    try {
      if (dept.id) setManagersDisponibles(await departmentService.getManagersByDept(dept.id));
    } catch {
      toast.error("Impossible de charger les managers");
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedDept?.id || !selectedManagerId) return;
    setSaving(true);
    try {
      await departmentService.assignChef(selectedDept.id, parseInt(selectedManagerId));
      toast.success("Manager assigné avec succès");
      setAssignModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'assignation");
    } finally {
      setSaving(false);
    }
  };

  // ── Filtrage ──────────────────────────────────────────────────────────
  const filtered = items.filter((d) =>
    `${d.nom} ${d.code ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const sansManager = items.filter((d) => !d.manager).length;

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-slate-400 animate-pulse">Chargement des départements...</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Départements</h1>
          <p className="text-sm text-slate-400 mt-1">
            {items.length} structure{items.length > 1 ? "s" : ""} enregistrée{items.length > 1 ? "s" : ""}
            {sansManager > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-medium">
                · <AlertCircle className="h-3 w-3" /> {sansManager} sans responsable
              </span>
            )}
          </p>
        </div>
        {canManage && (
          <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> Nouveau département
          </Button>
        )}
      </div>

      {/* ── Recherche ── */}
      {items.length > 3 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Rechercher un département..."
            className="pl-10 bg-white border-slate-200 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── Grille ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Building2 className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Aucun département trouvé</p>
          {search && (
            <button onClick={() => setSearch("")}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card
              key={d.id}
              className="group p-5 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden relative"
            >
              {/* Bande de couleur en haut */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl" />

              <div className="flex items-start justify-between mt-1">
                {/* Icône */}
                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>

                {/* Actions DRH */}
                {canManage && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost"
                      onClick={() => handleOpenAssign(d)}
                      title="Assigner un manager"
                      className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600">
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      onClick={() => openEdit(d)}
                      title="Modifier"
                      className="h-8 w-8 hover:bg-slate-100">
                      <Pencil className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      onClick={() => d.id && setConfirmDeleteId(d.id)}
                      title="Supprimer"
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="mt-4">
                <h3 className="font-bold text-lg text-slate-800 leading-tight">{d.nom}</h3>
                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mt-0.5">
                  {d.code || "Sans code"}
                </p>
              </div>

              {/* Manager */}
              <div className="mt-5 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Responsable
                </p>
                {d.manager ? (
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] shrink-0">
                      {d.manager.prenom?.[0]}{d.manager.nom?.[0]}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {d.manager.prenom} {d.manager.nom}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
                      <AlertCircle className="h-3 w-3" /> Non assigné
                    </span>
                    {canManage && (
                      <button
                        onClick={() => handleOpenAssign(d)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Assigner
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ═══════════ MODALS (DRH/Admin uniquement) ═══════════ */}
      {canManage && (
        <>
          {/* Modal Créer / Modifier */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-800">
                      {editing ? "Modifier le département" : "Nouveau département"}
                    </DialogTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {editing ? "Mettez à jour les informations" : "Renseignez les informations du nouveau département"}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={saveDepartment} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nom" className="text-sm font-semibold text-slate-700">
                    Nom du département <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nom" required value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex : Ressources Humaines, Informatique..."
                    className="border-slate-200 h-10"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-sm font-semibold text-slate-700">
                    Code <span className="text-slate-400 font-normal">(optionnel)</span>
                  </Label>
                  <Input
                    id="code" value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex : RH, IT, FIN..."
                    className="border-slate-200 h-10"
                    disabled={saving}
                  />
                </div>

                <DialogFooter className="gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}
                    disabled={saving} className="border-slate-200">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving || !nom.trim()}
                    className="bg-blue-600 hover:bg-blue-700">
                    {saving
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
                      : editing ? "Mettre à jour" : "Créer le département"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Assigner Manager */}
          <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-800">
                      Assigner un responsable
                    </DialogTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Département : <span className="font-semibold text-slate-600">{selectedDept?.nom}</span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-3 space-y-4">
                {loadingManagers ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    <p className="text-xs text-slate-400 animate-pulse">Chargement des managers éligibles...</p>
                  </div>
                ) : managersDisponibles.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Managers disponibles dans ce département
                    </Label>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {managersDisponibles.map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedManagerId === String(m.id)
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="manager"
                            value={m.id}
                            checked={selectedManagerId === String(m.id)}
                            onChange={() => setSelectedManagerId(String(m.id))}
                            className="accent-emerald-600"
                          />
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] shrink-0">
                            {m.prenom?.[0]}{m.nom?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{m.prenom} {m.nom}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-medium">{m.role}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">Aucun manager trouvé</p>
                      <p className="text-xs">Seuls les employés avec le rôle <b>Manager</b> affectés au département <b>{selectedDept?.nom}</b> peuvent être sélectionnés.</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setAssignModalOpen(false)}
                  disabled={saving} className="border-slate-200">
                  Annuler
                </Button>
                <Button
                  onClick={handleAssignSubmit}
                  disabled={saving || loadingManagers || managersDisponibles.length === 0 || !selectedManagerId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {saving
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Assignation...</>
                    : <><UserCheck className="h-4 w-4 mr-2" />Confirmer l'assignation</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog confirmation suppression */}
          <ConfirmDialog
            open={confirmDeleteId !== null}
            title="Supprimer ce département ?"
            description="Cette action est irréversible. Les employés rattachés à ce département devront être réaffectés."
            danger
            onConfirm={() => confirmDeleteId && removeDepartment(confirmDeleteId)}
            onCancel={() => setConfirmDeleteId(null)}
          />
        </>
      )}
    </div>
  );
};

export default DepartmentsPage;