import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Settings, BarChart3, MessageSquare, Copy, Mail, MapPin, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Extend User type to include phone_number
interface ExtendedUser {
  id: string;
  email?: string;
  phone_number?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  copyNumber: () => void;
}

export const Dashboard = ({ activeTab, setActiveTab, copyNumber }: DashboardProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<string>('');
  const [loadingPhoneNumber, setLoadingPhoneNumber] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch user's assigned phone number
  useEffect(() => {
    const fetchUserPhoneNumber = async () => {
      if (!user?.id) return;
      
      setLoadingPhoneNumber(true);
      try {
        const response = await fetch(`/api/auth/phone/${user.id}`);
        const data = await response.json();
        
        if (data.success && data.phone_number) {
          setAssignedPhoneNumber(data.phone_number);
        } else {
          // If no phone number assigned, try to assign one
          const onboardResponse = await fetch('/api/auth/onboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user.id
            }),
          });
          
          const onboardData = await onboardResponse.json();
          if (onboardData.success && onboardData.phone_number) {
            setAssignedPhoneNumber(onboardData.phone_number);
          }
        }
      } catch (error) {
        console.error('Failed to fetch phone number:', error);
      } finally {
        setLoadingPhoneNumber(false);
      }
    };

    fetchUserPhoneNumber();
  }, [user?.id]);

  const handleCopyNumber = () => {
    const phoneNumber = assignedPhoneNumber || '+1 (555) 123-4567';
    navigator.clipboard.writeText(phoneNumber);
    toast({
      title: "Number copied!",
      description: "Your CallGenie number has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 lg:px-6 h-16 flex items-center shadow-sm">
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
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!</h1>
          <p className="text-gray-600">Manage your AI phone assistant and view call analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your CallGenie Number</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingPhoneNumber ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      assignedPhoneNumber || '+1 (555) 123-4567'
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopyNumber} 
                    className="mt-2"
                    disabled={loadingPhoneNumber}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Number
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Calls Today</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Response Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">Excellent performance</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest call interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appointment scheduled with John Doe</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customer inquiry handled</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Follow-up call completed</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Call History</CardTitle>
                <CardDescription>View and manage your recent calls</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Call history will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Detailed insights about your call performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Analytics dashboard will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your CallGenie preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Settings panel will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-md">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CallGenie
                </span>
                <div className="text-xs text-gray-500 -mt-1">AI Phone Assistant</div>
              </div>
            </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>riturajsuryawanshi51@gmail.com</span>
              </div>
              <a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 text-center">
            <p className="text-xs text-gray-500">
              © 2024 CallGenie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
