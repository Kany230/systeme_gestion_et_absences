import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  UserCheck,
  Loader2,
  Mail,
  Briefcase,
  ChevronRight,
  UserCog,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { userService } from "@/api/userService";
import { User } from "@/data/users";
import { Badge } from "@/components/ui/badge";

export default function ManagementEquipePage() {
  // ─── State ───────────────────────────────────────────
  const [manager, setManager] = useState<User | null>(null);
  const [employes, setEmployes] = useState<User[]>([]);
  const [chefs, setChefs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modale d'assignation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<User | null>(null);
  const [selectedChefId, setSelectedChefId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // ─── Chargement ──────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      // Récupère le manager connecté depuis le localStorage
      const raw = localStorage.getItem("user");
      if (!raw) throw new Error("Session expirée");
      const currentUser: User = JSON.parse(raw);
      setManager(currentUser);

      // Charge tous les membres du département + filtre les chefs d'équipe
      const membres = await userService.getByManager(currentUser.id!);
      setEmployes(membres.filter((u) => u.role === "employe"));
      setChefs(membres.filter((u) => u.role === "chef_equipe"));
    } catch (error: any) {
      toast.error(error.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Assignation ─────────────────────────────────────
  const handleOpenAssign = (employe: User) => {
    setSelectedEmploye(employe);
    // Pré-sélectionne le chef actuel si déjà assigné
    setSelectedChefId(
      employe.manager?.id ? String(employe.manager.id) : ""
    );
    setIsModalOpen(true);
  };

  const handleAssigner = async () => {
    if (!selectedChefId) {
      toast.error("Veuillez sélectionner un chef d'équipe");
      return;
    }
    if (!selectedEmploye || !manager) return;

    setSaving(true);
    try {
      await userService.assignManager(
        selectedEmploye.id!,
        Number(selectedChefId),
        manager.id!
      );
      toast.success(
        `${selectedEmploye.prenom} assigné(e) au chef d'équipe`
      );
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'assignation");
    } finally {
      setSaving(false);
    }
  };

  // ─── Filtres ─────────────────────────────────────────
  const filteredEmployes = employes.filter((u) =>
    `${u.prenom} ${u.nom} ${u.email} ${u.matricule}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ─── Helpers UI ──────────────────────────────────────
  const getChefNom = (employe: User) => {
    if (!employe.manager) return null;
    const chef = chefs.find((c) => c.id === employe.manager?.id);
    return chef ? `${chef.prenom} ${chef.nom}` : null;
  };

  // ─── Loading ─────────────────────────────────────────
  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 animate-pulse">
          Chargement des équipes...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des équipes"
        description={`Assignez vos employés aux chefs d'équipe de votre département`}
      />

      {/* ── Statistiques rapides ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{employes.length}</p>
            <p className="text-xs text-slate-500">Employés</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{chefs.length}</p>
            <p className="text-xs text-slate-500">Chefs d'équipe</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {employes.filter((e) => e.manager).length}
            </p>
            <p className="text-xs text-slate-500">Assignés</p>
          </div>
        </Card>
      </div>

      {/* ── Tableau des employés ── */}
      <Card className="p-2 border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un employé..."
              className="pl-10 bg-slate-50/50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-400 ml-auto">
            {filteredEmployes.length} employé(s)
          </p>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Employé</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Chef d'équipe actuel</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400 py-12">
                  Aucun employé trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployes.map((employe: any) => {
                const chefNom = getChefNom(employe);
                return (
                  <TableRow
                    key={employe.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Employé */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {employe.prenom?.[0]}{employe.nom?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {employe.prenom} {employe.nom}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                            <Hash className="h-3 w-3" />
                            {employe.matricule || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Poste */}
                    <TableCell>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-slate-400" />
                        {employe.poste || "Non défini"}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" />
                        {employe.email}
                      </div>
                    </TableCell>

                    {/* Chef actuel */}
                    <TableCell>
                      {chefNom ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium">
                          {chefNom}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Non assigné
                        </span>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1"
                        onClick={() => handleOpenAssign(employe)}
                        disabled={chefs.length === 0}
                        title={
                          chefs.length === 0
                            ? "Aucun chef d'équipe disponible dans ce département"
                            : "Assigner un chef d'équipe"
                        }
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {chefNom ? "Réassigner" : "Assigner"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Message si pas de chefs disponibles */}
        {chefs.length === 0 && (
          <div className="p-4 text-center text-sm text-amber-600 bg-amber-50 border-t border-amber-100">
            ⚠️ Aucun chef d'équipe n'est disponible dans votre département. Contactez le DRH.
          </div>
        )}
      </Card>

      {/* ── Modale d'assignation ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Assigner un chef d'équipe
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Employé sélectionné */}
            {selectedEmploye && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {selectedEmploye.prenom?.[0]}{selectedEmploye.nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedEmploye.prenom} {selectedEmploye.nom}
                  </p>
                  <p className="text-xs text-slate-500">{selectedEmploye.poste}</p>
                </div>
              </div>
            )}

            {/* Sélection du chef */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">
                Chef d'équipe <span className="text-red-500">*</span>
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedChefId}
                onChange={(e) => setSelectedChefId(e.target.value)}
              >
                <option value="">-- Sélectionner un chef d'équipe --</option>
                {chefs.map((chef) => (
                  <option key={chef.id} value={chef.id}>
                    {chef.prenom} {chef.nom} — {chef.poste || "Chef d'équipe"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAssigner}
              disabled={saving || !selectedChefId}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assignation...
                </>
              ) : (
                "Confirmer l'assignation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}