import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Logique de monitoring utile pour ton projet
    console.error(
      "404 Error: Tentative d'accès à une route inexistante :", 
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        {/* Icône animée pour le côté pro */}
        <div className="mb-6 flex justify-center">
          <div className="p-6 bg-blue-100 rounded-full text-blue-600 animate-pulse">
            <FileQuestion size={64} />
          </div>
        </div>

        <h1 className="text-7xl font-black text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page introuvable</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Désolé, la page <code className="bg-slate-200 px-1 rounded text-pink-600 text-sm">{location.pathname}</code> n'existe pas ou a été déplacée dans le système.
        </p>

        <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl shadow-lg shadow-blue-100">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Retourner à l'accueil
          </Link>
        </Button>
        
        <p className="mt-12 text-xs text-slate-400 italic">
          TimeOff System · Université Iba Der Thiam de Thiès
        </p>
      </div>
    </div>
  );
};

export default NotFound;