import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const LoginPage = () => {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, true);
      toast.success("Bienvenue sur TimeOff System");
      nav("/dashboard");
    } catch (error: any) {
      toast.error("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
  
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
    
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <Logo className="text-white" />
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold leading-tight">
            Gérez vos ressources <br /> avec une précision <span className="text-blue-400">chirurgicale.</span>
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              <div>
                <p className="font-semibold">Sécurisé & Fiable</p>
                <p className="text-slate-400 text-sm">Gestion des accès et traçabilité complète.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap className="h-6 w-6 text-amber-400" />
              <div>
                <p className="font-semibold">Automatisation RH</p>
                <p className="text-slate-400 text-sm">Zéro papier, zéro calcul manuel.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Users className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="font-semibold">Collaboration fluide</p>
                <p className="text-slate-400 text-sm">Une visibilité claire pour tous les niveaux hiérarchiques.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-slate-500 text-xs">© 2026 TimeOff System · Tous droits réservés</p>
      </div>

      
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Bon retour !</h1>
            <p className="text-slate-500">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="nom@entreprise.com" 
                  className="pl-10 h-12 rounded-xl"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">Oublié ?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 rounded-xl"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" defaultChecked />
              <label htmlFor="remember" className="text-sm text-slate-600 select-none">Rester connecté</label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Se connecter <ArrowRight className="h-4 w-4" /></span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;