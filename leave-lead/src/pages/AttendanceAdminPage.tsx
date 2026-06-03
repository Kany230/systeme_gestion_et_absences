import { useEffect, useState } from "react";
import { attendanceService } from "@/api/pointageService";
import { Attendance, StatutPointage } from "@/data/pointage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { Clock, UserCheck, UserX, RefreshCw, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function AttendanceAdminPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAll();
      setAttendances(data);
    } catch (e) {
      toast.error("Erreur de chargement des pointages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleTriggerDetection = async () => {
    try {
      const msg = await attendanceService.triggerAbsenceDetection();
      toast.success(msg);
      loadData();
    } catch (e) { toast.error("Échec de la détection"); }
  };

  const filtered = attendances.filter(a => 
    `${a.user.prenom} ${a.user.nom}`.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Pointages & Présences" description="Suivi en temps réel des arrivées et des absences.">
        <Button onClick={handleTriggerDetection} variant="outline" className="border-indigo-200 text-indigo-700">
          <RefreshCw className="mr-2 h-4 w-4" /> Scanner les Absences
        </Button>
      </PageHeader>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un employé..." 
            className="pl-10" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((a) => (
          <Card key={a.id} className="p-4 flex items-center justify-between border-none shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                a.statut === StatutPointage.present ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {a.statut === StatutPointage.present ? <UserCheck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-800">{a.user.prenom} {a.user.nom}</p>
                <p className="text-xs text-slate-500">
                  Arrivée : <span className="font-medium text-slate-700">{a.heureArrive || "--:--"}</span> • 
                  Départ : <span className="font-medium text-slate-700">{a.heureDepart || "En poste"}</span>
                </p>
              </div>
            </div>
            
            <div className="text-right">
               <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                 a.statut === StatutPointage.retard ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'
               }`}>
                 {a.statut}
               </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}