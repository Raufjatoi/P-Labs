import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, Upload, Code, Zap, Github } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Text content */}
        <div className="text-center lg:text-left space-y-8 animate-fade-in">
          
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
              Generate ML models
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                by describing your ideas.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Transform your machine learning concepts into reality with our intuitive platform. 
              Simply describe what you want to build, and we'll help you create powerful ML models.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => document.getElementById('model-builder')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
              <Zap className="w-5 h-5 ml-2 group-hover:animate-pulse" />
            </Button>
            <Button 
              variant="pro" 
              size="xl" 
              className="group"
              onClick={() => document.getElementById('streamlit-pro')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Lock className="w-5 h-5 mr-2" />
              Unlock Streamlit Pro
            </Button>
          </div>
        </div>
        
        {/* Right side - Feature card */}
        <div className="relative animate-scale-in lg:mt-0 mt-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-card border border-border p-6 sm:p-8 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-muted-foreground ml-2">ML Model Generator</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-2">You:</div>
                <div className="text-sm text-muted-foreground">
                  I want to predict house prices based on location and size
                </div>
              </div>
              
              <div className="p-4 bg-gradient-primary rounded-lg text-white">
                <div className="text-sm font-medium mb-2">P Labs:</div>
                <div className="text-sm">
                  Great! I'll create a regression model for you. Let me set up the features...
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-accent">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                Generating model...
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-foreground mb-2">Model Preview</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accuracy:</span>
                  <span className="text-sm font-medium text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Features:</span>
                  <span className="text-sm font-medium">Location, Size, Age</span>
                </div>
                <div className="w-full bg-accent/20 rounded-full h-2 mt-2">
                  <div className="bg-accent h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;