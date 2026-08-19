import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, CalendarDays, CheckSquare, Clock, UserX,
  Users, FileSpreadsheet, Building2, PartyPopper, User as UserIcon, X, UsersRound,
  BarChart,
  LucideHistory,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Item { to: string; label: string; icon: any; roles: string[]; }
// Modifie ton tableau 'items' dans Sidebar.tsx
const items: Item[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ["employe", "manager", "chef_equipe", "DRH", "admin"] },
  { to: "/leaves", label: "Demandes de congé", icon: CalendarDays, roles: ["employe", "manager", "chef_equipe", "DRH"] },
  { to: "/leaves/validate", label: "Validation des congés", icon: CheckSquare, roles: ["manager", "chef_equipe", "DRH", "admin"] },
  { to: "/admin/conges-valides", label: "Congés validés", icon: ClipboardCheck, roles: ["admin"] },
  { to: "/leave-types", label: "Types de congés", icon: FileSpreadsheet, roles: ["DRH", "manager", "chef_equipe", "employe", "admin"] },
  { to: "/historique", label: "Historique", icon: LucideHistory, roles: ["employe","manager", "DRH","chef_equipe", "admin"]  },
  { to: "/admin", label: "Pointages & Présence", icon: Clock, roles: ["DRH", "admin"] },
  { to: "/attendance", label: "Pointages & Présence", icon: Clock, roles: ["employe","manager","chef_equipe"] },
  { to: "/team", label: "Mon équipe", icon: UsersRound, roles: ["employe", "manager", "chef_equipe"] },
  { to: "/absences", label: "Absences", icon: UserX, roles: ["employe", "manager", "chef_equipe", "DRH", "admin"] },
  { to: "/users", label: "Utilisateurs", icon: Users, roles: ["DRH", "admin"] },
  {to: "/users/import", label: "Importation Excel", icon: FileSpreadsheet, roles: ["DRH", "admin"]},
  {to: "/chef", label: "Gestion de l'équipe", icon: Users, roles: ["manager"]},
  { to: "/departments", label: "Départements", icon: Building2, roles: ["manager", "chef_equipe", "DRH", "admin"] },
  { to: "/holidays", label: "Jours fériés", icon: PartyPopper, roles: ["employe", "manager", "chef_equipe", "DRH", "admin"] },
  { to: "/profile", label: "Profil", icon: UserIcon, roles: ["employe", "manager", "chef_equipe", "DRH", "admin"] },
];

export const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user } = useAuth();
  if (!user) return null;
  const visible = items.filter((i) => i.roles.includes(user.role));

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 lg:z-0 h-screen w-64 shrink-0 border-r border-border bg-card transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <span className="font-semibold">Menu</span>
          <button onClick={onClose} className="lg:hidden p-1"><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
