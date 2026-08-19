import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, Upload, CheckCircle2,
  Loader2, AlertCircle, X, Table2, Info,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/api/userService";

// ── Colonnes requises ──────────────────────────────────────────────────────
const COLONNES = [
  { label: "Nom",           color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Prénom",        color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Email",         color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { label: "Matricule",     color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { label: "Téléphone",     color: "bg-violet-50 text-violet-700 border-violet-100" },
  { label: "Rôle",          color: "bg-violet-50 text-violet-700 border-violet-100" },
  { label: "Date Embauche", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { label: "Département",   color: "bg-purple-50 text-purple-700 border-purple-100" },
];

const ExcelImportPage = () => {
  const [file, setFile]           = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error("Format invalide — seuls les fichiers .xlsx et .xls sont acceptés");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };

  const handleRemoveFile = () => {
    setFile(null); setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Choisissez d'abord un fichier");
    setLoading(true);
    try {
      const msg = await userService.importExcel(file);
      setResult(msg);
      toast.success("Importation réussie !");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'importation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Excel</h1>
        <p className="text-sm text-slate-400 mt-1">
          Ajoutez massivement des collaborateurs à partir d'un fichier Excel standardisé
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Zone d'upload (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border-slate-100 shadow-sm">

            {/* Zone drag & drop */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? "border-blue-400 bg-blue-50/60 scale-[1.01]"
                  : file
                  ? "border-emerald-300 bg-emerald-50/30"
                  : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/20"
              } ${loading ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => !loading && inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Icône centrale */}
              <div className={`h-16 w-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-colors ${
                file ? "bg-emerald-100" : isDragging ? "bg-blue-100" : "bg-slate-100"
              }`}>
                <FileSpreadsheet className={`h-8 w-8 transition-colors ${
                  file ? "text-emerald-500" : isDragging ? "text-blue-500" : "text-slate-400"
                }`} />
              </div>

              {file ? (
                <div className="space-y-2">
                  <p className="font-bold text-emerald-700 text-lg">{file.name}</p>
                  <p className="text-sm text-emerald-600">
                    {(file.size / 1024).toFixed(1)} Ko · Fichier prêt à être importé
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                    className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 mt-2 transition-colors font-medium"
                  >
                    <X className="h-3.5 w-3.5" /> Retirer le fichier
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-slate-700 text-base">
                    {isDragging ? "Relâchez pour importer" : "Glissez votre fichier ici"}
                  </p>
                  <p className="text-sm text-slate-400">ou cliquez pour parcourir vos fichiers</p>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">
                    .xlsx · .xls uniquement
                  </p>
                </div>
              )}
            </div>

            <input
              ref={inputRef} type="file" accept=".xlsx, .xls"
              onChange={handleFileChange} className="hidden" disabled={loading}
            />

            {/* Bouton import */}
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-slate-400">
                {file
                  ? `Fichier sélectionné : ${file.name}`
                  : "Aucun fichier sélectionné"}
              </p>
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-blue-600 hover:bg-blue-700 h-11 px-8 shadow-sm shadow-blue-100"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importation...</>
                  : <><Upload className="h-4 w-4 mr-2" />Lancer l'importation</>}
              </Button>
            </div>

            {/* Résultat succès */}
            {result && (
              <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Importation terminée avec succès</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{result}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Panneau latéral (1/3) ── */}
        <div className="space-y-4">

          {/* Colonnes requises */}
          <Card className="p-5 border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Table2 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">Colonnes requises</p>
            </div>
            <p className="text-xs text-slate-400 mb-3">Dans cet ordre exact, en commençant par la colonne A :</p>
            <div className="flex flex-wrap gap-2">
              {COLONNES.map((c, i) => (
                <span key={i}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${c.color}`}>
                  {i + 1}. {c.label}
                </span>
              ))}
            </div>
          </Card>

          {/* Règles */}
          <Card className="p-5 border-amber-100 bg-amber-50/40 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">Règles d'importation</p>
            </div>
            <ul className="space-y-2">
              {[
                "Les emails déjà existants seront ignorés (pas de doublon)",
                "La première ligne doit être l'en-tête des colonnes",
                "Le département doit correspondre exactement à un département existant",
                "Les rôles valides : employe, manager, chef_equipe, DRH",
              ].map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportPage;