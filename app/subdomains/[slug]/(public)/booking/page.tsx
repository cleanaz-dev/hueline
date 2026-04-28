import type { Viewport } from "next";
import CalEmbed from "./CalEmbed";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const name = typeof params.name === "string" ? params.name : "";
  const phone = typeof params.phone === "string" ? params.phone : "";
  const huelineId =
    typeof params.huelineId === "string" ? params.huelineId : "";
  const direct =
    typeof params.direct === "string" ? params.direct : "";

  const rawLink =
    process.env.NEXT_PUBLIC_CAL_LINK || "paul-bare-sales/hue-line";
  const directLink = "paul-bare-sales/hue-line-direct";
  const cleanCalLink = rawLink.replace(/^(https?:\/\/)?(www\.)?cal\.com\//, "");

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Book Your Demo
          </h1>
          <p className="text-slate-600">
            Select a time below to see HUE-LINE in action.
          </p>
        </div>
        <div className="overflow-hidden">
          {direct ? (
            <CalEmbed key="direct" /* Add this key */ calLink={directLink} />
          ) : (
            <CalEmbed
              key="standard" /* Add this key */
              calLink={cleanCalLink}
              name={name}
              phone={phone}
              huelineId={huelineId}
            />
          )}
        </div>
      </div>
    </main>
  );
}
