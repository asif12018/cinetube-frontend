import { Check } from "lucide-react";
import { Button } from "./button";

const plans = [
  {
    name: "Free",
    price: "0",
    interval: "forever",
    description: "Perfect for occasional viewers to explore our catalog.",
    features: [
      "Access to basic movie catalog",
      "Standard definition (SD) streaming",
      "Ad-supported viewing",
      "Watch on 1 device at a time",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Premium Monthly Subscription",
    price: "75.00",
    interval: "per month",
    description: "Great for regular viewers who want flexibility.",
    features: [
      "Unlimited access to all movies & series",
      "High definition (HD) streaming",
      "Ad-free experience",
      "Watch on 2 devices simultaneously",
      "Cancel anytime",
    ],
    buttonText: "Subscribe Monthly",
    popular: true,
  },
  {
    name: "Yearly",
    price: "750.00",
    interval: "per year",
    description: "Our best value plan for hardcore cinephiles.",
    features: [
      "Everything in Monthly plan",
      "Ultra HD (4K) & HDR streaming",
      "Watch on 4 devices simultaneously",
      "Offline downloads",
      "Early access to new releases",
    ],
    buttonText: "Subscribe Yearly",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get unlimited access to premium movies and exclusive TV shows. Select the perfect plan for your entertainment needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative bg-[#141414] rounded-2xl p-8 border ${
                plan.popular ? "border-red-600 shadow-2xl shadow-red-600/20 transform md:-translate-y-4" : "border-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 text-sm font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm h-10">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                <span className="text-gray-500 font-medium">/{plan.interval}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                    <Check className="w-5 h-5 text-red-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 text-base font-bold ${
                  plan.popular
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
