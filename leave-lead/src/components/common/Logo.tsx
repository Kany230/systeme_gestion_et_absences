import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { img: "h-8 w-8", text: "text-base" },
  md: { img: "h-10 w-10", text: "text-lg" },
  lg: { img: "h-14 w-14", text: "text-2xl" },
};

export const Logo = ({ to = "/", showText = true, size = "md", className }: LogoProps) => {
  const s = sizes[size];
  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-md opacity-30" />
        <img
          src={logo}
          alt="TimeOff System"
          width={56}
          height={56}
          className={cn("relative rounded-xl object-contain", s.img)}
        />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent", s.text)}>
          TimeOff <span className="font-light">System</span>
        </span>
      )}
    </div>
  );
  return to ? <Link to={to} className="flex items-center">{inner}</Link> : inner;
};