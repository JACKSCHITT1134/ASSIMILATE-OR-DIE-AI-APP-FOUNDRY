import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";
import ChatPage from "@/pages/ChatPage";
import Dashboard from "@/pages/Dashboard";
import BuyoutCenter from "@/pages/BuyoutCenter";
import LegalPage from "@/pages/LegalPage";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/AuthPage";
import PricingPage from "@/pages/PricingPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminPage from "@/pages/AdminPage";
import Navbar from "@/components/layout/Navbar";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-background grid-bg flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/command" element={<ChatPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/buyout" element={<BuyoutCenter />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(220,20%,9%)",
              border: "1px solid hsl(220,20%,18%)",
              color: "hsl(210,40%,96%)",
              fontFamily: "Space Grotesk, sans-serif",
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
