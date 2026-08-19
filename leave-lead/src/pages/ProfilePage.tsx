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
  ShieldCheck, Calendar, Mail, Building, User as UserIcon, 
  Phone, Hash, Eye, EyeOff, Loader2 
} from "lucide-react";
import { Role } from "@/data/users";

const ProfilePage = () => {
  const { user } = useAuth();
  const [pw, setPw] = useState({ old: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const initials = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new !== pw.confirm) return toast.error("Les nouveaux mots de passe ne correspondent pas");
    if (pw.new.length < 8) return toast.error("Le mot de passe doit faire au moins 8 caractères");

    setLoading(true);
    try {
      await userService.updatePassword(user.id!, pw.old, pw.new);
      toast.success("Mot de passe mis à jour avec succès");
      setPw({ old: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader title="Mon profil" description="Gérez vos informations professionnelles et la sécurité." />
      
      <div className="grid gap-6 lg:grid-cols-12">
        {/* CARTE PROFIL */}
        <Card className="lg:col-span-4 p-6 border-slate-100 shadow-sm rounded-2xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-xl">{user.prenom} {user.nom}</h2>
              <span className="inline-block px-3 py-1 mt-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
          
          <div className="mt-8 space-y-4 border-t pt-6">
            {[
              { icon: Mail, label: user.email },
              { icon: Building, label: user.departement?.nom || "Aucun département" },
              { icon: Hash, label: `Matricule: ${user.matricule || "N/A"}` },
              { icon: Phone, label: user.telephone || "Non renseigné" },
              { icon: Calendar, label: `Membre depuis ${user.dateEmbauche || "Inconnue"}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                <item.icon className="h-4 w-4 text-indigo-400" />
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* FORMULAIRE SÉCURITÉ */}
        <Card className="lg:col-span-8 p-8 border-slate-100 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="font-bold text-lg">Changer mon mot de passe</h3>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            {[
              { id: 'old', label: 'Mot de passe actuel', val: pw.old },
              { id: 'new', label: 'Nouveau mot de passe', val: pw.new },
              { id: 'confirm', label: 'Confirmer le nouveau', val: pw.confirm }
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <div className="relative">
                  <Input 
                    id={field.id}
                    type={showPass ? "text" : "password"}
                    required
                    value={field.val}
                    className="h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 transition-colors"
                    onChange={(e) => setPw(prev => ({ ...prev, [field.id]: e.target.value }))}
                  />
                  {field.id === 'new' && (
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100"
            >
              {loading ? <><Loader2 className="mr-2 animate-spin" /> Mise à jour...</> : "Enregistrer les modifications"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;