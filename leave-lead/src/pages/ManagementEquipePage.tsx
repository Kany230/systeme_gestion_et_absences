import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, Loader2, Mail, Briefcase, UserCog, Hash, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { userService } from "@/api/userService";
import { User } from "@/data/users";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagementEquipePage() {
  const [manager, setManager] = useState<User | null>(null);
  const [employes, setEmployes] = useState<User[]>([]);
  const [chefs, setChefs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<User | null>(null);
  const [selectedChefId, setSelectedChefId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("user");
      if (!raw) throw new Error("Session expirée");
      const currentUser: User = JSON.parse(raw);
      setManager(currentUser);
      const membres = await userService.getByManager(currentUser.id!);
      setEmployes(membres.filter((u) => u.role === "employe"));
      setChefs(membres.filter((u) => u.role === "chef_equipe"));
    } catch (error: any) {
      toast.error(error.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssigner = async () => {
    if (!selectedChefId || !selectedEmploye || !manager) return;
    setSaving(true);
    try {
      await userService.assignManager(selectedEmploye.id!, Number(selectedChefId), manager.id!);
      toast.success("Assignation mise à jour avec succès");
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error("Erreur lors de l'assignation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <PageHeader title="Gestion des équipes" description="Organisez vos collaborateurs et assignez-les aux chefs d'équipe." />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Employés", val: employes.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Chefs d'équipe", val: chefs.length, icon: UserCog, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Assignés", val: employes.filter((e: any) => e.chefInfo).length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4 rounded-2xl border-slate-100 shadow-sm">
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stat.val}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input 
              className="pl-10 bg-slate-50 border-none rounded-xl" 
              placeholder="Rechercher par nom..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Employé</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Chef Assigné</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employes.filter(e => `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase())).map((e: any) => (
              <TableRow key={e.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{e.prenom} {e.nom}</p>
                      <p className="text-xs text-slate-400">{e.matricule}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm flex flex-col gap-1">
                    <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/>{e.email}</p>
                    <p className="flex items-center gap-2"><Briefcase size={14} className="text-slate-400"/>{e.poste}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {e.chefInfo ? (
                    <Badge variant="secondary" className="rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100">
                      {e.chefInfo.prenom} {e.chefInfo.nom}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200">Non assigné</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => { setSelectedEmploye(e); setIsModalOpen(true); }}>
                    {e.chefInfo ? "Réassigner" : "Assigner"} <UserPlus className="ml-2" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      
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