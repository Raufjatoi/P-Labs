import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthStatusProps {
  message: string;
  type: 'success' | 'info' | 'warning';
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'info':
        return <Mail className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'warning':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            P Labs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant={getVariant()}>
            {getIcon()}
            <AlertDescription className="ml-2">
              {message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};