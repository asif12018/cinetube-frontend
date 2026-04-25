"use client";

import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    question: "How much does CineHub cost?",
    answer: "CineHub offers a free tier with ads, or a premium subscription for $75/month. The premium subscription grants you ad-free streaming, ultra HD 4K quality, and access to our exclusive editor's picks."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes! There are no long-term contracts or cancellation fees. You can easily cancel your premium subscription online at any time from your account dashboard."
  },
  {
    question: "What devices can I use to watch CineHub?",
    answer: "You can watch CineHub on almost any internet-connected device. This includes smart TVs, game consoles, streaming media players, smartphones, tablets, and web browsers."
  },
  {
    question: "How do I write a review?",
    answer: "Once you have watched a movie or series, go to its details page and scroll down to the 'Audience Reviews' section. If you are logged in, you will see a form to rate the title from 1-10 stars, write your thoughts, and add relevant tags."
  },
  {
    question: "How do the spoiler warnings work?",
    answer: "If your review contains plot reveals, simply select the 'Spoiler Alert' tag when writing your review. This will automatically hide your text behind a warning box, so other users have to click to reveal it."
  },
  {
    question: "I forgot my password. How do I reset it?",
    answer: "Go to the Login page and click 'Forgot Password'. Enter the email address associated with your account, and we will send you a verification code to reset your password securely."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#141414] text-white pt-24 pb-20 px-4 md:px-12 max-w-4xl mx-auto">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-4 bg-red-600/10 rounded-full mb-6">
          <MessageCircleQuestion className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-gray-400 text-lg">Everything you need to know about the CineHub platform and billing.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                isOpen ? "border-red-600/50 bg-white/5" : "border-white/10 bg-black/20 hover:border-white/20"
              }`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-left font-medium text-lg text-gray-200">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-red-500" : ""}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${
                  isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-400 leading-relaxed border-t border-white/10 pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center bg-gradient-to-br from-red-900/20 to-black border border-red-900/30 p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
        <p className="text-gray-400 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
        <a href="/contact" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
          Get in Touch
        </a>
      </div>
    </div>
  );
}
