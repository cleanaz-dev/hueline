import Image from "next/image";
import Stroke from "@/public/images/square-logo-brush.png";

export default function LogoStroke() {
  return (
    <div className="flex justify-center items-center">
      <Image
        src={Stroke}
        width={100}
        height={100}
        className="w-[100px] -my-12 sm:my-0"
        priority
        alt="logo-brush"
      />
    </div>
  );
}
