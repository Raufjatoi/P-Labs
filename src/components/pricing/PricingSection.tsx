import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Check, Zap, Crown, Rocket, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      '50 AI model generations per month',
      'Basic Python code export',
      'No CSV dataset upload',
    ],
    limitations: [
      'No Streamlit app generation',
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 5,
    interval: 'month',
    description: 'Great for professionals',
    icon: Crown,
    popular: true,
    features: [
      '5,000 AI model generations per month',
      'CSV upload (Coming soon)',
      'All model types (clustering, neural networks)',
      'Code optimization suggestions',
      'Basic Streamlit app generation (10/month)'
    ],
    limitations: [
      'Limited Streamlit customization',
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 10,
    interval: 'month',
    description: 'For teams and advanced users',
    icon: Rocket,
    features: [
      'Unlimited AI model generations',
      'Full Streamlit app generation',
      'Unlimited CSV upload (Coming soon)',
      'Advanced model types & custom algorithms',
      'API access (Coming soon)',
    ],
    limitations: []
  }
];

export const PricingSection = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint is 768px
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    if (planId === 'free') {
      toast({
        title: "Free plan",
        description: "You're already on the free plan or can downgrade through customer portal.",
      });
      return;
    }

    if (isMobile) {
      toast({
        title: "Switch to Laptop",
        description: "Please switch to a laptop or desktop computer to subscribe.",
        variant: "destructive"
      });
      return;
    }

    if (subscribed) {
      toast({
        title: "Customer Portal",
        description: "Customer portal is coming soon. You can manage your subscription there.",
      });
      return;
    }

    // Create checkout session for new subscriptions
    try {
      setProcessingPlan(planId);
      const checkoutUrl = await createCheckoutSession(planId);
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Choose Your Plan
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Unlock the full power of AI-driven machine learning development.
            Start free and upgrade as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.plan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${plan.popular ? 'border-accent-purple shadow-lg scale-105' : ''} hover:shadow-lg transition-all duration-200`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent-purple to-accent-pink text-xs sm:text-sm py-1 px-3">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4 sm:pb-6">
                  <div className="mx-auto p-2 sm:p-3 rounded-full bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 w-fit mb-3 sm:mb-4">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-accent-purple" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold">
                    ${plan.price}
                    <span className="text-base sm:text-lg font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="font-semibold text-green-600 text-sm sm:text-base">✓ Included:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <h4 className="font-semibold text-muted-foreground text-sm sm:text-base">⚠ Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-xs sm:text-sm">• {limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isCurrentPlan && subscribed ? (
                    <Button 
                      className="w-full h-10 sm:h-11 text-sm sm:text-base"
                      variant="outline"
                      disabled // Make it non-clickable
                    >
                      Customer Portal Soon
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelect(plan.id)}
                      className="w-full h-10 sm:h-11 text-sm sm:text-base"
                      variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                      disabled={processingPlan === plan.id || (isMobile && plan.id !== 'free')}
                    >
                      {processingPlan === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : plan.price === 0 ? (
                        'Get Started Free'
                      ) : (
                        isMobile ? 'Please switch to laptop to subscribe' : `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};