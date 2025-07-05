import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageSquare, Brain, Shield, Mail, MapPin, LogIn, ChevronRight, User, LogOut } from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useAuth } from '@/contexts/AuthContext';
import { SplineSceneBasic } from './SplineSceneBasic';
import { PricingDemo } from './PricingDemo';
import { useState, useEffect, useRef } from 'react';
import { FcGoogle } from "react-icons/fc";

export const LandingPage = () => {
  const { signInWithGoogle, loading, user, signOut } = useAuth();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowAuthDropdown(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 mx-auto">
          <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            Pricing
          </a>
          <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            About
          </a>
          <a href="#contact" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
            Contact
          </a>
        </nav>

        {/* Sign In Button */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <Button 
                variant="ghost" 
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.email?.split('@')[0] || 'User'}</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showAuthDropdown ? 'rotate-90' : ''}`} />
              </Button>
              
              {showAuthDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500">Signed in</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              
              {showAuthDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">Welcome to CallGenie</h3>
                      <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
                    </div>
                    
                    <div className="space-y-3">
                      <GoogleSignInButton 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        <FcGoogle className="h-4 w-4 mr-2" />
                        Continue with Google
                      </GoogleSignInButton>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          // Navigate to login page or open login modal
                          window.location.href = '/login';
                        }}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in with Email
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-gray-600">
                      <span>Don't have an account? </span>
                      <a href="/signup" className="text-indigo-600 hover:underline font-medium">
                        Sign up
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content - This will expand to fill available space */}
      <main className="flex-1 flex flex-col">
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
                <GoogleSignInButton size="lg">
                  Get Started with Google
                </GoogleSignInButton>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Experience the Future Section - Now at the top */}
        <section className="w-full py-16 bg-gradient-to-br from-violet-50 to-indigo-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Experience the Future</h2>
              <p className="text-xl text-gray-600">Interact with our AI-powered interface</p>
            </div>
            <SplineSceneBasic />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 bg-gray-50">
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

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-16">
          <PricingDemo />
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">About CallGenie</h2>
                <p className="text-gray-600 mb-6">
                  CallGenie was born from the vision of revolutionizing how businesses handle phone communications. 
                  We understand that every call is an opportunity to build relationships and drive growth.
                </p>
                <p className="text-gray-600 mb-6">
                  Our AI-powered platform combines cutting-edge natural language processing with intelligent 
                  workflow automation to ensure no call goes unanswered and every interaction is meaningful.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">10K+</div>
                    <div className="text-sm text-gray-500">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">99.9%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-indigo-100">
                  To democratize AI-powered communication, making advanced phone automation accessible 
                  to businesses of all sizes while maintaining the human touch that customers expect.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ready to transform your phone communications? Let's talk about how CallGenie can help your business.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-gray-600">support@callgenie.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-gray-600">San Francisco, CA</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-gray-600">+1 (555) 123-4567</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-6">Send us a Message</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Tell us about your needs..."
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - This will stay at the bottom */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    CallGenie
                  </span>
                  <div className="text-xs text-gray-400 -mt-1">AI Phone Assistant</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Revolutionizing phone communication with intelligent AI responses and seamless automation.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@callgenie.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 CallGenie. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
