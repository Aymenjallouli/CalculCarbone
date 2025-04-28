import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";

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
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Le fichier doit être au format CSV");
        setFile(null);
        setSuccess(false);
      } else {
        setFile(selectedFile);
        setError(null);
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

  // Parse CSV function with support for quoted fields and escaped quotes
  const parseCSV = (text: string): any[] => {
    // Split by new line
    const lines = text.split(/\r\n|\n/);
    
    // Handle tabulation-separated values (TSV)
    const delimiter = text.includes('\t') ? '\t' : ',';
    
    // Get headers from first line
    const headers = lines[0].split(delimiter).map(h => h.trim());

    const result: any[] = [];

    // Process data lines (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(delimiter);
      
      // Create object from headers and values
      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j] ? values[j].trim() : '';
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
          Téléchargez votre fichier CSV contenant les données de transport collectées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input 
            type="file" 
            accept=".csv" 
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
            <p>Taille: <span className="font-medium">{(file.size / 1024).toFixed(2)} KB</span></p>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          <p className="font-semibold">Format attendu :</p>
          <p>Le fichier CSV doit contenir les colonnes pour les informations de transport telles que :</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li>Identifiant et information personnelle</li>
            <li>Résidence principale</li>
            <li>Distances et fréquences des trajets</li>
            <li>Moyens de transport utilisés (km parcourus)</li>
            <li>Type de carburant et consommations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}