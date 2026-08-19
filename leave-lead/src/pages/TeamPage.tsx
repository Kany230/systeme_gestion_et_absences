import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { User } from "@/data/users";
import {
  Users,
  Mail,
  Building2,
  ShieldCheck,
  Loader2,
  Phone,
  Hash,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

const roleLabel: Record<string, string> = {
  employe: "Employé",
  chef_equipe: "Chef d'équipe",
  manager: "Manager",
  drh: "Directeur RH",
  admin: "Administrateur"
};

const roleBadgeClass: Record<string, string> = {
  drh: "bg-purple-100 text-purple-700",
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  chef_equipe: "bg-orange-100 text-orange-700",
  employe: "bg-slate-100 text-slate-600",
};



const TeamPage = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let data: User[] = [];
        
        // Stratégie de récupération selon le rôle
        if (["drh", "admin"].includes(user.role?.toLowerCase() || "")) {
          data = await userService.list();
          data = data.filter((u) => u.id !== user.id);
        } else if (user.role?.toLowerCase() === "manager") {
          data = await userService.getByManager(user.id!);
        } else {
          data = await userService.getMonEquipe(user.id!);
        }
        
        setMembers(data);
      } catch (error) {
        console.error("Erreur annuaire:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user]);

  // Filtrage local pour la recherche
  const filteredMembers = members.filter((m) => 
    `${m.prenom} ${m.nom} ${m.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Annuaire de l'équipe"
        description="Consultez les membres de votre organisation et leurs informations de contact."
      />

      {/* Statistiques rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total membres" value={members.length} icon={Users} color="blue" />
        <StatCard title="Mon département" value={user.departement?.nom || "Non défini"} icon={Building2} color="purple" />
        <StatCard title="Responsables" value={members.filter(m => m.role !== "employe").length} icon={ShieldCheck} color="emerald" />
      </div>

      {/* Tableau avec recherche */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par nom ou email..." 
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Matricule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((m) => (
                <TableRow key={m.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                          {m.prenom?.[0]}{m.nom?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{m.prenom} {m.nom}</p>
                        <p className="text-[11px] text-slate-400">{m.poste || "Poste non défini"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col gap-0.5 text-slate-600">
                      <span className="flex items-center gap-1.5"><Mail size={12}/>{m.email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={12}/>{m.telephone || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${roleBadgeClass[m.role as string] || "bg-slate-100"}`}>
                      {roleLabel[m.role as string] || m.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{m.matricule}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

// Composant utilitaire pour les cartes de stats
function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: any = { blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600", emerald: "bg-emerald-50 text-emerald-600" };
  return (
    <Card className="p-5 flex items-center gap-4 border-slate-100">
      <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={20} /></div>
      <div>
        <p className="text-[10px] text-slate-500 font-bold uppercase">{title}</p>
        <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
      </div>
    </Card>
  );
}

export default TeamPage;