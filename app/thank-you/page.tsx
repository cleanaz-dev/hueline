import Logo from "@/public/images/logo-2--increased-brightness.png";
import Image from "next/image";

interface ThankYouPageProps {
  searchParams: Promise<{ name?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { name = "there" } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 py-24 px-4 flex justify-center">
      <div className="max-w-xl w-full text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">

          <div className="flex justify-center mb-6">
            <Image src={Logo} alt="Logo" width={120} height={60} />
          </div>

          <div className="text-indigo-500 mb-4 text-5xl">🎉</div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            You&apos;re all set, {name}!
          </h1>

          <p className="text-slate-600 mb-8">
            A calendar invitation has been sent to your email address with the meeting details.
          </p>

          <a
            href="/"
            className="inline-block bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-600 transition"
          >
            Return To HomePage
          </a>

        </div>
      </div>
    </main>
  );
}