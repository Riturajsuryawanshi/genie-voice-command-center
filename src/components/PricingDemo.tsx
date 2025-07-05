"use client";

import { Pricing } from "@/components/ui/pricing";

const demoPlans = [
  {
    name: "STARTER",
    price: "0",
    yearlyPrice: "0",
    period: "first month",
    features: [
      "100 calls per month",
      "Basic AI responses",
      "Email support",
      "Standard integrations",
      "Community support",
    ],
    description: "Perfect for small businesses getting started",
    buttonText: "Start Free Trial",
    href: "/sign-up",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "150",
    yearlyPrice: "120",
    period: "per month",
    features: [
      "1000 calls per month",
      "Advanced AI responses",
      "Priority support",
      "Custom integrations",
      "Team collaboration",
      "Analytics dashboard",
      "API access",
    ],
    description: "Ideal for growing businesses",
    buttonText: "Get Started",
    href: "/sign-up",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "500",
    yearlyPrice: "400",
    period: "per month",
    features: [
      "Unlimited calls",
      "Custom AI training",
      "24/7 support",
      "Dedicated account manager",
      "SSO Authentication",
      "Advanced security",
      "Custom contracts",
      "SLA agreement",
    ],
    description: "For large organizations with specific needs",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

function PricingDemo() {
  return (
    <div className="h-[800px] overflow-y-auto rounded-lg">
      <Pricing 
        plans={demoPlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you\nAll plans include access to our AI phone assistant, call management tools, and dedicated support."
      />
    </div>
  );
}

export { PricingDemo }; 