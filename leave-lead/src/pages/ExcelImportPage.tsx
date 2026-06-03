import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/api/userService";

const ExcelImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ✅ CORRIGÉ : ref sur l'input pour le déclencher proprement
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (selectedFile: File) => {
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  // ✅ AJOUTÉ : gestion drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Choisissez d'abord un fichier");

    setLoading(true);
    try {
      const responseMessage = await userService.importExcel(file);
      setResult(responseMessage);
      toast.success("Importation réussie !");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'importation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Excel"
        description="Ajoutez massivement des collaborateurs à partir d'un fichier Excel standardisé."
      />

      <Card className="p-8 max-w-2xl border-none shadow-md">

        {/* ✅ CORRIGÉ : zone de drop avec position relative isolée,
            input déclenché via ref et non via position absolute */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
            ${isDragging
              ? "border-blue-400 bg-blue-50/60 scale-[1.01]"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
            }`}
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Icône */}
          <FileSpreadsheet
            className={`h-16 w-16 mx-auto mb-4 transition-colors
              ${file ? "text-emerald-500" : isDragging ? "text-blue-500" : "text-slate-300"}`}
          />

          {/* Texte */}
          {file ? (
            <div className="space-y-2">
              <p className="font-semibold text-emerald-700">{file.name}</p>
              <p className="text-xs text-emerald-600">
                {(file.size / 1024).toFixed(1)} Ko — Prêt à être importé
              </p>
              {/* ✅ AJOUTÉ : bouton de retrait du fichier */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // ne pas rouvrir le file picker
                  handleRemoveFile();
                }}
                className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1 transition-colors"
              >
                <X className="h-3 w-3" /> Retirer le fichier
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-slate-700">
                {isDragging
                  ? "Relâchez pour importer"
                  : "Cliquez pour parcourir ou glissez un fichier"}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Format requis : .xlsx / .xls (Excel)
              </p>
            </div>
          )}
        </div>

        {/* ✅ CORRIGÉ : input caché, déclenché via ref */}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />

        <div className="mt-8 space-y-4">
          {/* Avertissement colonnes */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p>
                <b>Colonnes requises dans l'ordre :</b>
              </p>
              <p className="font-mono bg-amber-100 px-2 py-1 rounded text-amber-900 tracking-wide">
                Nom · Prénom · Email · Matricule · Téléphone · Rôle · Date Embauche · Département
              </p>
              <p className="text-amber-600 italic">
                Les utilisateurs avec un email déjà existant seront ignorés.
              </p>
            </div>
          </div>

          {/* Bouton import */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-blue-600 hover:bg-blue-700 h-11 px-8 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {loading ? "Importation en cours..." : "Lancer l'importation"}
            </Button>
          </div>
        </div>

        {/* Résultat succès */}
        {result && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Importation terminée</p>
              <p className="text-xs opacity-90 mt-0.5">{result}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExcelImportPage;