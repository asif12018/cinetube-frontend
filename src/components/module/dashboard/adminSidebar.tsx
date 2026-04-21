"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  MessageSquareWarning, 
  LogOut, 
  X, 
  Home
} from "lucide-react";

export function AdminSidebar({ closeMobile }: { closeMobile?: () => void }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Add Movie/Series", href: "/dashboard/addMovies", icon: Film },
    { name: "Manage Actors", href: "/dashboard/addActor", icon: Users },
    { name: "Pending Reviews", href: "/dashboard/reviews", icon: MessageSquareWarning }, 
  ];

  return (
    <div className="flex flex-col h-full bg-[#141414] border-r border-gray-800 w-64 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          CineHub <span className="text-sm text-gray-400 tracking-widest uppercase block mt-1">Admin</span>
        </Link>
        {/* Mobile Close Button */}
        {closeMobile && (
          <button className="md:hidden" onClick={closeMobile}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMobile} // Auto-close on mobile when a link is clicked
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? "bg-red-600/10 text-red-500 border border-red-600/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-gray-500"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-100 transition-all font-medium"
        >
          <Home className="w-5 h-5 text-gray-500" />
          Back to Portal
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-medium">
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}