import { Clapperboard, Globe, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Redefining Your <span className="text-red-600">Cinematic</span> Experience
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          At CineHub, we believe that stories have the power to change the world. Our mission is to bring the greatest movies, series, and documentaries from across the globe directly to your screen, in the highest quality possible.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
        {[
          { icon: Clapperboard, title: "Curated Content", desc: "Handpicked masterpieces and exclusive originals you won't find anywhere else." },
          { icon: Globe, title: "Global Access", desc: "Enjoy uninterrupted streaming across devices, anywhere in the world." },
          { icon: Zap, title: "Ultra HD Streaming", desc: "Crystal clear 4K resolution with immersive spatial audio technology." },
          { icon: Shield, title: "Safe & Secure", desc: "Enterprise-grade security to keep your viewing habits and data completely private." }
        ].map((feature, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors duration-300 group">
            <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Story Section */}
      <div className="bg-gradient-to-r from-red-900/20 to-black border border-red-900/30 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
          <p className="text-gray-300 leading-relaxed">
            Founded in 2024, CineHub started as a passion project among a small group of filmmakers and developers who were frustrated by the fragmented streaming landscape. We wanted a single, beautifully designed platform where cinephiles could discover, rate, and discuss the art of film.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Today, we serve millions of users worldwide, continuously innovating our recommendation algorithms and player technology to provide the ultimate viewing experience. Welcome to the future of entertainment.
          </p>
        </div>
        <div className="flex-1">
          <div className="aspect-video bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
            {/* Placeholder for a cool image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent mix-blend-overlay"></div>
            <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" alt="Cinema" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
