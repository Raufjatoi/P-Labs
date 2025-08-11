import { Navbar } from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ModelBuilder from "@/components/ModelBuilder";
import StreamlitPro from "@/components/StreamlitPro";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { PricingSection } from "@/components/pricing/PricingSection";
import { AdminPanel } from "@/components/admin/AdminPanel";
import Footer from "@/components/Footer";
import TeamSection from "@/components/TeamSection";
import TestCardSection from "@/components/TestCardSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ModelBuilder />
      <StreamlitPro />
      <UserDashboard />
      <PricingSection />
      <TestCardSection/>
      <AdminPanel />
      <TeamSection />
      <Footer />
    </div>
  );
};

export default Index;
