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
        `src="./src/main.tsx"`,
        `src="./src/main.tsx?v=${nanoid()}"`,
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
  // En production, on a besoin de servir les fichiers générés par Vite
  const staticPaths = [
    path.resolve(process.cwd(), "dist"), // Fichiers générés par Vite (index.html, assets/*)
    path.resolve(process.cwd(), "dist", "public") // Fichiers supplémentaires (modele_transport.csv)
  ];
  
  // Journalisation des chemins
  log(`Chemins statiques configurés: ${staticPaths.join(", ")}`, "static");
  
  // Vérification des répertoires
  staticPaths.forEach((staticPath) => {
    if (fs.existsSync(staticPath)) {
      log(`Le répertoire statique existe: ${staticPath}`, "static");
      try {
        const files = fs.readdirSync(staticPath);
        log(`Contenu de ${staticPath}: ${files.join(", ")}`, "static");
      } catch (err) {
        log(`Erreur lors de la lecture du répertoire ${staticPath}: ${err}`, "static");
      }
    } else {
      log(`Le répertoire statique n'existe pas: ${staticPath}`, "static");
    }
  });

  // Servir les fichiers statiques depuis tous les chemins configurés
  staticPaths.forEach((staticPath) => {
    if (fs.existsSync(staticPath)) {
      app.use(express.static(staticPath));
      log(`Serving static files from: ${staticPath}`, "static");
    }
  });

  // Fallback to index.html
  app.use("*", (req, res) => {
    const indexPath = path.resolve(process.cwd(), "dist", "index.html");
    log(`Serving index.html for path: ${req.originalUrl} from ${indexPath}`, "static");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      log(`ERREUR: index.html introuvable à ${indexPath}`, "static");
      res.status(404).send("index.html not found");
    }
  });
}
