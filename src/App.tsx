import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import ChatPage from "@/pages/ChatPage";
import Dashboard from "@/pages/Dashboard";
import BuyoutCenter from "@/pages/BuyoutCenter";
import LegalPage from "@/pages/LegalPage";
import NotFound from "@/pages/NotFound";
import Navbar from "@/components/layout/Navbar";

export default function App() {
  return (
    <BrowserRouter>
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
    </BrowserRouter>
  );
}
