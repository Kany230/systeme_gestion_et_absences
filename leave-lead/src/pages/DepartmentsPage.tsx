import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Building2, 
  Loader2, 
  UserCheck, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

// Services et Types
import { departmentService } from "@/api/departementService";
import { Department } from "@/data/departments";
import { User } from "@/data/users";

// /!\ À ADAPTER : Importez votre système d'authentification (Context, hook maison, Redux, etc.)
import { useAuth } from "@/context/AuthContext"; 

const DepartmentsPage = () => {
  // 0. Gestion du rôle de l'utilisateur
  const { user } = useAuth(); 
  // Vérifie si le rôle est strictement "DRH" (adaptez selon la structure de votre objet user)
  const isDRH = user?.role === "DRH"; 

  // États pour les données
  const [items, setItems] = useState<Department[]>([]);
  const [managersDisponibles, setManagersDisponibles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // États pour les modales
  const [open, setOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  
  // États pour les formulaires
  const [editing, setEditing] = useState<Department | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");

  // 1. Chargement initial des départements uniquement
  const loadData = async () => {
    setLoading(true);
    try {
      const deptsData = await departmentService.list();
      setItems(deptsData);
    } catch (error: any) {
      toast.error("Erreur lors de la récupération des départements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Gestion CRUD Département (Sécurisée côté client)
  const openNew = () => {
    if (!isDRH) return toast.error("Action non autorisée");
    setEditing(null);
    setNom("");
    setCode("");
    setOpen(true);
  };

  const openEdit = (d: Department) => {
    if (!isDRH) return toast.error("Action non autorisée");
    setEditing(d);
    setNom(d.nom);
    setCode(d.code || "");
    setOpen(true);
  };

  const saveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDRH) return toast.error("Action non autorisée");
    try {
      if (editing?.id) {
        await departmentService.update(editing.id, { nom, code });
        toast.success("Département mis à jour");
      } else {
        await departmentService.create({ nom, code });
        toast.success("Département créé");
      }
      setOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeDepartment = async (id: number) => {
    if (!isDRH) return toast.error("Action non autorisée");
    if (!confirm("Supprimer ce département ?")) return;
    try {
      await departmentService.delete(id);
      toast.success("Supprimé avec succès");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 3. Logique d'assignation du Manager
  const handleOpenAssign = async (dept: Department) => {
    if (!isDRH) return toast.error("Action non autorisée");
    setSelectedDept(dept);
    setSelectedManagerId(dept.manager?.id?.toString() || "");
    setAssignModalOpen(true);
    
    setLoadingManagers(true);
    try {
      if (dept.id) {
        const data = await departmentService.getManagersByDept(dept.id);
        setManagersDisponibles(data);
      }
    } catch (error: any) {
      toast.error("Impossible de charger les managers du département");
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!isDRH) return toast.error("Action non autorisée");
    if (!selectedDept?.id || !selectedManagerId) return;
    try {
      await departmentService.assignChef(selectedDept.id, parseInt(selectedManagerId));
      toast.success("Manager assigné avec succès");
      setAssignModalOpen(false);
      loadData(); 
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Départements"
        description={`${items.length} structures enregistrées`}
        actions={
          /* CONDITION : Le bouton "Nouveau" ne s'affiche 
            QUE si l'utilisateur possède le rôle DRH 
          */
          isDRH && (
            <Button onClick={openNew} className="bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />Nouveau
            </Button>
          )
        }
      />

      {/* GRILLE DES DEPARTEMENTS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <Card key={d.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>

              {/* CONDITION : Les boutons d'action de chaque carte 
                ne s'affichent également QUE pour la DRH 
              */}
              {isDRH && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleOpenAssign(d)} title="Assigner manager">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(d)}>
                    <Pencil className="h-4 w-4 text-slate-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => d.id && removeDepartment(d.id)}>
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-bold text-lg text-slate-800">{d.nom}</h3>
              <p className="text-xs font-medium text-blue-500 uppercase">{d.code || "SANS CODE"}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-500 mb-1 font-medium">Responsable actuel :</p>
              <div className="flex items-center gap-2">
                {d.manager ? (
                  <span className="text-sm font-semibold text-slate-700">
                    {d.manager.prenom} {d.manager.nom}
                  </span>
                ) : (
                  <span className="text-sm italic text-slate-400">Aucun manager assigné</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CONDITION : Les modales ne sont même pas injectées 
        dans le DOM si l'utilisateur n'est pas DRH 
      */}
      {isDRH && (
        <>
          {/* MODALE : CRÉATION / ÉDITION DÉPARTEMENT */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier" : "Nouveau"} département</DialogTitle>
              </DialogHeader>
              <form onSubmit={saveDepartment} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du département</Label>
                  <Input id="nom" required value={nom} onChange={e => setNom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-blue-600">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* MODALE : ASSIGNATION MANAGER */}
          <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assigner responsable : {selectedDept?.nom}</DialogTitle>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                {loadingManagers ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <p className="text-xs text-slate-500">Recherche des managers éligibles...</p>
                  </div>
                ) : managersDisponibles.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Collaborateurs éligibles (déjà dans le service)</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                    >
                      <option value="">-- Sélectionner un manager --</option>
                      {managersDisponibles.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.prenom} {m.nom} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                    <p>
                      <strong>Aucun candidat trouvé.</strong><br />
                      Seuls les employés ayant un rôle de <b>Manager</b> et affectés au département <b>{selectedDept?.nom}</b> peuvent être sélectionnés.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Annuler</Button>
                <Button 
                  disabled={loadingManagers || managersDisponibles.length === 0 || !selectedManagerId} 
                  onClick={handleAssignSubmit} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirmer l'assignation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default DepartmentsPage;