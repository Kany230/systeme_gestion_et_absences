import { useEffect, useState } from "react";
import { leaveTypeService } from "@/api/typeService";
import { TypeConge } from "@/data/type";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Clock, 
  ShieldCheck, 
  Settings2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";

export default function LeaveTypesPage() {
  const [types, setTypes] = useState<TypeConge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const initialFormState: Omit<TypeConge, 'id'> = {
    nomType: "",
    estDeductible: false,
    demandeJustification: true,
    dureMax: 1,
    estUnePermission: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await leaveTypeService.getAll();
      setTypes(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leaveTypeService.create(formData);
      toast.success("Nouveau type de congé ajouté avec succès");
      setFormData(initialFormState);
      setOpen(false);
      fetchTypes();
    } catch (error: any) {
      toast.error("Erreur lors de la création du type de congé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce type de congé ? Cette action est irréversible.")) return;
    try {
      await leaveTypeService.delete(id);
      toast.success("Type de congé supprimé");
      fetchTypes();
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      <p className="text-sm text-slate-500 animate-pulse">Chargement des configurations...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Configuration des Congés" 
          description="Définissez les règles, les limites et les justificatifs requis pour chaque type d'absence."
        />
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nouveau Type
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader className="space-y-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Nouveau type de congé
              </SheetTitle>
              <SheetDescription>
                Paramétrez les conditions de validation pour ce nouveau motif d'absence.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomType">Intitulé du congé</Label>
                  <Input 
                    id="nomType" 
                    placeholder="ex: Congé Annuel, Maladie..." 
                    value={formData.nomType}
                    onChange={(e) => setFormData({...formData, nomType: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dureMax">Durée maximale autorisée (jours)</Label>
                  <Input 
                    id="dureMax" 
                    type="number"
                    min="1"
                    value={formData.dureMax}
                    onChange={(e) => setFormData({...formData, dureMax: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Impact sur le solde</Label>
                    <p className="text-xs text-slate-500">Déduire du compteur annuel de l'employé</p>
                  </div>
                  <Switch 
                    checked={formData.estDeductible} 
                    onCheckedChange={(val) => setFormData({...formData, estDeductible: val})}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Preuve obligatoire</Label>
                    <p className="text-xs text-slate-500">Exiger un certificat ou justificatif PDF</p>
                  </div>
                  <Switch 
                    checked={formData.demandeJustification} 
                    onCheckedChange={(val) => setFormData({...formData, demandeJustification: val})}
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Permission exceptionnelle</Label>
                    <p className="text-xs text-slate-500">Marquer comme absence autorisée hors quota</p>
                  </div>
                  <Switch 
                    checked={formData.estUnePermission} 
                    onCheckedChange={(val) => setFormData({...formData, estUnePermission: val})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer la configuration"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">Aucun type de congé configuré pour le moment.</p>
          </div>
        ) : (
          types.map((t) => (
            <Card key={t.id} className="group p-5 border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 rounded-xl relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center text-slate-600 group-hover:text-primary font-bold text-xl transition-colors">
                    {t.nomType.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-none mb-2">{t.nomType}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                        <Clock className="w-3 h-3 mr-1" /> Max: {t.dureMax}j
                      </span>
                      {t.demandeJustification && (
                        <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Justificatif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(t.id)} 
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className={`text-[10px] tracking-wider uppercase font-extrabold px-3 py-1 rounded-md border ${
                  t.estDeductible 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>
                  {t.estDeductible ? "Déductible du solde" : "Hors solde (Spécial)"}
                </span>
                
                {t.estUnePermission && (
                  <span className="text-[10px] font-bold text-slate-400 italic">Permission</span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}