import { Signup1 } from "@/components/ui/signup-1";

const SignupDemo = () => {
  return (
    <Signup1 
      heading="Create your CallGenie account"
      logo={{
        url: "/",
        src: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=100&fit=crop&crop=center",
        alt: "CallGenie Logo",
        title: "CallGenie",
      }}
      signupText="Create an account"
      googleText="Sign up with Google"
      loginText="Already have an account?"
      loginUrl="/login"
    />
  );
};

export { SignupDemo }; 