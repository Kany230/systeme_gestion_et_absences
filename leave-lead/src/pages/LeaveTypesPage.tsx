import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { leaveTypeService } from "@/api/typeService";
import { TypeConge } from "@/data/type";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Clock, ShieldCheck, FileText, Settings2, AlertCircle, BadgeCheck, Wallet, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";

export default function LeaveTypesPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState<TypeConge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // État pour le Sheet de détail
  const [selectedType, setSelectedType] = useState<TypeConge | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const canEdit = user?.role === "DRH" || user?.role === "admin";

  const initialFormState = {
    nomType: "",
    estDeductible: false,
    demandeJustification: true,
    dureMax: 1,
    estUnePermission: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await leaveTypeService.getAll();
      setTypes(data);
    } catch {
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
      toast.success("Type de congé ajouté avec succès");
      setFormData(initialFormState);
      setOpen(false);
      fetchTypes();
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await leaveTypeService.delete(id);
      toast.success("Type de congé supprimé");
      // Fermer le détail si on supprime le type actuellement affiché
      if (selectedType?.id === id) setDetailOpen(false);
      fetchTypes();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleOpenDetail = (type: TypeConge) => {
    setSelectedType(type);
    setDetailOpen(true);
  };

  if (loading) return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Configuration des Congés"
          description="Gérez les règles, durées et justificatifs pour chaque type d'absence."
        />
        {canEdit && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Nouveau type
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-xl">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Paramétrage
                </SheetTitle>
                <SheetDescription>Définissez les conditions d'attribution.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label>Intitulé du congé</Label>
                  <Input value={formData.nomType} onChange={(e) => setFormData({ ...formData, nomType: e.target.value })} placeholder="ex: Congé Annuel" required />
                </div>
                <div className="space-y-2">
                  <Label>Durée maximale (jours)</Label>
                  <Input type="number" value={formData.dureMax} onChange={(e) => setFormData({ ...formData, dureMax: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <SwitchGroup label="Impact sur le solde" desc="Déduire du compteur annuel" checked={formData.estDeductible} onCheckedChange={(val) => setFormData({ ...formData, estDeductible: val })} />
                  <SwitchGroup label="Preuve obligatoire" desc="Exiger un justificatif" checked={formData.demandeJustification} onCheckedChange={(val) => setFormData({ ...formData, demandeJustification: val })} />
                  <SwitchGroup label="Permission exceptionnelle" desc="Hors quota" checked={formData.estUnePermission} onCheckedChange={(val) => setFormData({ ...formData, estUnePermission: val })} />
                </div>
                <Button type="submit" className="w-full h-12 text-md" disabled={isSubmitting}>
                  {isSubmitting ? "Enregistrement..." : "Confirmer la création"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Sheet de détail — visible par tous */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedType && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selectedType.nomType}</SheetTitle>
                    <SheetDescription>Détails du type de congé</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-8 space-y-4">

                {/* Durée maximale */}
                <DetailItem
                  icon={<Clock className="h-5 w-5 text-slate-500" />}
                  label="Durée maximale"
                  value={`${selectedType.dureMax} jours`}
                  badgeClass="bg-slate-100 text-slate-700"
                />

                {/* Impact solde */}
                <DetailItem
                  icon={<Wallet className="h-5 w-5 text-slate-500" />}
                  label="Impact sur le solde"
                  value={selectedType.estDeductible ? "Déduit du compteur" : "Non déduit"}
                  badgeClass={selectedType.estDeductible ? "bg-rose-50 text-rose-600" : "bg-green-50 text-green-600"}
                />

                {/* Justificatif */}
                <DetailItem
                  icon={<ShieldCheck className="h-5 w-5 text-slate-500" />}
                  label="Justificatif requis"
                  value={selectedType.demandeJustification ? "Oui, obligatoire" : "Non requis"}
                  badgeClass={selectedType.demandeJustification ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"}
                />

                {/* Type */}
                <DetailItem
                  icon={<BadgeCheck className="h-5 w-5 text-slate-500" />}
                  label="Catégorie"
                  value={selectedType.estUnePermission ? "Permission exceptionnelle" : "Congé standard"}
                  badgeClass={selectedType.estUnePermission ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}
                />
              </div>

              {/* Bouton supprimer dans le détail — canEdit uniquement */}
              {canEdit && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full rounded-xl">
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer ce type
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Toutes les données associées seront impactées.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedType.id)} className="bg-rose-600">Confirmer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {types.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed">
          <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Aucun type défini</h3>
          <p className="text-slate-500">Commencez par ajouter un nouveau type de congé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((t) => (
            <Card
              key={t.id}
              className="p-6 rounded-2xl border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              onClick={() => handleOpenDetail(t)}
            >
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <FileText className="h-7 w-7" />
                </div>
                {/* Stopper la propagation du click pour ne pas ouvrir le détail en supprimant */}
                {canEdit && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible. Toutes les données associées seront impactées.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-rose-600">Confirmer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg text-slate-900">{t.nomType}</h3>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="flex items-center text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                    <Clock className="w-3 h-3 mr-1" /> {t.dureMax} jours
                  </span>
                  {t.demandeJustification && (
                    <span className="flex items-center text-xs font-medium px-3 py-1 bg-amber-50 text-amber-700 rounded-full">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Justificatif requis
                    </span>
                  )}
                </div>
              </div>

              {/* Indicateur visuel "voir détail" */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-primary transition-colors">
                <span>Voir les détails</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SwitchGroup({ label, desc, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between p-2">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function DetailItem({ icon, label, value, badgeClass }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badgeClass: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
          {value}
        </span>
      </div>
    </div>
  );
}