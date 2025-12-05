import { StaticImageData } from "next/image";
import TwentyFourSevenImage from "@/public/images/247.png";
import PremiumMockupImage from "@/public/images/mockup.png"
import SecureImage from "@/public/images/secure.png"
import OptionsImage from "@/public/images/options.png"
import SharingImage from "@/public/images/sharing.png"
import CrmImage from "@/public/images/crm.png"
import Image from "next/image";

interface Features {
  id: number;
  image: StaticImageData;
  title: string;
  description: string;
}

const features: Features[] = [
  {
    id: 0,
    image: TwentyFourSevenImage,
    title: "24/7 Premium Call Handling",
    description:
      "Never miss a potential high-value client. Our AI handles inbound calls with premium, customizable voice prompts.",
  },
  {
    id: 1,
    image: PremiumMockupImage,
    title: "Instant Premium Mockups",
    description:
      "Generate professional paint visualizations while the client is still on the phone. Send premium mockups directly to their personal portal.",
  },
  {
    id: 2,
    image: SecureImage,
    title: "Secure Client Experience",
    description:
      "Each client receives a branded portal with PIN authentication and encrypted, time-limited access links for complete privacy.",
  },
  {
    id: 3,
    image: OptionsImage,
    title: "Multiple Premium Options",
    description:
      "Show clients different color combinations and finish options in their portal, helping them visualize premium possibilities.",
  },
  {
    id: 4,
    image: SharingImage,
    title: "Premium Project Sharing",
    description:
      "Clients can share their project visualizations via email directly from the portal, making referrals and collaboration seamless.",
  },
  {
    id: 5,
    image: CrmImage,
    title: "Exclusive CRM Integration",
    description:
      "Automatically update your premium CRM with client interactions. Returning callers are recognized and their information is prefilled.",
  },
];

export default function FeatureSection() {
  return (
    <section id="features" className="px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="header-section-div text-center mb-16">
          <h1 className="section-badge">Exclusive Features</h1>
          <p className="section-header">
            Everything you need to{" "}
            <span className="text-primary">streamline operations</span> and
            secure high-value contracts
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image - Always first on mobile, staggered on desktop */}
              <div className="flex-1 w-full">
<div className="relative w-full h-64 lg:h-80 rounded-2xl flex items-center justify-center bg-primary">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent)] rounded-2xl"></div>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={250}
                    height={250}
                    className="object-cover filter invert brightness-0"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 w-full space-y-4">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
