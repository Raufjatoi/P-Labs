import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PLogo from './PLogo';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from './UserMenu';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
<div className="flex items-center space-x-2">
  {/* Logo PNG */}
  <img
    src="logo.png"
    alt="P Labs Logo"
    className="w-12 h-12"
  />

  {/* Colored Text */}
  <span className="font-bold text-xl">
    <span className="text-blue-800">P </span>
    <span className="text-pink-300">Labs</span>
  </span>
</div>


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#model-builder" className="text-muted-foreground hover:text-foreground transition-colors">
                Model Builder
              </a>
              <a href="#streamlit-pro" className="text-muted-foreground hover:text-foreground transition-colors">
                Streamlit Pro
              </a>
              {user && (
                <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </a>
              )}
            </div>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                    {user.plan.toUpperCase()}
                  </Badge>
                  <UserMenu />
                </div>
              ) : (
                <Button onClick={handleAuthClick}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#model-builder" className="text-muted-foreground hover:text-foreground transition-colors">
                  Model Builder
                </a>
                <a href="#streamlit-pro" className="text-muted-foreground hover:text-foreground transition-colors">
                  Streamlit Pro
                </a>
                {user && (
                  <a href="#dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </a>
                )}
                
                {user ? (
                  <div className="flex items-center space-x-3 pt-2">
                    <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                      {user.plan.toUpperCase()}
                    </Badge>
                    <UserMenu />
                  </div>
                ) : (
                  <Button onClick={handleAuthClick} className="w-fit">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};