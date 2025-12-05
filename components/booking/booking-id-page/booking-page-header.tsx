import Image from "next/image";
import Logo from "@/public/images/logo-2--increased-brightness.png"
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm ">
      <div className="max-w-6xl mx-auto px-6 py-2 md:py-4 flex items-center justify-between">
        <div className="">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={Logo}
              alt="HueLine Logo"
              className="object-contain w-20 md:w-[130px]"
              width={130}
              height={130}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
