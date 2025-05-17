import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { findColumn, parseNumericValue } from "@/lib/csvUtils";

interface CSVUploaderProps {
  onDataReceived: (data: any[]) => void;
  isLoading?: boolean;
}

export function CSVUploader({ onDataReceived, isLoading = false }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Vérifier les extensions de fichiers autorisées (CSV et Excel)
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(fileExt) || 
          selectedFile.type === "text/csv" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          selectedFile.type === "application/vnd.ms-excel") {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      } else {
        setError("Le fichier doit être au format CSV ou Excel (.csv, .xlsx, .xls)");
        setFile(null);
        setSuccess(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV");
      return;
    }

    try {
      // Reset states
      setError(null);
      setSuccess(false);

      // Read file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const rows = parseCSV(csv);
          onDataReceived(rows);
          setSuccess(true);
        } catch (err) {
          setError("Erreur lors de l'analyse du fichier CSV. Vérifiez le format.");
          console.error("CSV parsing error:", err);
        }
      };

      reader.onerror = () => {
        setError("Erreur lors de la lecture du fichier");
      };

      reader.readAsText(file);
    } catch (err) {
      setError("Une erreur est survenue lors du traitement du fichier");
      console.error("File upload error:", err);
    }
  };

  // Parse CSV function with enhanced support for different column names and French numeric format
  const parseCSV = (text: string): any[] => {
    // Split by new line
    const lines = text.split(/\r\n|\n/);
    if (lines.length < 2) {
      throw new Error("Le fichier ne contient pas assez de lignes.");
    }
    
    // Handle tabulation-separated values (TSV) or semicolon-separated values (common in French Excel exports)
    let delimiter = ',';
    if (text.includes('\t')) {
      delimiter = '\t';
    } else if (text.includes(';')) {
      delimiter = ';';
    }
    
    // Get headers from first line
    const headers = lines[0].split(delimiter).map(h => h.trim());
    if (headers.length < 5) {
      // If too few headers, probably wrong delimiter
      throw new Error(`Format de fichier non reconnu. ${headers.length} colonnes détectées avec le délimiteur "${delimiter}".`);
    }

    console.log("Headers detected:", headers);
    
    const result: any[] = [];

    // Process data lines (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Split respecting quoted values
      let values: string[] = [];
      let inQuote = false;
      let currentValue = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
          inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      // If splitting didn't work properly, try simple split
      if (values.length !== headers.length) {
        values = line.split(delimiter);
      }
      
      // Create object from headers and values
      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j] ? values[j].trim().replace(/^"(.*)"$/, '$1') : '';
      }
      
      result.push(obj);
    }

    return result;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importation des données de transport</CardTitle>
        <CardDescription>
          Téléchargez votre fichier CSV ou Excel contenant les données de transport collectées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileChange}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                Chargement...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </span>
            )}
          </Button>
        </div>
        
       

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-300 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>
              Les données ont été importées avec succès
            </AlertDescription>
          </Alert>
        )}

        {file && (
          <div className="p-2 bg-slate-50 rounded-md text-sm text-slate-700">
            <p>Fichier sélectionné: <span className="font-medium">{file.name}</span></p>
            <p>Taille: <span className="font-medium">{(file.size / 1024).toFixed(2)} KB</span>
              {file.size > 5 * 1024 * 1024 && 
                <span className="text-orange-600 ml-2">(Attention: fichier volumineux)</span>
              }
            </p>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          <p className="font-semibold">Format accepté :</p>
          <p>Le fichier CSV ou Excel doit contenir les colonnes pour les informations de transport telles que :</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li>Identifiant et information personnelle</li>
            <li>Résidence principale</li>
            <li>Distances et fréquences des trajets</li>
            <li>Moyens de transport utilisés (km parcourus)</li>
            <li>Type de carburant et consommations</li>
          </ul>
          <p className="mt-2 text-amber-600 font-medium">Note: L'application cherchera à faire correspondre les noms de colonnes
          même si les intitulés ne sont pas exactement les mêmes que ceux attendus.</p>
        </div>
      </CardContent>
    </Card>
  );
}