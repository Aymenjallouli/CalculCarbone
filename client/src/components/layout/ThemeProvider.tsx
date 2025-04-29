import { useState, useEffect, createContext, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Vérifier si le thème est déjà enregistré dans localStorage, sinon utiliser 'light'
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Appliquer le thème au chargement et quand il change
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    
    // Enregistrer dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Bouton de changement de thème */}
      <button 
        className="theme-switch" 
        onClick={toggleTheme} 
        aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-gray-700" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-300" />
        )}
      </button>
      
      {/* Fond animé */}
      <div className="eco-background">
        <div className="eco-particles">
          <div className="eco-particle"></div>
          <div className="eco-particle"></div>
          <div className="eco-particle"></div>
          <div className="eco-particle"></div>
          <div className="eco-particle"></div>
        </div>
        <div className="eco-planet"></div>
      </div>
      
      {children}
    </ThemeContext.Provider>
  );
}