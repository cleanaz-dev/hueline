import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { ReactNode } from "react";
import { ClockAlert, PhoneMissed, Users2 } from "lucide-react";

interface Challenges {
  id: number;
  title: string;
  challenge: string;
  solution: string;
  icon: ReactNode;
}

const challenges: Challenges[] = [
  {
    id: 1,
    title: "Missing High-Value Calls",
    challenge: "You can't answer when you're with clients or on job sites, missing opportunities for $5,000+ projects",
    solution: "Our AI answers every call with premium professionalism, capturing leads 24/7.",
    icon: <PhoneMissed className="size-10" />
  },
  {
    id: 2,
    title: "Inefficient Quote Process",
    challenge: "Time-consuming back-and-forth for color consultations and estimates reduces your billable hours.",
    solution: "Generate professional paint mockups instantly while the client is on the phone.",
    icon: <ClockAlert className="size-10" />
  },
  {
    id: 3,
    title: "Client Experience Management",
    challenge: "Managing customer communications and follow-ups manually leads to dropped leads and unhappy clients.",
    solution: "Automated CRM updates, personalized portals, and premium SMS follow-ups.",
    icon: <Users2 className="size-10" />
  }
]

export default function BusinessChallenges() {
  return (
    <section id="solutions" className="px-4 py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className='header-section-div text-center mb-16'>
          <h1 className='section-badge'>Solve Your Biggest Business Challenges</h1>
          <h2 className='section-header'>Our exclusive <span className="text-primary">Voice AI</span> is engineered specifically to address them</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {challenges.map((challenge: Challenges) => (
            <Card 
              key={challenge.id}
              className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-sm hover:shadow-lg transition-all duration-300 py-8"
            >
              <CardHeader className="pb-4">
                {/* Large Icon Top Left */}
                <div className="size-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <div className="text-blue-600">
                    {challenge.icon}
                  </div>
                </div>
                
                {/* Bold Title */}
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {challenge.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Challenge Text */}
                <p className="text-gray-600 leading-relaxed">
                  {challenge.challenge}
                </p>

                {/* Separator */}
                <div className="border-t border-gray-200"></div>

                {/* Bold Solution */}
                <p className="text-primary font-semibold leading-relaxed">
                  {challenge.solution}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}