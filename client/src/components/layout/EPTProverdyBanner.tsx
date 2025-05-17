import React from 'react';
import { Building2, Leaf } from 'lucide-react';

/**
 * Composant de bannière affichant que l'application est une collaboration entre l'EPT et Proverdy.
 */
export function EPTProverdyBanner() {
  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-md text-sm text-gray-800">
      <Building2 className="h-4 w-4" aria-hidden="true" />
      <span>
        Calculateur d'empreinte carbone développé par <strong>l'École Polytechnique de Tunisie</strong> en
        collaboration avec <strong>Proverdy</strong>
      </span>
      <Leaf className="h-4 w-4 text-green-600" aria-hidden="true" />
    </div>
  );
}
