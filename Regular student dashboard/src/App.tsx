import { useState } from "react";
import Header from "./components/Header";
import UpcomingClassPage from "./components/UpcomingClassPage";
import DashboardPage from "./components/DashboardPage";
import SettingsPage from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("dashboard"); // Default to dashboard since we reordered it

  const renderPage = () => {
    switch (currentPage) {
      case "upcoming":
        return <UpcomingClassPage />;
      case "dashboard":
        return <DashboardPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <Toaster position="top-center" dir="rtl" />
      
      <main className="pt-20 md:pt-24">
        {renderPage()}
      </main>
    </div>
  );
}
