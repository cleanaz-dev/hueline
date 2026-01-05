// app/(owner)/(dashboard)/layout.tsx
import OwnerSidebar from "@/components/owner/owner-sidebar"; // This is your Sidebar Component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This adds the Sidebar and the standard padding
    <OwnerSidebar>
      {children}
    </OwnerSidebar>
  );
}