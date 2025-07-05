import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Login1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  loginText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
  onSuccess?: () => void;
}

const Login1 = ({
  heading = "Welcome back to CallGenie",
  logo = {
    url: "/",
    src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=100&fit=crop&crop=center",
    alt: "CallGenie Logo",
    title: "CallGenie",
  },
  googleText = "Sign in with Google",
  loginText = "Sign in to your account",
  signupText = "Don't have an account?",
  signupUrl = "/signup",
  onSuccess,
}: Login1Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here you would implement email/password login
      // For now, we'll just show a success message
      toast({
        title: "Login successful!",
        description: "Welcome back to CallGenie.",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Google login failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-muted h-screen">
      <div className="flex h-full items-center justify-center">
        <div className="border-muted bg-background flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border px-6 py-12 shadow-md">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-10 dark:invert"
                />
              </a>
            </div>
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <form onSubmit={handleEmailLogin} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : loginText}
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 size-5" />
                  {isLoading ? "Signing in..." : googleText}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login1 }; 