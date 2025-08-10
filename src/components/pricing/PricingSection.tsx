import React, { useState } from 'react';
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
      'CSV dataset upload (up to 1MB)',
      'Community support',
      'Email support'
    ],
    limitations: [
      'No Streamlit app generation',
      'Limited to classification & regression',
      'Basic code explanations'
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
      'Advanced Python code with explanations',
      'CSV upload (up to 10MB)',
      'All model types (clustering, neural networks)',
      'Priority email support',
      'Code optimization suggestions',
      'Basic Streamlit app generation (10/month)'
    ],
    limitations: [
      'Limited Streamlit customization',
      'No auto-deployment'
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
      'Unlimited CSV upload (up to 100MB)',
      'Advanced model types & custom algorithms',
      'Priority support + dedicated Slack channel',
      'Auto-deployment to Streamlit Cloud',
      'Custom model templates',
      'Team collaboration features',
      'API access',
      'White-label options'
    ],
    limitations: []
  }
];

export const PricingSection = () => {
  const { user } = useAuth();
  const { subscribed, subscriptionTier, createCheckoutSession, openCustomerPortal } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

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

    if (planId === user.plan) {
      // Open customer portal for current subscribers
      try {
        setProcessingPlan(planId);
        const portalUrl = await openCustomerPortal();
        window.open(portalUrl, '_blank');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to open customer portal. Please try again.",
          variant: "destructive"
        });
      } finally {
        setProcessingPlan(null);
      }
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
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent-purple to-accent-pink">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 rounded-full bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 w-fit mb-4">
                    <Icon className="h-8 w-8 text-accent-purple" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600">✓ Included:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-muted-foreground">⚠ Limitations:</h4>
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-sm">• {limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full"
                    variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={processingPlan === plan.id}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      subscribed ? 'Manage Subscription' : 'Current Plan'
                    ) : plan.price === 0 ? (
                      'Get Started Free'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};