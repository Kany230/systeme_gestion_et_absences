import { Moon, Sun, LogOut, Menu } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/Logo";

export const Navbar = ({ onMenu }: { onMenu?: () => void }) => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 gap-3">
      {onMenu && (
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <Logo to={user ? "/dashboard" : "/"} size="sm" />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
        {user && (
          <>
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user.nom} {user.prenom}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
