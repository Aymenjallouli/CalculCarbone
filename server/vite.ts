import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ['localhost'],
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Liste des chemins possibles pour trouver les fichiers statiques
  const possiblePaths = [
    path.resolve(import.meta.dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
  ];
  
  // Trouver le premier chemin qui existe
  let distPath = null;
  for (const pathToCheck of possiblePaths) {
    if (fs.existsSync(pathToCheck)) {
      distPath = pathToCheck;
      log(`Utilisation du répertoire statique: ${distPath}`, "static");
      break;
    }
  }
  
  // Si aucun chemin n'existe, lancer une erreur
  if (!distPath) {
    log(`ERREUR: Impossible de trouver le répertoire de build. Chemins vérifiés: ${possiblePaths.join(", ")}`, "static");
    throw new Error(
      `Could not find the build directory. Checked: ${possiblePaths.join(", ")}`
    );
  }

  // Lister le contenu du répertoire pour le débogage
  try {
    const files = fs.readdirSync(distPath);
    log(`Contenu du répertoire statique (${distPath}): ${files.join(", ")}`, "static");
    
    // Vérifier si le répertoire assets existe
    const assetsPath = path.join(distPath, "assets");
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      log(`Contenu du répertoire assets: ${assetFiles.join(", ")}`, "static");
    } else {
      log(`Le répertoire assets n'existe pas dans ${distPath}`, "static");
    }
  } catch (err) {
    log(`Erreur lors de la lecture du répertoire: ${err}`, "static");
  }

  // Servir les fichiers statiques
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    log(`Serving index.html for path: ${req.originalUrl}`, "static");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
