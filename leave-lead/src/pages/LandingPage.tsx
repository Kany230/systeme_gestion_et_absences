import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Logo } from "@/components/common/Logo";
import {
  Calendar, Clock, Users, BarChart3, Shield, Zap,
  ArrowRight, CheckCircle2, Sparkles, TrendingUp,
  Globe2, ChevronRight, Star,
} from "lucide-react";

// ── Animation variants ────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

// ── Data ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Calendar,
    title: "Gestion des congés",
    desc: "Soumettez et suivez vos demandes en quelques secondes. Approbation multi-niveaux automatisée.",
    color: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    icon: Clock,
    title: "Pointage intelligent",
    desc: "Arrivée et départ en un clic. Historique complet et détection automatique des retards.",
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    icon: Users,
    title: "Vision d'équipe",
    desc: "Organigramme clair, gestion des départements et hiérarchie en temps réel.",
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    desc: "Chaque rôle a son espace dédié : DRH, Manager, Chef d'équipe ou Employé.",
    color: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    icon: Shield,
    title: "Accès par rôle",
    desc: "Chacun voit uniquement ce qui le concerne. Sécurité RBAC stricte et traçabilité complète.",
    color: "bg-indigo-500",
    light: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    icon: Zap,
    title: "Automatisation",
    desc: "Calcul des soldes, crédits mensuels et alertes d'absence — zéro intervention manuelle.",
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-600",
  },
];

const roles = [
  { label: "Employé", desc: "Posez vos congés, suivez vos soldes, justifiez vos absences.", color: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  { label: "Chef d'équipe", desc: "Validez les demandes, suivez les présences de votre équipe.", color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  { label: "Manager", desc: "Pilotez votre département, gérez les affectations.", color: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  { label: "Directeur RH", desc: "Vue globale, configuration du système, export et rapports.", color: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
];

const steps = [
  { n: "01", title: "Connexion sécurisée", desc: "Chaque collaborateur accède à son espace personnalisé selon son rôle." },
  { n: "02", title: "Demande en 30 secondes", desc: "Choisissez le type, les dates — la demande part immédiatement au bon niveau." },
  { n: "03", title: "Validation automatique", desc: "Chef d'équipe → Manager → DRH. Chaque étape notifie l'employé." },
];

const testimonials = [
  { name: "Aminata Diallo", role: "Directrice RH", quote: "En 2 semaines, tous nos processus papier ont disparu. L'équipe adore.", avatar: "AD" },
  { name: "Moussa Ndiaye", role: "Manager IT", quote: "Je valide les congés de mon équipe depuis mon téléphone en 10 secondes.", avatar: "MN" },
  { name: "Fatou Sall", role: "Employée", quote: "Enfin une app RH que j'ai envie d'utiliser. Simple, rapide, claire.", avatar: "FS" },
];

// ── Mock Dashboard Preview ─────────────────────────────────────────────────
const DashboardPreview = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
    {/* Top bar */}
    <div className="bg-slate-900 px-4 py-3 flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-red-400" />
      <span className="h-3 w-3 rounded-full bg-amber-400" />
      <span className="h-3 w-3 rounded-full bg-emerald-400" />
      <span className="flex-1 mx-4 bg-slate-700 rounded-full h-5 text-[10px] text-slate-400 flex items-center px-3">
        timeoff.uidt.sn/dashboard
      </span>
    </div>
    {/* Content */}
    <div className="flex">
      {/* Sidebar mini */}
      <div className="w-14 bg-slate-900 flex flex-col items-center gap-4 py-4">
        {[Calendar, Clock, Users, BarChart3, Shield].map((Icon, i) => (
          <div key={i} className={`p-2 rounded-lg ${i === 0 ? "bg-blue-600" : "text-slate-500"}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        ))}
      </div>
      {/* Main area */}
      <div className="flex-1 bg-slate-50 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-32 bg-slate-800 rounded-full mb-1" />
            <div className="h-2 w-20 bg-slate-300 rounded-full" />
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            MD
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Solde annuel", val: "18 j", color: "bg-blue-600" },
            { label: "En attente", val: "2", color: "bg-amber-500" },
            { label: "Présents", val: "24", color: "bg-emerald-500" },
          ].map((c, i) => (
            <div key={i} className={`${c.color} rounded-xl p-3 text-white`}>
              <p className="text-[9px] opacity-80">{c.label}</p>
              <p className="text-lg font-bold">{c.val}</p>
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 p-3">
          <div className="h-2 w-24 bg-slate-300 rounded mb-3" />
          {[
            { name: "Ibrahima Fall", status: "Présent", color: "bg-emerald-100 text-emerald-700" },
            { name: "Khadija Mbaye", status: "En congé", color: "bg-blue-100 text-blue-700" },
            { name: "Omar Thiam", status: "Retard", color: "bg-amber-100 text-amber-700" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[8px] font-bold">
                  {r.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="h-2 w-16 bg-slate-200 rounded" />
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${r.color}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-50 to-transparent rounded-b-full opacity-60" />
        </div>

        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white mb-8 uppercase tracking-widest shadow-sm shadow-blue-200">
                  <Sparkles className="h-3 w-3" /> Solution RH Moderne
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900"
              >
                Gérez vos équipes{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-600">sans friction</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-100 -z-0 rounded" />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 text-lg text-slate-500 max-w-lg leading-relaxed"
              >
                TimeOff System centralise congés, absences et pointages dans une seule plateforme. Simple pour l'employé, puissant pour le DRH.
              </motion.p>

              {/* Social proof mini */}
              <motion.div variants={fadeUp} custom={3} className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["AD", "MN", "FS", "IB"].map((init, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
                      {init}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">+200 collaborateurs</span> gèrent leurs congés sur TimeOff
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 h-13 px-8 text-base rounded-xl shadow-lg shadow-blue-100 group font-semibold"
                >
                  <Link to="/login">
                    Accéder à mon espace
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-base rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <a href="#fonctionnalites" className="flex items-center gap-2">
                    Voir les fonctionnalités
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} custom={5} className="mt-10 flex flex-wrap gap-6">
                {[
                  { icon: CheckCircle2, text: "Gratuit pour les équipes internes" },
                  { icon: Shield, text: "Données sécurisées" },
                  { icon: Zap, text: "Déploiement en 1 jour" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <item.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="absolute -left-6 top-16 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Congé validé</p>
                  <p className="text-[10px] text-slate-400">il y a 2 minutes</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="absolute -right-4 bottom-20 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3"
              >
                <p className="text-xs text-slate-400 mb-1">Présents aujourd'hui</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-slate-800">24</p>
                  <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +3
                  </span>
                </div>
              </motion.div>

              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS BAND
      ═══════════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="container max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Sans papier", sub: "Zéro formulaire imprimé" },
              { value: "< 30s", label: "Pour poser un congé", sub: "Du formulaire à l'envoi" },
              { value: "4 niveaux", label: "De validation", sub: "Chef → Manager → DRH" },
              { value: "Temps réel", label: "Suivi des présences", sub: "Mis à jour à chaque pointage" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <p className="text-3xl font-black text-blue-600">{s.value}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{s.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════════ */}
      <section id="fonctionnalites" className="py-24">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Fonctionnalités</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">
              Tout ce dont votre RH a besoin
            </h2>
            <p className="text-slate-500 text-lg">
              Une plateforme pensée pour chaque acteur — de l'employé au Directeur RH.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                className="group bg-white border border-slate-100 rounded-2xl p-7 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 cursor-default"
              >
                <div className={`h-12 w-12 rounded-xl ${f.light} flex items-center justify-center mb-5`}>
                  <f.icon className={`h-6 w-6 ${f.text}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${f.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  En savoir plus <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          RÔLES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Accès par rôle</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-4">
                Chacun a sa propre expérience
              </h2>
              <p className="text-slate-500 text-lg mb-10">
                L'interface s'adapte automatiquement au rôle de l'utilisateur connecté. Personne ne voit ce qui ne le concerne pas.
              </p>

              <div className="space-y-4">
                {roles.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <div className={`mt-1 h-3 w-3 rounded-full ${r.dot} shrink-0`} />
                    <div>
                      <p className="font-semibold text-slate-800">{r.label}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Comment ça marche</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-3 mb-10">
                En 3 étapes simples
              </h2>
              <div className="space-y-6">
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.45 }}
                    className="flex gap-5"
                  >
                    <div className="shrink-0 h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-100">
                      {s.n}
                    </div>
                    <div className="pt-2">
                      <p className="font-bold text-slate-800">{s.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Témoignages</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-3">Ils l'utilisent chaque jour</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white border border-slate-100 rounded-2xl p-7 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-slate-900 rounded-[2.5rem] p-14 lg:p-20 text-center overflow-hidden"
          >
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-400 mb-8 uppercase tracking-widest border border-blue-600/20">
                <Sparkles className="h-3 w-3" /> Prêt à démarrer ?
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Dites adieu aux tableurs<br />et aux formulaires papier
              </h2>
              <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
                Connectez-vous et découvrez un espace de gestion RH pensé pour vous faire gagner du temps chaque jour.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 h-14 px-10 text-base rounded-xl font-semibold shadow-lg shadow-blue-900/30 group"
                >
                  <Link to="/login">
                    Se connecter maintenant
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-base rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 font-medium"
                >
                  <a href="#fonctionnalites">Découvrir les fonctionnalités</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-100 bg-white py-14">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            {/* Brand */}
            <div className="max-w-xs">
              <Logo />
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                La plateforme RH conçue pour simplifier la gestion des congés, absences et pointages au quotidien.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12 text-sm">
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Produit</p>
                <div className="space-y-2 text-slate-400">
                  <Link to="/login" className="block hover:text-blue-600 transition-colors">Connexion</Link>
                  <a href="#fonctionnalites" className="block hover:text-blue-600 transition-colors">Fonctionnalités</a>
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 uppercase tracking-wider text-xs">Légal</p>
                <div className="space-y-2 text-slate-400">
                  <Link to="/contact" className="block hover:text-blue-600 transition-colors">Contact</Link>
                  <Link to="/privacy" className="block hover:text-blue-600 transition-colors">Confidentialité</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 TimeOff System · Tous droits réservés
            </p>
            <p className="text-slate-300 text-xs">
              Développé avec soin pour la gestion RH moderne
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;