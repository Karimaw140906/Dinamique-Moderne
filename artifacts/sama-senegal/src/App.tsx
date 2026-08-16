import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { UrgenceButton } from "@/components/UrgenceButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { CurrencyProvider } from "@/lib/currency";
import { BookingProvider } from "@/context/BookingContext";
import { SimulatorProvider } from "@/lib/simulator";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import Simulateur from "@/pages/Simulateur";
import Hebergements from "@/pages/Hebergements";
import Activites from "@/pages/Activites";
import RestaurantsPage from "@/pages/RestaurantsPage";
import TransportPage from "@/pages/TransportPage";
import Evenements from "@/pages/Evenements";
import APropos from "@/pages/APropos";
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
import DestinationFiche from "@/pages/services/DestinationFiche";
import EventFiche from "@/pages/services/EventFiche";
import DefinePassword from "@/pages/DefinePassword";
import PrestataireDashboard from "@/pages/prestataire/Dashboard";
import DG from "@/pages/DG";
import PaiementSucces from "@/pages/PaiementSucces";
import PaiementAnnule from "@/pages/PaiementAnnule";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <Switch>
      {/* Page principale */}
      <Route path="/" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/simulateur" component={Simulateur} />
      <Route path="/hebergements" component={Hebergements} />
      <Route path="/activites" component={Activites} />
      <Route path="/restaurants" component={RestaurantsPage} />
      <Route path="/transport" component={TransportPage} />
      <Route path="/evenements" component={Evenements} />
      <Route path="/a-propos" component={APropos} />

      {/* Espace client — protege : client uniquement */}
      <Route path="/mon-espace">
        <ProtectedRoute allow={["client"]}><MonEspace /></ProtectedRoute>
      </Route>
      <Route path="/mon-espace/reservations">
        <ProtectedRoute allow={["client"]}><Reservations /></ProtectedRoute>
      </Route>
      <Route path="/mon-espace/paiements">
        <ProtectedRoute allow={["client"]}><Paiements /></ProtectedRoute>
      </Route>
      <Route path="/mon-espace/messages">
        <ProtectedRoute allow={["client"]}><Messages /></ProtectedRoute>
      </Route>
      <Route path="/mon-espace/profil">
        <ProtectedRoute allow={["client"]}><Profil /></ProtectedRoute>
      </Route>
      <Route path="/mon-espace/fidelite">
        <ProtectedRoute allow={["client"]}><Fidelite /></ProtectedRoute>
      </Route>

      {/* Recherche */}
      <Route path="/recherche" component={Recherche} />

      {/* Fiches services */}
      <Route path="/hotels/:id" component={HotelFiche} />
      <Route path="/restaurants/:id" component={RestaurantFiche} />
      <Route path="/activites/:id" component={ActiviteFiche} />
      <Route path="/transport/:id" component={TransportFiche} />
      <Route path="/tours/:id" component={TourFiche} />
      <Route path="/destinations/:id" component={DestinationFiche} />
      <Route path="/evenements/:id" component={EventFiche} />
      <Route path="/definir-mot-de-passe" component={DefinePassword} />

      {/* Espace prestataire — protege : staff ou superadmin */}
      {/* Espace DG — protege : dg ou superadmin */}
      <Route path="/dg">
        <ProtectedRoute allow={["dg"]}><DG /></ProtectedRoute>
      </Route>

      <Route path="/prestataire/dashboard">
        <ProtectedRoute allow={["staff", "superadmin"]}><PrestataireDashboard /></ProtectedRoute>
      </Route>

      <Route path="/paiement-succes" component={PaiementSucces} />
      <Route path="/paiement-annule" component={PaiementAnnule} />

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
            <BookingProvider>
            <SimulatorProvider>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                  <AppRouter />
                </WouterRouter>
                <Toaster />
                <UrgenceButton />
              </TooltipProvider>
            </SimulatorProvider>
            </BookingProvider>
          </CurrencyProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
