import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode; // Pour tes boutons passés en prop
  children?: ReactNode; // Pour le contenu mis entre les balises
}

export const PageHeader = ({ title, description, actions, children }: PageHeaderProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description && <p className="text-slate-500 text-sm md:text-base">{description}</p>}
    </div>
    
    {/* On affiche soit 'actions' s'il existe, soit 'children' s'il y a du contenu interne */}
    {(actions || children) && (
      <div className="flex items-center gap-3">
        {actions}
        {children}
      </div>
    )}
  </div>
);