import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const LoginPage = () => {
  const { login, user } = useAuth();
  const nav = useNavigate();
  
  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Redirection automatique si déjà connecté
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Appel de la fonction login du AuthContext
      await login(email, password, remember);
      toast.success("Connexion réussie !");
      nav("/dashboard");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error(error.message || "Identifiants invalides ou serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Éléments de décoration en arrière-plan */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <Card className="w-full max-w-md p-8 shadow-2xl border-none bg-white/80 backdrop-blur-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
             <Logo size="lg" showText={false} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TimeOff System</h1>
          <p className="text-slate-500 mt-2 italic text-sm">Gestion des absences & pointages</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Adresse Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="email" 
                type="email" 
                placeholder="nom@entreprise.com"
                className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Mot de passe
              </Label>
              <button 
                type="button" 
                className="text-xs text-blue-600 hover:underline font-medium"
                onClick={() => toast.info("Contactez votre administrateur RH")}
              >
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="pl-10 h-11 border-slate-200 focus:ring-blue-500"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={remember} 
              onCheckedChange={(v) => setRemember(!!v)}
              className="border-slate-300 data-[state=checked]:bg-blue-600"
            />
            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
              Rester connecté
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Authentification...
              </span>
            ) : "Se connecter"}
          </Button>

          {/* Aide pour le développement */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Comptes de test</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 italic">
              <span>• rh@timeoff.com</span>
              <span>• chef@timeoff.com</span>
              <span>• manager@timeoff.com</span>
              <span>• employe@timeoff.com</span>
            </div>
          </div>

          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors mt-4"
          >
            <ArrowLeft className="h-3 w-3" /> Retour au site
          </Link>
        </form>
      </Card>
      
      <footer className="absolute bottom-6 text-slate-400 text-xs">
        &copy; 2026 TimeOff System · Gestion de congé et d'absence
      </footer>
    </div>
  );
};

export default LoginPage;