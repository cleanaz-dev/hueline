import { QuoteProvider } from "@/context/quote-context";

export default async function QuoteGlobalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <QuoteProvider slug={slug}>
      {children}
    </QuoteProvider>
  );
}
