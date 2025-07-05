
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Settings, BarChart3, MessageSquare, Copy } from 'lucide-react';

interface DashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  copyNumber: () => void;
}

export const Dashboard = ({ activeTab, setActiveTab, copyNumber }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 lg:px-6 h-14 flex items-center">
        <div className="flex items-center justify-center">
          <Phone className="h-6 w-6 text-indigo-600" />
          <span className="ml-2 text-xl font-bold">CallGenie</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost">
            Profile
          </Button>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CallGenie</h1>
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
                  <div className="text-2xl font-bold">+1 (555) 123-4567</div>
                  <Button size="sm" variant="outline" onClick={copyNumber} className="mt-2">
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
    </div>
  );
};
