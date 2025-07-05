import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, LogOut, User, AlertCircle } from 'lucide-react';

export const AuthTest = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const testGoogleAuth = async () => {
    try {
      console.log('Testing Google OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        console.error('OAuth Error:', error);
        alert(`OAuth Error: ${error.message}`);
      } else {
        console.log('OAuth initiated successfully:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Unexpected error: ${error}`);
    }
  };

  const checkProviders = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Current session:', data);
      if (error) console.error('Session error:', error);
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Authentication Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}
          </p>
          {user && (
            <p className="text-sm text-gray-600">
              <strong>User:</strong> {user.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testGoogleAuth} 
            disabled={loading}
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Test Google Sign-In
          </Button>

          <Button 
            onClick={checkProviders} 
            variant="outline"
            className="w-full"
          >
            Check Session
          </Button>

          {user && (
            <Button 
              onClick={signOut} 
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Debug Info</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Check browser console for detailed logs. If you see "Unsupported provider" error, 
            make sure Google provider is enabled in Supabase dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}; 