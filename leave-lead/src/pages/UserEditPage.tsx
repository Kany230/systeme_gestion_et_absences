import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "@/api/userService";
import { departmentService } from "@/api/departementService"; // Ajouté
import { User } from "@/data/users";
import { Department } from "@/data/departments"; // Votre interface Departement
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [departements, setDepartements] = useState<Department[]>([]); // Liste des depts
  const [user, setUser] = useState<Partial<User>>({});

  useEffect(() => {
    const initPage = async () => {
      try {
        // On récupère l'utilisateur ET la liste des départements en parallèle
        const [userData, deptsData] = await Promise.all([
          userService.getById(Number(id)),
          departmentService.list()
        ]);
        
        setUser(userData);
        setDepartements(deptsData);
      } catch (e) { 
        toast.error("Erreur lors du chargement des données"); 
      } finally { 
        setLoading(false); 
      }
    };
    initPage();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.update(Number(id), user);
      toast.success("Profil mis à jour avec succès");
      navigate("/users");
    } catch (e) { 
      toast.error("Erreur lors de la mise à jour"); 
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <Card className="p-8 border-none shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-slate-800">Modifier le profil</h1>
        <p className="text-sm text-slate-500 mb-6">Mettez à jour les informations de l'employé.</p>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom</label>
              <Input 
                value={user.prenom || ""} 
                onChange={e => setUser({...user, prenom: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input 
                value={user.nom || ""} 
                onChange={e => setUser({...user, nom: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email professionnel</label>
            <Input 
              type="email" 
              value={user.email || ""} 
              onChange={e => setUser({...user, email: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Département</label>
            <select 
              className="w-full border rounded-md p-2 bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              /* 
                 On utilise l'ID pour la valeur technique. 
                 On gère le cas où l'objet departement est imbriqué 
              */
              value={typeof user.departement === 'object' ? user.departement.id : user.departement}
              onChange={e => setUser({
                ...user, 
                departement: Number(e.target.value) as any 
            })}
            >
              <option value="">Sélectionner un département</option>
              {departements.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nom} {/* C'est ici qu'on affiche le NOM */}
                </option>
              ))}
            </select>
            
            {/* Petit indicateur visuel pour confirmer le choix */}
            {user.departement && (
              <p className="text-[11px] text-indigo-600 font-medium italic">
                Actuellement rattaché au département sélectionné.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6 shadow-md transition-all">
            <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
          </Button>
        </form>
      </Card>
    </div>
  );
}