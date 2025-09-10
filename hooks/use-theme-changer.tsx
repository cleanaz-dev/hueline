"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setIsRotating(true);
    setTheme(theme === "light" ? "dark" : "light");
    
    // Reset rotation after animation completes
    setTimeout(() => setIsRotating(false), 300);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`w-10 h-10 rounded-full relative overflow-hidden transition-all duration-300 hover:scale-110 ${
          isRotating ? "rotate-180" : ""
        }`}
        onClick={handleThemeToggle}
        aria-label="Toggle theme"
      >
        {/* Sun icon for light theme */}
        <Sun className={`h-5 w-5 absolute transition-all duration-300 ${
          theme === "light" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`} />
        
        {/* Moon icon for dark theme */}
        <Moon className={`h-5 w-5 absolute transition-all duration-300 ${
          theme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`} />
      </Button>
    </div>
  );
}