import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatDistanceToNow } from 'date-fns';
import { 
  Zap, 
  Code, 
  Calendar, 
  Crown,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { stats, activities, loading } = useDashboardData();

  if (!user) return null;

  const usagePercentage = user.apiCallsLimit === -1 ? 0 : (user.apiCallsUsed / user.apiCallsLimit) * 100;
  const remainingCalls = user.apiCallsLimit === -1 ? 'Unlimited' : user.apiCallsLimit - user.apiCallsUsed;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="dashboard" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your usage, manage your subscription, and monitor your ML model generations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Plan Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={user.plan === 'free' ? 'secondary' : 'default'} className="text-lg py-1 px-3">
                    {user.plan.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls Used</span>
                    <span>{user.apiCallsUsed} / {user.apiCallsLimit === -1 ? '∞' : user.apiCallsLimit}</span>
                  </div>
                  {user.apiCallsLimit !== -1 && (
                    <Progress value={usagePercentage} className="h-2" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {remainingCalls} calls remaining this month
                  </p>
                </div>

                <Button 
                  onClick={() => scrollToSection('pricing')} 
                  className="w-full"
                  variant={user.plan === 'free' ? 'default' : 'outline'}
                >
                  {user.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-accent-purple" />
                  <div className="text-2xl font-bold">{user.apiCallsUsed}</div>
                  <div className="text-sm text-muted-foreground">API Calls</div>
                </div>
                
                
              </div>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </section>
  );
};