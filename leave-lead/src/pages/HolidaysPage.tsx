import { useEffect, useState } from "react";
import { holidayService } from "@/api/holidaysServices";
import { HolidayCalendar } from "@/components/HolidayCalendar";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Loader2, 
  RefreshCcw,
  AlertCircle,
  X,
  CalendarDays,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

interface Holiday {
  id: number;
  nom: string;
  date: string;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [isDrh, setIsDrh] = useState(false); // État pour vérifier si l'utilisateur est DRH
  
  // États pour le formulaire (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<number | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fonction pour décoder le rôle depuis le token JWT
  const checkUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // S'adapter selon la structure de votre JWT (ex: payload.role, payload.roles, ou payload.authority)
        const roles = payload.roles || payload.role || [];
        if (roles.includes("ROLE_DRH") || roles.includes("DRH")) {
          setIsDrh(true);
        }
      }
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
    }
  };

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const data = await holidayService.getAll();
      setHolidays(data);
    } catch (e) {
      toast.error("Erreur lors du chargement des jours fériés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadHolidays();
  }, []);

  // Ouvrir le modal pour un AJOUT (Uniquement si DRH)
  const handleDateClick = (dateStr: string) => {
    if (!isDrh) return; // Sécurité : bloque l'action si pas DRH
    setSelectedHolidayId(null);
    setHolidayName("");
    setHolidayDate(dateStr); 
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour une MODIFICATION (Uniquement si DRH)
  const handleEventClick = (holidayId: number) => {
    if (!isDrh) return; // Sécurité : bloque l'action si pas DRH
    const holiday = holidays.find(h => h.id === holidayId);
    if (holiday) {
      setSelectedHolidayId(holidayId);
      setHolidayName(holiday.nom);
      setHolidayDate(holiday.date);
      setIsModalOpen(true);
    }
  };

  const handleInitialize = async () => {
    if (!isDrh) return;
    const year = new Date().getFullYear();
    setInitLoading(true);
    try {
      await holidayService.initializeYear(year);
      toast.success(`Année ${year} initialisée avec succès.`);
      await loadHolidays();
    } catch (e) {
      toast.error("Erreur lors de l'initialisation");
    } finally {
      setInitLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDrh) return;

    setSubmitLoading(true);
    try {
      if (selectedHolidayId) {
        await holidayService.update(selectedHolidayId, { nom: holidayName, date: holidayDate });
        toast.success("Jour férié mis à jour");
      } else {
        await holidayService.addHoliday({ nom: holidayName, date: holidayDate });
        toast.success("Jour férié ajouté");
      }
      setIsModalOpen(false);
      await loadHolidays();
    } catch (e) {
      toast.error("Opération impossible");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteHoliday = async () => {
    if (!isDrh || !selectedHolidayId) return;
    if (!confirm("Voulez-vous vraiment supprimer ce jour férié ?")) return;

    setSubmitLoading(true);
    try {
      await holidayService.delete(selectedHolidayId);
      toast.success("Jour férié supprimé");
      setIsModalOpen(false);
      await loadHolidays();
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Configuration des Jours Fériés" 
          description="Consultez le calendrier officiel des jours fériés de l'entreprise."
        />
        
        {/* Affichage conditionnel des boutons d'administration uniquement pour le DRH */}
        {isDrh && (
          <div className="flex gap-2 animate-in fade-in duration-200">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleInitialize}
              disabled={initLoading}
              className="flex items-center gap-2"
            >
              {initLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Initialiser {new Date().getFullYear()}
            </Button>
            <Button size="sm" onClick={() => handleDateClick("")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4" />
              Ajouter un jour
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {/* Le calendrier reste cliquable uniquement si l'utilisateur est DRH */}
          <HolidayCalendar 
            holidays={holidays}
            onDateClick={isDrh ? handleDateClick : undefined}
            onEventClick={isDrh ? handleEventClick : undefined}
          />
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-white border-none shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-500" /> Légende
            </h4>
            <hr />
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded bg-indigo-50 border border-indigo-200" />
              <span className="font-medium text-indigo-700">🎉 Jour Férié Activé</span>
            </div>
          </Card>

          {/* Message contextuel selon le rôle */}
          {isDrh ? (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Espace DRH :</p>
                <p>• Cliquez sur le calendrier pour insérer ou mettre à jour un jour férié.</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500">
                <p className="font-semibold">Mode Lecture Seule</p>
                <p>Seul le service DRH est habilité à modifier les dates du calendrier.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal masqué d'office pour les non-DRH */}
      {isDrh && isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {selectedHolidayId ? "Modifier le jour férié" : "Ajouter un jour férié"}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom de l'événement</Label>
                <Input 
                  id="nom"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date exacte</Label>
                <Input 
                  id="date"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                {selectedHolidayId ? (
                  <Button type="button" variant="destructive" onClick={handleDeleteHoliday} disabled={submitLoading}>
                    Supprimer
                  </Button>
                ) : <div />}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitLoading}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitLoading} className="bg-indigo-600 text-white">
                    Enregistrer
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}