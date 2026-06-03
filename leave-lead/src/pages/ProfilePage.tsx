import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/api/userService";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Building, 
  User as UserIcon, 
  Phone, 
  Hash 
} from "lucide-react";
import { Role } from "@/data/users"; // Import de ton Enum Role

const roleLabels: Record<string, string> = {
  [Role.employe]: "Employé",
  [Role.chef_equipe]: "Chef d'équipe",
  [Role.manager]: "Manager",
  [Role.DRH]: "Directeur RH"
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [pw, setPw] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Calcul des initiales basé sur tes champs 'prenom' et 'nom'
  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new !== pw.confirm) {
      return toast.error("Les nouveaux mots de passe ne correspondent pas");
    }

    setLoading(true);
    try {
      // Utilisation du service pour mettre à jour le mot de passe
      if (user.id) {
        await userService.updatePassword(user.id, pw.old, pw.new);
        toast.success("Mot de passe mis à jour avec succès");
        setPw({ old: "", new: "", confirm: "" });
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Mon profil" 
        description="Gérez vos informations professionnelles et la sécurité de votre compte" 
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CARTE D'IDENTITÉ PROFESSIONNELLE */}
        <Card className="p-8 lg:col-span-1 flex flex-col items-center text-center space-y-4 shadow-sm border-none bg-white">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
            {initials || <UserIcon size={40} />}
          </div>
          
          <div>
            <h2 className="font-bold text-xl text-slate-900">{user.prenom} {user.nom}</h2>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              {roleLabels[user.role as string] || user.role}
            </p>
          </div>
          
          <div className="w-full pt-6 space-y-4 text-left border-t border-slate-100">
             <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" /> 
                <span className="truncate">{user.email}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building className="h-4 w-4 text-slate-400" /> 
                {/* Correction : Accès sécurisé à l'objet Departement */}
                <span>{user.departement?.nom || "Aucun département"}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600">
                <Hash className="h-4 w-4 text-slate-400" /> 
                <span>Matricule: {user.matricule || "N/A"}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" /> 
                <span>{user.telephone || "Non renseigné"}</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" /> 
                <span>Embauché le {user.dateEmbauche}</span>
             </div>
          </div>
        </Card>

        {/* FORMULAIRE DE SÉCURITÉ */}
        <Card className="p-8 lg:col-span-2 shadow-sm border-none bg-white">
          <div className="flex items-center gap-2 mb-8 text-slate-800">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Sécurité & Authentification</h2>
              <p className="text-xs text-slate-500">Mettez à jour votre mot de passe pour sécuriser votre accès</p>
            </div>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="old">Mot de passe actuel</Label>
              <Input 
                id="old"
                type="password" 
                required 
                value={pw.old} 
                className="h-11 bg-slate-50 border-slate-200 focus:ring-blue-500"
                onChange={(e) => setPw({ ...pw, old: e.target.value })} 
              />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new">Nouveau mot de passe</Label>
                <Input 
                  id="new"
                  type="password" 
                  required 
                  value={pw.new} 
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-blue-500"
                  onChange={(e) => setPw({ ...pw, new: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input 
                  id="confirm"
                  type="password" 
                  required 
                  value={pw.confirm} 
                  className="h-11 bg-slate-50 border-slate-200 focus:ring-blue-500"
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })} 
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="px-8 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-100 rounded-xl"
              >
                {loading ? "Traitement en cours..." : "Mettre à jour le mot de passe"}
              </Button>
            </div>
          </form>
          
          <div className="mt-12 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <div className="text-amber-600">⚠️</div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Note importante :</strong> Le changement de mot de passe est définitif. 
              En cas de perte, vous devrez contacter le support technique de l'UIDT ou votre administrateur DRH pour réinitialiser votre accès.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;