import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar/>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
