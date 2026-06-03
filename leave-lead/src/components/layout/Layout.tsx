import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
