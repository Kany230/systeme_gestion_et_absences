import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "@/api/congeService";
import { Check, X, Loader2, Eye, FileText, Calendar, User, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const BACKEND_BASE = "http://localhost:8080/conge-absence";

const LeaveValidationPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const isImage = (url: string) => !!url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const getFullUrl = (url: string) => url?.startsWith("http") ? url : `${BACKEND_BASE}${url}`;

  const loadLeavesToValidate = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const role = user.role?.toLowerCase();
      let data = role === "chef_equipe" ? await leaveService.getPendingByRole("chef-equipe", user.id) 
               : role === "manager" ? await leaveService.getPendingByRole("departement", user.departement?.id)
               : await leaveService.getPendingByRole("drh");
      setLeaves(data);
    } catch {
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadLeavesToValidate(); }, [loadLeavesToValidate]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      action === 'approve' ? await leaveService.validateLeave(id) : await leaveService.rejectLeave(id);
      toast.success(action === 'approve' ? "Demande validée" : "Demande refusée");
      setDetailOpen(false);
      loadLeavesToValidate();
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-end">
        <PageHeader title="Validation des congés" description="Examinez et traitez les demandes en attente." />
        <Badge variant="outline" className="px-4 py-1 text-sm bg-blue-50 text-blue-700 border-blue-200">
          {leaves.length} demande{leaves.length > 1 ? 's' : ''} en attente
        </Badge>
      </div>

      <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Collaborateur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-400">Aucune demande à valider</TableCell></TableRow>
            ) : (
              leaves.map((l) => (
                <TableRow key={l.id} className="group hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {l.userPrenom[0]}{l.userNom[0]}
                    </div>
                    {l.userPrenom} {l.userNom}
                  </TableCell>
                  <TableCell className="text-slate-600">{l.typeCongeNom}</TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{new Date(l.dateDebut).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-400 mx-2">→</span>
                    <span className="text-sm font-medium">{new Date(l.dateFin).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell><StatusBadge status={l.statut?.toLowerCase()} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedLeave(l); setDetailOpen(true); }} className="hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Détails */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Détail de la demande</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Employé:</span>
                  <span className="font-semibold">{selectedLeave.userPrenom} {selectedLeave.userNom}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Durée:</span>
                  <span className="font-bold text-blue-600">{selectedLeave.nombreJoursDeduit} jours</span>
                </div>
              </div>

              {selectedLeave.justificationUrl && (
                <div className="border rounded-xl p-4">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Justificatif</p>
                  {isImage(selectedLeave.justificationUrl) ? (
                    <img src={getFullUrl(selectedLeave.justificationUrl)} className="rounded-lg w-full h-40 object-cover" />
                  ) : (
                    <a href={getFullUrl(selectedLeave.justificationUrl)} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline"><FileText size={16}/> Voir document</a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleAction(selectedLeave.id, 'approve')} className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="mr-2 h-4 w-4" /> Valider
                </Button>
                <Button variant="outline" onClick={() => handleAction(selectedLeave.id, 'reject')} className="border-red-200 text-red-600 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" /> Refuser
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveValidationPage;