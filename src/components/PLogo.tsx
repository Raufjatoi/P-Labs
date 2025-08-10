import { MessageSquare } from "lucide-react";

const PLogo = ({ className = "" }: { className?: string }) => {
  return (
 <div className={`inline-flex items-center gap-3 ${className}`}>
  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
    <MessageSquare className="w-5 h-5 text-white" />
  </div>

  {/* Logo + Text */}
  <div className="flex items-center gap-2">
    {/* Logo PNG */}
    <img 
      src="logo.png"
      alt="P Labs Logo" 
      className="w-6 h-6"
    />
    
    {/* "P" in blue, "Labs" in pink */}
    <span>
      <span className="text-blue-500 font-bold">P</span>
      <span className="text-pink-500 font-bold">Labs</span>
    </span>
  </div>
</div>

  );
};

export default PLogo;