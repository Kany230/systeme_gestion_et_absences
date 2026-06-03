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
  UserPlus,
  Edit2,
  Trash2,
  Loader2,
  TrendingUp,
  Mail,
  Phone,
  Briefcase,
  Hash,
  Building2, // <-- Icône sympa pour les départements
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { userService } from "@/api/userService";
import { counterService } from "@/api/compteurService";
import { User, Role } from "@/data/users";
import { Badge } from "@/components/ui/badge";

interface Departement {
  id: number;
  nom: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]); // <-- Stockage des départements
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ✅ CORRIGÉ : Ajout du departementId, retrait de matricule du state d'édition
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    role: Role.employe,
    departementId: "", // <-- Nouveau champ indispensable
    telephone: "",
    poste: "",
    soldeInitial: 0,
    dateEmbauche: new Date().toISOString().split('T')[0] // Optionnel : date du jour par défaut
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Chargement simultané des utilisateurs et des départements
      const [usersData, deptData] = await Promise.all([
        userService.list(),
        userService.getDepartements()
      ]);
      setUsers(usersData);
      setDepartements(deptData);
    } catch (error) {
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // En modification : on nettoie les champs inutiles
        const { password, soldeInitial, departementId, ...updatePayload } = formData;
        await userService.update(selectedUser.id!, {
          ...selectedUser,
          ...updatePayload,
        });
        toast.success("Collaborateur mis à jour");
      } else {
        // En création : validation du mot de passe ET du département
        if (!formData.password || formData.password.trim().length < 6) {
          toast.error("Le mot de passe est obligatoire (min. 6 caractères)");
          return;
        }
        if (!formData.departementId) {
          toast.error("Veuillez affecter un département pour générer le matricule");
          return;
        }

        const { soldeInitial, ...createPayload } = formData;
        
        // Conversion de l'ID string du select en Number pour l'API
        const finalPayload = {
          ...createPayload,
          departementId: Number(formData.departementId)
        };

        await userService.create(finalPayload as any, soldeInitial);
        toast.success("Collaborateur créé avec succès");
      }
      setIsUserModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setFormData({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      password: "", 
      role: user.role,
      departementId: user.departement?.id ? String(user.departement.id) : "", // Pré-remplit si présent
      telephone: user.telephone || "",
      poste: user.poste || "",
      soldeInitial: 0,
      dateEmbauche: user.dateEmbauche || new Date().toISOString().split('T')[0]
    });
    setIsUserModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormData({
      prenom: "",
      nom: "",
      email: "",
      password: "",
      role: Role.employe,
      departementId: departements[0]?.id ? String(departements[0].id) : "", // Sélectionne le premier par défaut
      telephone: "",
      poste: "",
      soldeInitial: 0,
      dateEmbauche: new Date().toISOString().split('T')[0]
    });
    setIsUserModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Supprimer définitivement ${user.prenom} ${user.nom} ?`)) {
      try {
        await userService.delete(user.id!);
        toast.success("Utilisateur supprimé");
        loadData();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleAdjustBalance = async (userId: number) => {
    const amount = prompt("Nombre de jours à définir (ex: 25) :");
    const reason = prompt("Motif de l'ajustement :");
    if (!amount || !reason) return;
    try {
      await counterService.updateBalanceByRH(userId, parseFloat(amount), reason);
      toast.success("Solde mis à jour");
      loadData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du solde");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.prenom} ${u.nom} ${u.email} ${u.matricule}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      DRH: "bg-red-100 text-red-700 border-red-200",
      manager: "bg-blue-100 text-blue-700 border-blue-200",
      chef_equipe: "bg-purple-100 text-purple-700 border-purple-200",
      employe: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <Badge className={`${colors[role] ?? "bg-gray-100 text-gray-700"} capitalize font-medium`}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 animate-pulse">
          Synchronisation du personnel et des structures...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personnel"
        description="Gérez les comptes et les accès de vos collaborateurs"
      >
        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Nouveau collaborateur
        </Button>
      </PageHeader>

      <Card className="p-2 border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, email ou matricule..."
              className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Collaborateur</TableHead>
              <TableHead>Poste & Structure</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-slate-400 py-12"
                >
                  Aucun collaborateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user: any) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {user.prenom[0]}
                        {user.nom[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                          <Hash className="h-3 w-3" />{" "}
                          {user.matricule || "Génération en cours..."}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-slate-400" />{" "}
                        {user.poste || "Non défini"}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {user.departement?.nom || "Aucun département"}
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs space-y-1 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {user.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />{" "}
                        {user.telephone || "---"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                        onClick={() => handleAdjustBalance(user.id!)}
                        title="Ajuster solde"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                        onClick={() => handleEditClick(user)}
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(user)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* MODALE CRÉATION / MODIFICATION */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedUser
                ? "Modifier le collaborateur"
                : "Ajouter un collaborateur"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Prénom
                </label>
                <Input
                  value={formData.prenom}
                  onChange={(e) =>
                    setFormData({ ...formData, prenom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Nom
                </label>
                <Input
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                Email professionnel
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* ✅ CORRIGÉ : Département (remplace Matricule en création) / Téléphone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Département {!selectedUser && <span className="text-red-500">*</span>}
                </label>
                {selectedUser ? (
                  <Input 
                    value={selectedUser.departement?.nom || "Aucun"} 
                    disabled 
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                ) : (
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.departementId}
                    onChange={(e) =>
                      setFormData({ ...formData, departementId: e.target.value })
                    }
                  >
                    <option value="">-- Choisir --</option>
                    {departements.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Téléphone
                </label>
                <Input
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Poste / Rôle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Poste
                </label>
                <Input
                  value={formData.poste}
                  onChange={(e) =>
                    setFormData({ ...formData, poste: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">
                  Rôle système
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as Role })
                  }
                >
                  <option value="employe">Employé</option>
                  <option value="chef_equipe">Chef d'Équipe</option>
                  <option value="manager">Manager</option>
                  <option value="DRH">Directeur RH</option>
                </select>
              </div>
            </div>

            {/* Date d'embauche (Nouveau champ utile au backend) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">
                Date d'embauche
              </label>
              <Input
                type="date"
                value={formData.dateEmbauche}
                onChange={(e) =>
                  setFormData({ ...formData, dateEmbauche: e.target.value })
                }
              />
            </div>

            {/* Champs visibles uniquement à la CRÉATION */}
            {!selectedUser && (
              <>
                {/* Mot de passe provisoire */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    Mot de passe provisoire{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Min. 6 caractères"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <p className="text-[11px] text-slate-400">
                    Un email sera envoyé au collaborateur avec ses accès.
                  </p>
                </div>

                {/* Solde initial */}
                <div className="space-y-1 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <label className="text-xs font-semibold text-amber-700">
                    Solde de congés initial (jours)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="bg-white"
                    value={formData.soldeInitial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        soldeInitial: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveUser}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {selectedUser
                ? "Enregistrer les modifications"
                : "Créer le compte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}