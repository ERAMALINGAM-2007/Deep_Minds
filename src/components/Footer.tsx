import { Globe, Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                GlobeTrotter
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your intelligent travel companion for planning personalized adventures around the world.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/explore" className="hover:text-foreground transition-colors">Explore</Link></li>
              <li><Link to="/trips" className="hover:text-foreground transition-colors">My Trips</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">City Guides</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Activities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Press</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GlobeTrotter. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
