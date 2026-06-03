import { useAuth } from "@/context/AuthContext";
import LandingPage from "./LandingPage";
import { Layout } from "@/components/layout/Layout";
import HolidaysPage from "./HolidaysPage"; // Ta page avec le calendrier
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  // 1. Gestion du chargement initial (vérification du token/session)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. Si l'utilisateur n'est pas connecté, on montre la page de présentation/login
  if (!user) {
    return <LandingPage />;
  }

  // 3. Si l'utilisateur est connecté, on l'envoie vers l'application principale
  // Ici, on peut par exemple afficher le calendrier par défaut
  return (
    <Layout>
       <HolidaysPage />
    </Layout>
  );
};

export default Index;