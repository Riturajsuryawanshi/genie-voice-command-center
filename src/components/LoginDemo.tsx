import { Login1 } from "@/components/ui/login-1";

const LoginDemo = () => {
  return (
    <Login1 
      heading="Welcome back to CallGenie"
      logo={{
        url: "/",
        src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=100&fit=crop&crop=center",
        alt: "CallGenie Logo",
        title: "CallGenie",
      }}
      loginText="Sign in to your account"
      googleText="Sign in with Google"
      signupText="Don't have an account?"
      signupUrl="/signup"
    />
  );
};

export { LoginDemo }; 