import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeCtx { theme: Theme; toggle: () => void; }
const Ctx = createContext<ThemeCtx | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return <Ctx.Provider value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("ThemeProvider missing");
  return c;
};
