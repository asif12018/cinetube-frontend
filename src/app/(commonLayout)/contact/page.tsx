import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Get in Touch</h1>
        <p className="text-gray-400">Have a question, feedback, or need support? Our team is here to help you 24/7.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Email Us</p>
                  <p className="text-gray-400 text-sm mt-1">support@cinehub.com</p>
                  <p className="text-gray-400 text-sm">press@cinehub.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Call Us</p>
                  <p className="text-gray-400 text-sm mt-1">+1 (800) 123-4567</p>
                  <p className="text-gray-500 text-xs mt-1">Mon-Fri from 8am to 5pm.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-200">Headquarters</p>
                  <p className="text-gray-400 text-sm mt-1">123 Cinema Boulevard, Suite 400<br/>Los Angeles, CA 90028<br/>United States</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">First Name</label>
                <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Last Name</label>
                <input type="text" className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email Address</label>
              <input type="email" className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="john@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Subject</label>
              <select className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none">
                <option>General Inquiry</option>
                <option>Billing & Subscriptions</option>
                <option>Technical Support</option>
                <option>Content Request</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Message</label>
              <textarea rows={4} className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-y" placeholder="How can we help you?"></textarea>
            </div>

            <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6">
              <Send className="w-5 h-5" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
