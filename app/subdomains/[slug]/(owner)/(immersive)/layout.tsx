// app/(owner)/(immersive)/layout.tsx
export default function ImmersiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Force full screen, black background, no padding
    <div className="w-screen min-h-screen bg-gray-50 overflow-hidden m-0 p-0">
      {children}
    </div>
  );
}