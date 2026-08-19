import { Moon, Sun, LogOut, Menu, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export const Navbar = ({ onMenu }: { onMenu?: () => void }) => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6 justify-between">
      <div className="flex items-center gap-4">
        {onMenu && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Logo to="/dashboard" size="sm" />
      </div>

      <div className="flex items-center gap-3">
        
        
        {user && (
          <div className="flex items-center gap-3 border-l pl-3 ml-1">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold leading-none">{user.prenom} {user.nom}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{user.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 ring-2 ring-indigo-50">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};