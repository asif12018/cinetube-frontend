"use client"
import Link from "next/link";
import { Film, Mail } from "lucide-react";
import { Button } from "./button";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 xl:gap-24">
          {/* Brand Info */}
          <div className="flex flex-col space-y-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                CineTube
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Your ultimate destination for streaming the latest movies,
              exclusive TV shows, and premium entertainment content anywhere,
              anytime.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Link
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <TwitterIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <InstagramIcon className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <YoutubeIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/movie"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Movies
                </Link>
              </li>
              <li>
                <Link
                  href="/movie"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  TV Shows
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Trending Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center"
                >
                  <span className="h-1 w-1 rounded-full bg-primary mr-2 opacity-0 -ml-3 transition-all"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter to get the latest updates on new
              releases and exclusive content.
            </p>
            <form
              className="space-y-2 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-2 lg:flex-col lg:space-y-2 lg:space-x-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative w-full">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto lg:w-full font-medium"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} CineTube. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="#"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="hover:text-primary transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>

      {/* CSS to handle the hover dot animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        li a:hover span {
          opacity: 1;
          margin-left: 0px;
          margin-right: 8px;
        }
      `,
        }}
      />
    </footer>
  );
}
