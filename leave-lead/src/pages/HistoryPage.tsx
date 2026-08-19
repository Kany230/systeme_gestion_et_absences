import { useEffect, useState } from "react";
import { historyService } from "@/api/historyService";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import {
  History, ArrowRight, User as UserIcon,
  Calendar, Info, Loader2, TrendingUp, TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isPrivileged = user?.role?.toLowerCase() === "drh" || user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = isPrivileged
          ? await historyService.getAll()
          : await historyService.getByUser(user.id);
        setHistory(data);
      } catch {
        toast.error("Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-sm text-slate-400 animate-pulse">Chargement de l'historique...</p>
    </div>
  );
  
console.log("Contenu de l'historique :", history[0].compteursConges.user);
  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historique des mouvements</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isPrivileged
            ? "Suivi complet de tous les mouvements de soldes de l'entreprise"
            : "Historique de vos mouvements de solde de congés"}
        </p>
      </div>

      {/* ── Liste ── */}
      {history.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <History className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Aucun mouvement enregistré</p>
          <p className="text-xs text-slate-400 mt-1">Les ajustements de solde apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item: any) => {
            const isCredit = item.nouveauSolde > item.ancienSolde;
            const diff     = Math.abs(item.nouveauSolde - item.ancienSolde);
            const isRH     = item.motif?.toLowerCase().includes("rh") || item.motif?.toLowerCase().includes("manuel");

            return (
              <Card key={item.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex">
                  {/* Barre latérale colorée */}
                  <div className={`w-1 shrink-0 ${isCredit ? "bg-emerald-500" : "bg-red-400"}`} />

                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Icône + Nom (DRH/Admin uniquement) */}
                    {/* Icône + Nom */}
<div className="flex items-center gap-3 flex-1 min-w-0">
  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-sm">
    {/* Initiales de l'utilisateur */}
    {item.compteursConges?.users?.prenom?.[0]}
    {item.compteursConges?.user?.nom?.[0]}
  </div>
  
  <div className="min-w-0">
    <p className="font-semibold text-slate-800 text-sm truncate">
      {/* Affichage du Prénom et Nom */}
      {item.compteursConges?.user?.prenom} {item.compteursConges?.user?.nom}
    </p>
    <p className="text-xs text-slate-400">
      {/* Date de la modification */}
      {new Date(item.dateModification).toLocaleDateString("fr-FR")}
    </p>
  </div>
</div>

                    {/* Mouvement de solde */}
                    
<div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl shrink-0">
  <div className="flex flex-col items-center">
    <span className="text-[10px] uppercase font-bold text-slate-400">Avant</span>
    <span className="text-sm font-semibold text-slate-600">{item.ancienSolde} j</span>
  </div>
  
  <ArrowRight className="h-4 w-4 text-slate-300" />
  
  <div className="flex flex-col items-center">
    <span className="text-[10px] uppercase font-bold text-slate-400">Après</span>
    <span className={`text-sm font-black ${isCredit ? "text-emerald-600" : "text-red-500"}`}>
      {item.newSolde} j
    </span>
  </div>

 
</div>

                    {/* Motif */}
                    <div className="flex items-start gap-2 sm:max-w-xs">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isRH ? "bg-amber-50" : "bg-slate-50"
                      }`}>
                        <Info className={`h-3.5 w-3.5 ${isRH ? "text-amber-500" : "text-slate-400"}`} />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.motif}</p>
                    </div>

                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer compteur */}
      {history.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {history.length} mouvement{history.length > 1 ? "s" : ""} au total
        </p>
      )}
    </div>
    
  );
  
}