
import { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { SplineDemo } from '@/components/demo';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast({
      title: "Welcome to CallGenie!",
      description: "You've successfully logged in with Google.",
    });
  };

  const copyNumber = () => {
    navigator.clipboard.writeText('+1 (555) 123-4567');
    toast({
      title: "Number copied!",
      description: "Your CallGenie number has been copied to clipboard.",
    });
  };

  if (isLoggedIn) {
    return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} copyNumber={copyNumber} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="flex-1">
        <LandingPage onLogin={handleLogin} />
        
        {/* Interactive 3D Demo Section */}
        <section className="px-4 lg:px-6 py-16 bg-gradient-to-br from-violet-50 to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Experience the Future</h2>
              <p className="text-xl text-gray-600">Interact with our AI-powered interface</p>
            </div>
            <SplineDemo />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
