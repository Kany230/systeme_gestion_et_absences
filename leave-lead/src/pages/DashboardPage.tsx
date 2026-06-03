import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CalendarDays, UserX, Clock, Bell, Loader2, Zap, Settings } from "lucide-react";
import { toast } from "sonner";

import { leaveService } from "@/api/congeService";
import { attendanceService } from "@/api/pointageService";
import { counterService } from "@/api/compteurService";

const roleLabel: Record<string, string> = { 
  employe: "Employé", manager: "Manager", chef_equipe: "Chef d'équipe", DRH: "Directeur RH"
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [solde, setSolde] = useState(0);
  const [soldePermission, setSoldePermission] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [recentLeaves, counter] = await Promise.all([
          leaveService.getMyLeaves(user.id),
          counterService.getSoldeById(user.id)
        ]);
        setLeaves(recentLeaves);
        setSolde(counter.soldeAn);
        setSoldePermission(counter.soldePermission);
      } catch (error) {
        toast.error("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Fonctions DRH
  const handleTriggerAbsence = async () => {
    try {
      await attendanceService.triggerAbsenceDetection();
      toast.success("Détection des absences lancée avec succès");
    } catch (e) { toast.error("Échec du lancement"); }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Hello, ${user.prenom} 👋`} 
        description={`${roleLabel[user.role]} · UIDT Gestion`} 
      />

      {/* Statistiques */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-blue-600 text-white">
          <p className="text-sm opacity-80">Solde Annuel</p>
          <p className="text-3xl font-bold">{solde} j</p>
        </Card>
        <Card className="p-5 bg-teal-500 text-white">
          <p className="text-sm opacity-80">Solde Permission</p>
          <p className="text-3xl font-bold">{soldePermission} j</p>
        </Card>
        {/* ... autres stats ... */}
      </div>

      {/* SECTION ACTIONS DRH */}
      {user.role === "DRH" && (
        <section className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4" /> Administration Système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={handleTriggerAbsence} className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 text-slate-700 font-medium">
              <UserX className="h-5 w-5 text-rose-500" /> Détecter Absences
            </button>
            <button onClick={() => counterService.triggerMonthlyCredit()} className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 text-slate-700 font-medium">
              <Zap className="h-5 w-5 text-amber-500" /> Crédit Mensuel
            </button>
          </div>
        </section>
      )}

      {/* Tableau des activités récentes */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4">Activités récentes</h2>
        {/* ... boucle sur leaves ... */}
      </Card>
    </div>
  );
};
export default DashboardPage;