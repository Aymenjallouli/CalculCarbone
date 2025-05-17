import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">
            Calculateur d'
            <span className="eco-gradient-text">Empreinte Carbone</span> Scolaire
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mesurez l'impact environnemental de votre établissement scolaire et
            identifiez des opportunités pour réduire votre empreinte carbone.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <Card className="flex-1">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-primary">
                Pourquoi mesurer votre empreinte carbone ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  Les établissements scolaires ont un rôle essentiel à jouer dans
                  la transition écologique. Comprendre votre impact
                  environnemental est la première étape pour le réduire.
                </p>
                <p>
                  Ce calculateur vous aide à quantifier les émissions de CO₂
                  liées à vos activités scolaires, notamment les matériels
                  pédagogiques et les transports.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-secondary">
                Comment utiliser cet outil ?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  <strong>1.</strong> Commencez par saisir les quantités de
                  marchandises utilisées dans votre établissement.
                </p>
                <p>
                  <strong>2.</strong> Renseignez ensuite les différents modes de
                  transport utilisés par les élèves et le personnel.
                </p>
                <p>
                  <strong>3.</strong> Saisissez les informations concernant la
                  restauration dans votre établissement.
                </p>
                <p>
                  <strong>4.</strong> Obtenez une analyse détaillée de votre
                  empreinte carbone avec des graphiques explicatifs.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-primary mb-4"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <CardTitle>Marchandises</CardTitle>
              <CardDescription>
                Calculez l'impact des fournitures scolaires, livres, et
                équipements.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/merchandise">
                <Button className="w-full">Commencer</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-secondary mb-4"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
              <CardTitle>Transport</CardTitle>
              <CardDescription>
                Évaluez l'impact des déplacements domicile-école et des sorties
                scolaires.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/transport">
                <Button className="w-full">Commencer</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-green-600 mb-4"
              >
                <path d="M7 19a2 2 0 0 1-2-2" />
                <path d="M17 19a2 2 0 0 0 2-2" />
                <path d="M3 12h18" />
                <path d="M2 8h20" />
                <path d="M5 4h14c.6 0 1 .4 1 1v14c0 .6-.4 1-1 1H5c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1Z" />
                <path d="m10 12 5 3-5 3v-6Z" />
              </svg>
              <CardTitle>Restauration</CardTitle>
              <CardDescription>
                Calculez l'impact de l'alimentation et des déchets alimentaires.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/restauration">
                <Button className="w-full">Commencer</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-purple-600 mb-4"
              >
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
              <CardTitle>Événements</CardTitle>
              <CardDescription>
                Évaluez l'impact des événements scolaires et des manifestations.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/event">
                <Button className="w-full">Commencer</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-blue-600 mb-4"
              >
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <circle cx="12" cy="8" r="2" />
                <path d="M12 19a7 7 0 1 0 0-14v16" />
              </svg>
              <CardTitle>Voyages d'étude</CardTitle>
              <CardDescription>
                Mesurez l'impact des voyages scolaires et des excursions.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/study-trip">
                <Button className="w-full">Commencer</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12 text-accent mb-4"
              >
                <path d="M12 2v20M2 12h20M7 17l-5-5 5-5M17 7l5 5-5 5" />
              </svg>
              <CardTitle>Résultats</CardTitle>
              <CardDescription>
                Visualisez votre empreinte carbone et identifiez des actions
                pour la réduire.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/results">
                <Button className="w-full">Voir résultats</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">L'impact environnemental des écoles</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl mx-auto">
            Les établissements scolaires représentent une part importante de notre
            empreinte carbone collective. Découvrez comment agir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">Saviez-vous que...</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Un élève utilise en moyenne 70 à 100 kg de papier par an.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Les transports scolaires représentent jusqu'à 20% de l'empreinte carbone d'un établissement.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                La production d'un ordinateur émet environ 300 kg de CO₂.
              </li>
            </ul>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-secondary">Actions concrètes</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-secondary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Instaurer une politique de réduction du papier et favoriser le numérique responsable.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-secondary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Encourager le covoiturage et les modes de transport doux.
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-secondary mr-2 mt-0.5"
                >
                  <path d="m9 12 2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Prolonger la durée de vie des équipements informatiques et du mobilier.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-6">Prêt à calculer votre empreinte?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/merchandise">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Commencer avec les marchandises
            </Button>
          </Link>
          <Link href="/transport">
            <Button size="lg" variant="outline">
              Aller directement au transport
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
