import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  onClick
}) => {
  const { signInWithGoogle, loading } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
    onClick?.();
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      variant={variant}
      size={size}
      className={`${className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          {children || 'Sign in with Google'}
        </>
      )}
    </Button>
  );
}; 