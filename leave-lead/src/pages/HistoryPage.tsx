import { useEffect, useState } from "react";
import { historyService } from "@/api/historyService";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { History, ArrowRight, User as UserIcon, Calendar, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns"; // Optionnel pour formater les dates
import { fr } from "date-fns/locale";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await historyService.getAll();
        setHistory(data);
      } catch (e) {
        toast.error("Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Historique des Mouvements" 
        description="Suivi complet des modifications de soldes et des crédits mensuels."
      />

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map((item: any) => (
            <Card key={item.id} className="p-0 overflow-hidden border-none shadow-sm">
              <div className="flex">
                {/* Barre latérale colorée selon le type de modif */}
                <div className={`w-1.5 ${item.motif.includes('RH') ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                
                <div className="p-4 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.user?.prenom} {item.user?.nom}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.dateModification).toLocaleDateString('fr-FR', { 
                           day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Visualisation du changement de solde */}
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-slate-500">{item.ancienSolde}j</span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <span className={`font-bold ${item.nouveauSolde > item.ancienSolde ? 'text-green-600' : 'text-rose-600'}`}>
                      {item.nouveauSolde}j
                    </span>
                  </div>

                  {/* Motif */}
                  <div className="flex items-start gap-2 md:w-1/3">
                    <Info className="h-4 w-4 text-indigo-400 mt-1 shrink-0" />
                    <p className="text-sm text-slate-600 italic">
                      {item.motif}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">Aucun historique disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}