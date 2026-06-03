import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Logo } from "@/components/common/Logo";
import {
  Calendar, Clock, Users, BarChart3, Shield, Zap,
  ArrowRight, CheckCircle2, Sparkles, TrendingUp, Globe2, Star,
} from "lucide-react";

// Tu peux remplacer cette URL par ton propre screenshot de l'app plus tard
const heroImg = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";

const features = [
  { icon: Calendar, title: "Gestion des congés", desc: "Soumettez, suivez et approuvez les demandes en quelques secondes.", color: "from-blue-500 to-cyan-500" },
  { icon: Clock, title: "Pointage intelligent", desc: "Arrivée et départ sans effort, suivi en temps réel.", color: "from-violet-500 to-fuchsia-500" },
  { icon: Users, title: "Vision d'équipe", desc: "Gérez employés, départements et hiérarchie facilement.", color: "from-emerald-500 to-teal-500" },
  { icon: BarChart3, title: "Tableaux de bord", desc: "Analyses élégantes pour RH, chefs, managers et employés.", color: "from-orange-500 to-red-500" },
  { icon: Shield, title: "Accès par rôle", desc: "Employé, Manager, Chef d'équipe, RH — chacun son espace.", color: "from-indigo-500 to-purple-500" },
  { icon: Zap, title: "Automatisation", desc: "Calcul automatique des soldes et détection des absences.", color: "from-yellow-500 to-amber-500" },
];

const benefits = [
  { icon: TrendingUp, title: "Productivité +40%", desc: "Moins d'allers-retours, plus de temps pour vos équipes." },
  { icon: Globe2, title: "100% Cloud", desc: "Accessible partout, sur tous vos appareils." },
  { icon: Sparkles, title: "Interface Intuitive", desc: "Une expérience pensée pour la simplicité au quotidien." },
  { icon: Shield, title: "Sécurité RBAC", desc: "Permissions strictes basées sur les rôles métiers." },
];

const stats = [
  { value: "10k+", label: "Demandes traitées" },
  { value: "99.9%", label: "Disponibilité" },
  { value: "4.9/5", label: "Satisfaction RH" },
  { value: "60s", label: "Pour valider un congé" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden font-sans">
      <Navbar />

      {/* --- SECTION HERO --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="container relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 mb-6 border border-blue-100 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Solution RH Tout-en-un
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Maîtrisez le temps de vos équipes avec <br/>
              <span className="text-blue-600">TimeOff System</span>
            </h1>
            <p className="mt-8 text-xl text-slate-600 max-w-xl leading-relaxed">
              La plateforme moderne pour piloter congés, absences et pointages. Conçue pour simplifier la vie des RH, des Managers et des Employés.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-xl shadow-lg shadow-blue-200 group">
                <Link to="/login">
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-slate-200">
                <a href="#features">Voir les fonctionnalités</a>
              </Button>
            </div>
          </motion.div>

          {/* Preview Image / Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
              <img src={heroImg} alt="Dashboard Preview" className="w-full h-auto object-cover" />
            </div>
            {/* Badge flottant */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-8 bottom-12 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-50"
            >
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Congé validé</p>
                <p className="text-sm font-bold text-slate-800 italic">Kany Cisse</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- SECTION STATS --- */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-black text-blue-600">{s.value}</p>
              <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-tighter">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION FEATURES --- */}
      <section id="features" className="container py-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Tout ce dont vous avez besoin pour piloter vos RH</h2>
          <p className="text-lg text-slate-600 italic">Une gestion intelligente basée sur les rôles : Employé, Chef d'équipe, Manager et DRH.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Card key={i} className="p-8 border-none shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default bg-white rounded-2xl">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* --- SECTION CTA --- */}
      <section className="container pb-24">
        <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Prêt à transformer la gestion de vos équipes ?
            </h2>
            <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto">
              Rejoignez TimeOff System et automatisez le suivi des présences et des absences en toute simplicité.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-50 h-14 px-10 text-lg rounded-xl font-bold">
              <Link to="/login">Accéder à mon espace</Link>
            </Button>
          </div>
          {/* Décoration en fond */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-100 py-12 bg-white">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-slate-500 text-sm italic">
            © 2026 TimeOff System · Développé avec excellence pour la gestion RH.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <Link to="/contact" className="hover:text-blue-600">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-600">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;