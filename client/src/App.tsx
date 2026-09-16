import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Audit from "./pages/Audit";
import { AboutPage, BookPage, ContactPage, HowItWorks, InsightsPage, PrivacyPage, SystemPage, TermsPage } from "./pages/Pages";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/how-it-works" component={HowItWorks} />
    <Route path="/system" component={SystemPage} />
    <Route path="/audit" component={Audit} />
    <Route path="/about" component={AboutPage} />
    <Route path="/insights" component={InsightsPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/book" component={BookPage} />
    <Route path="/privacy" component={PrivacyPage} />
    <Route path="/terms" component={TermsPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
