import Image from "next/image";
import Logo from "@/public/images/logo-2--increased-brightness.png";

export default function BookingPageFooter() {
  return (
    <footer className="border-t border-primary/10 bg-background mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Image
            src={Logo}
            alt="HueLine Logo"
            className="object-contain"
            width={130}
            height={130}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hue-Line AI Voice Agent. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
