import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="pt-10 pb-6 mt-10 text-gray-300 bg-gray-900">
      <div className="grid grid-cols-1 gap-8 px-6 mx-auto max-w-7xl sm:grid-cols-2 md:grid-cols-4">

        {/* 1️⃣ Company Info */}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-white">TravelVista</h2>
          <p className="text-sm leading-relaxed">
            Explore the world with our exclusive travel packages.  
            Make your travel dreams come true with the best destinations and experiences.
          </p>
        </div>

        {/* 2️⃣ Quick Links */}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-white">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Home</a></li>
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Packages</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* 3️⃣ Support */}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-white">Support</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">FAQs</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            <li><a href="#" className="hover:text-white">Help Center</a></li>
          </ul>
        </div>

        {/* 4️⃣ Social Media */}
        <div>
          <h2 className="mb-3 text-xl font-semibold text-white">Follow Us</h2>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-500"><FaFacebookF size={20} /></a>
            <a href="#" className="hover:text-pink-500"><FaInstagram size={20} /></a>
            <a href="#" className="hover:text-sky-400"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-blue-400"><FaLinkedinIn size={20} /></a>
          </div>
        </div>

      </div>

      <div className="mt-8 mb-4 border-t border-gray-700"></div>

      <div className="text-sm text-center">
        © {new Date().getFullYear()} <span className="font-semibold text-white">TravelVista</span>.  
        All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;