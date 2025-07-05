
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageSquare, Brain, Shield } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage = ({ onLogin }: LandingPageProps) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white shadow-sm">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CallGenie
              </span>
              <div className="text-xs text-gray-500 -mt-1">AI Phone Assistant</div>
            </div>
          </div>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" onClick={onLogin}>
            Sign In
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Your AI-Powered Phone Assistant
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                CallGenie handles your calls with intelligent AI responses, appointment scheduling, and seamless integration with your workflow.
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg" onClick={onLogin}>
                Get Started with Google
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose CallGenie?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of phone communication with our advanced AI technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Smart AI Responses</CardTitle>
                <CardDescription>
                  Advanced AI understands context and responds naturally to callers
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Call Management</CardTitle>
                <CardDescription>
                  Efficiently handle multiple calls with intelligent routing and responses
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
