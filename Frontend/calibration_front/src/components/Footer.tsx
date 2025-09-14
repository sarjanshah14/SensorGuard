import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">

        {/* Left: App Name + Description + Social */}
        <div className="flex flex-col items-center md:items-start md:w-1/3 space-y-4">
          <span className="text-2xl font-bold">SensorGuard</span>
          <p className="text-sm text-white/70 max-w-xs text-center md:text-left">
            Protecting your critical systems with AI-powered monitoring. Stay secure, stay informed.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-pink-500"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-600"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-sky-400"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-blue-500"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Right: Links */}
        <div className="grid grid-cols-2 gap-8 md:w-2/3 text-sm">
          <div className="flex flex-col space-y-2">
            <h4 className="text-white font-semibold">Main</h4>
            <Link to="/auth" className="hover:underline">Auth</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/anomalies" className="hover:underline">Anomalies</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </div>
          <div className="flex flex-col space-y-2">
            <h4 className="text-white font-semibold">Analysis</h4>
            <Link to="/drift" className="hover:underline">Drift Prediction</Link>
            <Link to="/calibration" className="hover:underline">Calibration</Link>
            <Link to="/ml-training" className="hover:underline">ML Training</Link>
            <Link to="/reports" className="hover:underline">Reports</Link>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="mt-12 border-t border-white/20 pt-6 text-center text-xs text-white/70">
        © 2024 SensorGuard. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
