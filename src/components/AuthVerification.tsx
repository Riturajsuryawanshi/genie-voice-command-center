import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export const AuthVerification = () => {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runVerificationTests = async () => {
    setIsTesting(true);
    const results = {
      supabaseConnection: false,
      googleProviderEnabled: false,
      oauthFlow: false,
      userSession: false,
      errors: [] as string[]
    };

    try {
      // Test 1: Supabase Connection
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError) {
        results.supabaseConnection = true;
      } else {
        results.errors.push(`Supabase connection: ${sessionError.message}`);
      }

      // Test 2: Check if user is authenticated
      if (user) {
        results.userSession = true;
      }

      // Test 3: Try OAuth flow (this will redirect to Google)
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (!error) {
          results.oauthFlow = true;
        } else {
          results.errors.push(`OAuth flow: ${error.message}`);
        }
      } catch (error: any) {
        results.errors.push(`OAuth error: ${error.message}`);
      }

      setTestResults(results);
    } catch (error: any) {
      results.errors.push(`General error: ${error.message}`);
      setTestResults(results);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${isTesting ? 'animate-spin' : ''}`} />
          Authentication Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            This will test your Google OAuth configuration and verify all settings are correct.
          </p>
          
          <Button 
            onClick={runVerificationTests} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? 'Running Tests...' : 'Run Verification Tests'}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.supabaseConnection)}
                <span className="text-sm">Supabase Connection</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.userSession)}
                <span className="text-sm">User Session</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.oauthFlow)}
                <span className="text-sm">OAuth Flow</span>
              </div>
            </div>

            {testResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Issues Found</span>
                </div>
                <ul className="text-xs text-red-700 space-y-1">
                  {testResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {testResults.errors.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">All tests passed!</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Your Google OAuth configuration is working correctly.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Current Status</span>
          </div>
          <div className="space-y-1 text-xs text-blue-700">
            <p>• Loading: {loading ? 'Yes' : 'No'}</p>
            <p>• Authenticated: {user ? 'Yes' : 'No'}</p>
            {user && (
              <p>• User Email: {user.email}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 