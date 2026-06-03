export interface CompteursConges {
  id: number;
  soldeAn: number;         
  soldePermission: number;  
  dateEnCours: string;      
  historiqueConge?: HistoriqueConge[]; 
}
export interface HistoriqueConge {
  id: number;
  ancienSolde: number;
  newSolde: number;
  dateModification: string;
  motif: string; 
}