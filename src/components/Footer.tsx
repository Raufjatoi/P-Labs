import { Heart, Github, Mail, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by</span>
            <a
              href="https://raufjatoi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:text-accent transition-colors duration-200 flex items-center gap-1"
            >
              Abdul Rauf Jatoi
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://github.com/Raufjatoi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:raufpokemon00@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </a>
            <a
              href="https://raufjatoi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Portfolio</span>
            </a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p> 2025 P Labs | iCreativez</p>
            <p className="mt-2">
              Transform your ML ideas into reality with our AI-powered platform.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;