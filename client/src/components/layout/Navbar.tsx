import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, History, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Marchandises", path: "/merchandise" },
    { name: "Transport", path: "/transport" },
    { name: "Restauration", path: "/restauration" },
    { name: "Événements", path: "/event" },
    { name: "Voyages d'étude", path: "/study-trip" },
    { name: "Résultats", path: "/results" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M2 22v-1a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v1" />
              <path d="M7 10l5-6 5 6" />
              <path d="M12 4v16" />
            </svg>
            <span className="hidden font-bold sm:inline-block">
              Calculateur Carbone Scolaire
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-4 py-2 text-sm font-medium transition-colors
                ${location === link.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Auth buttons */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <User className="mr-2 h-4 w-4" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/history">
                  <DropdownMenuItem className="cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    Historique
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile navigation */}
        <div className="flex flex-1 items-center justify-end md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 pt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`group flex w-full items-center rounded-md px-3 py-2 text-base font-medium
                      ${location === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile auth links */}
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <>
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        Connecté en tant que <strong>{user.username}</strong>
                      </p>
                      <Link
                        href="/history"
                        className="group flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                      >
                        <History className="mr-2 h-5 w-5" />
                        Historique des calculs
                      </Link>
                      <button
                        onClick={() => logoutMutation.mutate()}
                        className="group flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/5"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth"
                      className="group flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-primary/5"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Se connecter / S'inscrire
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
