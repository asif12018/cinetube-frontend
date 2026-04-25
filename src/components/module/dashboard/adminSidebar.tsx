"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Users,
  MessageSquareWarning,
  LogOut,
  X,
  Home,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { logoutUserAction } from "@/service/auth.service";

export function AdminSidebar({ closeMobile }: { closeMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Add Movie/Series", href: "/dashboard/addMovies", icon: Film, exact: false },
    { name: "Manage Movies", href: "/dashboard/manageMovies", icon: Film, exact: false },
    { name: "Manage Actors", href: "/dashboard/addActor", icon: Users, exact: false },
    { name: "Pending Reviews", href: "/dashboard/reviews", icon: MessageSquareWarning, exact: false },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await logoutUserAction();

      if (res.success) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Failed to log out");
      }
    } catch {
      toast.error("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] border-r border-gray-800 w-64 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
          CineTube <span className="text-sm text-gray-400 tracking-widest uppercase block mt-1">Admin</span>
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
          // Exact match for root dashboard, prefix match for sub-pages
          const isActive = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMobile}
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
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </button>
      </div>
    </div>
  );
}