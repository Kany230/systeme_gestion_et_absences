import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "@/api/congeService";
import { TypeConge } from "@/data/conges";
import { Plus, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LeavesPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [typesConge, setTypesConge] = useState<TypeConge[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    typeId: "",
    startDate: "",
    endDate: "",
    justificationUrl: ""
  });

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [data, types] = await Promise.all([
        leaveService.getMyLeaves(user.id),
        leaveService.getTypeConges()
      ]);
      setLeaves(data);
      setTypesConge(types);
    } catch (error: any) {
      toast.error(error.message || "Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Utilisateur non connecté.");
      return;
    }

    if (!form.typeId) {
      toast.error("Veuillez sélectionner un type de congé.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Veuillez renseigner les dates de début et de fin.");
      return;
    }

    if (form.endDate < form.startDate) {
      toast.error("La date de fin doit être après la date de début.");
      return;
    }

    try {
      setSubmitting(true);
      await leaveService.createLeave({
        user: { id: user.id },
        dateDebut: form.startDate,
        dateFin: form.endDate,
        typeConge: { id: parseInt(form.typeId) } as any,
        justificationUrl: form.justificationUrl || ""
      });

      toast.success("Demande envoyée avec succès");
      setOpen(false);
      setForm({ typeId: "", startDate: "", endDate: "", justificationUrl: "" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      const msg = await leaveService.cancelLeave(id);
      toast.success(msg || "Demande annulée");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Impossible d'annuler cette demande");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  const isCancellable = (statut: string) =>
    ["en_attente_chef_equipe", "en_attente_manager", "en_attente_drh"].includes(
      statut?.toLowerCase()
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes demandes de congé"
        description="Gestion des congés et permissions"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Soumettre une demande</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4 pt-4">

                <div className="space-y-2">
                  <Label>Type de congé</Label>
                  <Select
                    value={form.typeId}
                    onValueChange={(v) => setForm({ ...form, typeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typesConge.length === 0 ? (
                        <SelectItem value="" disabled>
                          Aucun type disponible
                        </SelectItem>
                      ) : (
                        typesConge.map((type) => (
                          <SelectItem key={type.id} value={String(type.id)}>
                            {type.nomType}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      value={form.startDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      value={form.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Justificatif (URL PDF/Image)
                  </Label>
                  <Input
                    name="justificationUrl"
                    placeholder="https://lien-vers-mon-justificatif.com/doc.pdf"
                    value={form.justificationUrl}
                    onChange={handleChange}
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    Obligatoire pour les congés maladie ou permissions spéciales.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer la demande"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Jours ouvrables</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Aucune demande de congé enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-semibold">
                    {l.typeCongeNom ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    Du {formatDate(l.dateDebut)} au {formatDate(l.dateFin)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-blue-600">
                      {l.nombreJoursDeduit} j
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={l.statut?.toLowerCase()} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isCancellable(l.statut) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleCancel(l.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LeavesPage;