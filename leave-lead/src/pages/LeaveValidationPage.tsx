import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { leaveService } from "@/api/congeService";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LeaveValidationPage = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeavesToValidate = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let data: any[] = [];

      const role = user.role?.toLowerCase();

      if (role === "chef_equipe") {
        data = await leaveService.getPendingByRole("chef-equipe", user.id);
      } else if (role === "manager") {
        data = await leaveService.getPendingByRole("departement", user.id);
      } else if (role === "drh") {
        data = await leaveService.getPendingByRole("drh");
      }

      setLeaves(data);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la récupération des demandes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeavesToValidate();
  }, [loadLeavesToValidate]);

  // Le backend lit le rôle depuis le token — on passe juste l'id
  const handleApprove = async (id: number) => {
    try {
      await leaveService.validateLeave(id);
      toast.success("Demande transmise au niveau suivant");
      loadLeavesToValidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur de validation");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await leaveService.rejectLeave(id);
      toast.success("Demande refusée");
      loadLeavesToValidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du refus");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

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
        title="Validation des congés"
        description={`Espace de décision : ${user?.role?.replace('_', ' ')}`}
      />

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Employé</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Statut actuel</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Aucune demande en attente de votre validation.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {/* Le DTO expose userId — pas l'objet user complet */}
                    <div className="font-medium text-slate-900">
                      Employé #{l.userId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Demande #{l.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    {l.typeCongeNom ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{formatDate(l.dateDebut)} → {formatDate(l.dateFin)}</div>
                    <div className="text-blue-600 font-medium">
                      {l.nombreJoursDeduit} jours ouvrables
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={l.statut?.toLowerCase()} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(l.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(l.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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

export default LeaveValidationPage;