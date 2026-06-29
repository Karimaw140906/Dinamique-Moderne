import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/lib/currency";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MonEspace from "@/pages/client/MonEspace";
import Reservations from "@/pages/client/Reservations";
import Paiements from "@/pages/client/Paiements";
import Messages from "@/pages/client/Messages";
import Profil from "@/pages/client/Profil";
import Fidelite from "@/pages/client/Fidelite";
import Recherche from "@/pages/Recherche";
import HotelFiche from "@/pages/services/HotelFiche";
import RestaurantFiche from "@/pages/services/RestaurantFiche";
import ActiviteFiche from "@/pages/services/ActiviteFiche";
import TransportFiche from "@/pages/services/TransportFiche";
import TourFiche from "@/pages/services/TourFiche";
import PrestataireDashboard from "@/pages/prestataire/Dashboard";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      {/* Page principale */}
      <Route path="/" component={Home} />

      {/* Espace client */}
      <Route path="/mon-espace" component={MonEspace} />
      <Route path="/mon-espace/reservations" component={Reservations} />
      <Route path="/mon-espace/paiements" component={Paiements} />
      <Route path="/mon-espace/messages" component={Messages} />
      <Route path="/mon-espace/profil" component={Profil} />
      <Route path="/mon-espace/fidelite" component={Fidelite} />

      {/* Recherche */}
      <Route path="/recherche" component={Recherche} />

      {/* Fiches services */}
      <Route path="/hotels/:id" component={HotelFiche} />
      <Route path="/restaurants/:id" component={RestaurantFiche} />
      <Route path="/activites/:id" component={ActiviteFiche} />
      <Route path="/transport/:id" component={TransportFiche} />
      <Route path="/tours/:id" component={TourFiche} />

      {/* Espace prestataire */}
      <Route path="/prestataire/dashboard" component={PrestataireDashboard} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                <AppRouter />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </CurrencyProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
