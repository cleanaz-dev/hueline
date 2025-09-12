"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeChanger() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    setIsRotating(true);
    // Use resolved theme (accounting for system preference)
    const currentTheme = theme === "system" ? systemTheme : theme;
    setTheme(currentTheme === "light" ? "dark" : "light");
    setTimeout(() => setIsRotating(false), 300);
  };

  // Return a placeholder during SSR to prevent layout shift
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
          aria-label="Toggle theme"
        >
          <div className="h-5 w-5"></div>
        </Button>
      </div>
    );
  }

  // Get the actual theme to display (accounting for system preference)
  const displayTheme = theme === "system" ? systemTheme : theme;

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
        <Sun className={`h-5 w-5 absolute transition-all duration-300 ${
          displayTheme === "light" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`} />
        
        <Moon className={`h-5 w-5 absolute transition-all duration-300 ${
          displayTheme === "dark" ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`} />
      </Button>
    </div>
  );
}