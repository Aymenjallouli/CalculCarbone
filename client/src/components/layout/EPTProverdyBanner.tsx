import React from 'react';
import { Building2, Leaf } from 'lucide-react';

/**
 * Composant de bannière affichant l'information que l'application de calcul d'empreinte carbone
 * est une collaboration entre l'École Polytechnique de Tunisie et l'entreprise Proverdy.
 */
export function EPTProverdyBanner() {
  return (
    <div className="ept-proverdy-banner flex items-center justify-center gap-2">
      <Building2 className="h-4 w-4" />
      <span>
        Calculateur d'empreinte carbone développé par <strong>l'École Polytechnique de Tunisie</strong> en 
        collaboration avec <strong>Proverdy</strong>
      </span>
      <Leaf className="h-4 w-4" />
    </div>
  );
}