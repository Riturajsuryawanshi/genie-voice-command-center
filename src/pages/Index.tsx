
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Star, CheckCircle, Users, Globe, Zap, ArrowRight, PlayCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <LandingPage onLogin={handleLogin} />
    </div>
  );
};

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <>
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            CallGenie
          </span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:text-indigo-600 transition-colors" href="#features">
            Features
          </a>
          <a className="text-sm font-medium hover:text-indigo-600 transition-colors" href="#pricing">
            Pricing
          </a>
          <Button onClick={onLogin} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
            Sign In with Google
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 lg:px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
            🎉 Now Available - AI Voice Assistant
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
            Call Your AI Assistant Anytime, Anywhere
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get your personal AI assistant phone number. Call to take notes, set reminders, ask questions, and get things done - all through natural voice conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onLogin} size="lg" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-lg px-8 py-3">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-indigo-200 hover:bg-indigo-50">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 lg:px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account with Google in seconds', icon: Users },
              { step: '02', title: 'Get Your Number', desc: 'Receive a personal AI assistant phone number', icon: Phone },
              { step: '03', title: 'Start Talking', desc: 'Call anytime to get help with tasks and questions', icon: Zap }
            ].map((item, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-sm font-semibold text-indigo-600 mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 lg:px-6 py-16 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Personalized', desc: 'AI learns your preferences and adapts to your communication style', icon: Users },
              { title: 'Real-time', desc: 'Instant responses and immediate task execution via voice commands', icon: Zap },
              { title: 'Multi-lingual', desc: 'Supports multiple languages for global accessibility', icon: Globe }
            ].map((feature, index) => (
              <Card key={index} className="p-6 border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300">
                <feature.icon className="h-12 w-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 lg:px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: '/month',
                features: ['30 minutes/month', 'Basic AI responses', 'Standard voice', 'Email support'],
                popular: false
              },
              {
                name: 'Pro',
                price: '₹299',
                period: '/month',
                features: ['300 minutes/month', 'Advanced AI responses', 'Voice customization', 'Smart reminders', 'Priority support'],
                popular: true
              },
              {
                name: 'Business',
                price: '₹999',
                period: '/month',
                features: ['1000 minutes/month', 'Enterprise AI features', 'CRM integration', 'Calendar sync', 'Dedicated support'],
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-6 relative ${plan.popular ? 'border-indigo-500 border-2 shadow-xl' : 'border-gray-200'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600">
                    Most Popular
                  </Badge>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-1">{plan.price}</div>
                  <div className="text-gray-500 mb-6">{plan.period}</div>
                  <Button 
                    onClick={onLogin}
                    className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    Get Started
                  </Button>
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 lg:px-6 py-16 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Loved by Users</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "CallGenie has transformed how I manage my daily tasks. I can set reminders and take notes while driving!",
                author: "Sarah Chen",
                role: "Product Manager"
              },
              {
                quote: "The AI assistant understands context perfectly. It's like having a personal secretary available 24/7.",
                author: "Michael Rodriguez",
                role: "Entrepreneur"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 lg:px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">CallGenie</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CallGenie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

const Dashboard = ({ activeTab, setActiveTab, copyNumber }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  copyNumber: () => void; 
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [voiceType, setVoiceType] = useState('female');

  const callLogs = [
    { id: 1, date: '2024-01-15', time: '2:30 PM', duration: '3:45', summary: 'Set reminder for team meeting tomorrow at 10 AM' },
    { id: 2, date: '2024-01-15', time: '11:20 AM', duration: '2:15', summary: 'Asked about weather forecast for the weekend' },
    { id: 3, date: '2024-01-14', time: '5:45 PM', duration: '1:30', summary: 'Quick note about grocery shopping list' },
    { id: 4, date: '2024-01-14', time: '9:15 AM', duration: '4:20', summary: 'Discussed project updates and deadlines' },
    { id: 5, date: '2024-01-13', time: '3:10 PM', duration: '2:50', summary: 'Set multiple reminders for client calls' }
  ];

  const reminders = [
    { id: 1, title: 'Team meeting with Sarah', time: '2024-01-16 10:00 AM', completed: false },
    { id: 2, title: 'Call client about project update', time: '2024-01-16 2:30 PM', completed: false },
    { id: 3, title: 'Pick up dry cleaning', time: '2024-01-16 6:00 PM', completed: true },
    { id: 4, title: 'Submit quarterly report', time: '2024-01-17 9:00 AM', completed: false }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50'}`}>
      {/* Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              CallGenie
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Zap },
              { id: 'calls', label: 'Call Logs', icon: Phone },
              { id: 'reminders', label: 'Reminders', icon: CheckCircle },
              { id: 'settings', label: 'Settings', icon: Users }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-indigo-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              
              {/* Phone Number Card */}
              <Card className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Your CallGenie Number</h2>
                    <div className="text-2xl font-bold">+1 (555) 123-4567</div>
                  </div>
                  <Button onClick={copyNumber} variant="secondary" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </Card>

              {/* Usage Stats */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Minutes Used</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>15 / 30 minutes</span>
                      <span>50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full" style={{width: '50%'}}></div>
                    </div>
                  </div>
                  <Button className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                    Upgrade Plan
                  </Button>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">Last call: Today, 2:30 PM</div>
                    <div className="text-sm text-gray-600">Total calls this month: 8</div>
                    <div className="text-sm text-gray-600">Active reminders: 3</div>
                  </div>
                </Card>
              </div>

              {/* Recent Calls */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Calls</h3>
                <div className="space-y-3">
                  {callLogs.slice(0, 5).map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{call.summary}</div>
                        <div className="text-xs text-gray-500">{call.date} at {call.time}</div>
                      </div>
                      <div className="text-sm text-gray-600">{call.duration}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
              <Card className="p-6">
                <div className="space-y-4">
                  {callLogs.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium">{call.summary}</div>
                        <div className="text-sm text-gray-500 mt-1">{call.date} at {call.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{call.duration}</div>
                        <div className="flex space-x-2 mt-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
                <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                  Add Reminder
                </Button>
              </div>
              <Card className="p-6">
                <div className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className={`flex items-center justify-between p-4 border rounded-lg ${reminder.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${reminder.completed ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                          <div className={`font-medium ${reminder.completed ? 'line-through text-gray-500' : ''}`}>
                            {reminder.title}
                          </div>
                          <div className="text-sm text-gray-500">{reminder.time}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              
              <div className="grid gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Assistant Voice</label>
                      <div className="flex space-x-2">
                        <Button 
                          variant={voiceType === 'male' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVoiceType('male')}
                        >
                          Male
                        </Button>
                        <Button 
                          variant={voiceType === 'female' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setVoiceType('female')}
                        >
                          Female
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Dark Mode</label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDarkMode(!darkMode)}
                    >
                      {darkMode ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Plan</span>
                      <span className="text-sm font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Minutes Used</span>
                      <span className="text-sm font-medium">15 / 30</span>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                      Upgrade to Pro
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
