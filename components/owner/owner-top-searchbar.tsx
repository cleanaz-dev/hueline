import { Bell, Search } from "lucide-react";

export default function OwnenTopSearchBar() {
  return (
    <div className="ml-auto flex items-center gap-2 md:gap-4">
      <div className="relative hidden sm:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search..."
          className="h-9 w-48 md:w-64 rounded-md border border-input bg-muted/30 pl-9 text-sm outline-none focus:ring-1 focus:ring-ring transition-all hover:bg-muted/50"
        />
        <div className="absolute right-2 top-2 hidden items-center gap-1 opacity-50 md:flex">
          <span className="text-[10px] font-medium border rounded px-1.5 bg-background">
            ⌘K
          </span>
        </div>
      </div>

      <button className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent transition-colors group">
        <Bell className="h-4 w-4 text-muted-foreground group-hover:text-white" />
        <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-background" />
      </button>
    </div>
  );
}
