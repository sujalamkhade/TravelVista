import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfileImg from "../../assets/images/profile.png";
import { FaPlaneDeparture } from "react-icons/fa";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative top-0 left-0 z-50 w-full shadow-lg bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-600">
      <div className="flex items-center justify-between px-6 py-3 mx-auto max-w-7xl">
        
        {/* 🛫 Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 transition-transform bg-yellow-400 rounded-full shadow-md group-hover:scale-105">
            <FaPlaneDeparture size={20} className="text-blue-900" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide text-white">
           Travel<span className="text-yellow-400"></span>Vista
          </h1>
        </Link>

        {/* 🌍 Desktop Navigation */}
        <nav className="hidden gap-6 font-semibold text-white md:flex">
          <Link
            to="/"
            className="transition-colors duration-200 hover:text-yellow-400"
          >
            Home
          </Link>
          <Link
            to="/search"
            className="transition-colors duration-200 hover:text-yellow-400"
          >
            Packages
          </Link>
          <Link
            to="/about"
            className="transition-colors duration-200 hover:text-yellow-400"
          >
            About
          </Link>

          {/* 👤 Profile or Login */}
          {currentUser ? (
            <Link
              to={`/profile/${
                currentUser.user_role === 1 ? "admin" : "user"
              }`}
              className="transition-transform hover:scale-105"
            >
              <img
                src={currentUser.avatar || defaultProfileImg}
                alt={currentUser.username}
                className="object-cover w-10 h-10 border-2 border-yellow-400 rounded-full"
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1 font-semibold text-black transition bg-yellow-400 rounded-full hover:bg-yellow-300"
            >
              Login
            </Link>
          )}
        </nav>

        {/* 📱 Mobile Menu Button */}
        <button
          className="text-2xl text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* 📱 Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="flex flex-col items-center gap-4 py-4 font-semibold text-white bg-blue-800 shadow-lg md:hidden animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400"
          >
            Home
          </Link>
          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400"
          >
            Packages
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="hover:text-yellow-400"
          >
            About
          </Link>
          {currentUser ? (
            <Link
              to={`/profile/${
                currentUser.user_role === 1 ? "admin" : "user"
              }`}
              onClick={() => setMenuOpen(false)}
              className="hover:text-yellow-400"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-1 font-semibold text-black transition bg-yellow-400 rounded-full hover:bg-yellow-300"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;