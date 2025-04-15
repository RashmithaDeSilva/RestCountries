"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import Link from "next/link";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function Home() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Set initial window size
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Listen for window resize to dynamically adjust globe size
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Listen for scroll event to track scroll position
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    fetch("/api/allSubscriptionTypes")
      .then(res => res.json())
      .then(data => setSubscriptions(data.data || []));
  }, []);

  // Calculate zoom level based on scroll position (scale the zoom level as per scroll)
  const globeZoom = Math.max(1, 3 - scrollY / 300);

  // Scroll down to the next section
  const handleScrollDown = () => {
    const nextSection = document.getElementById("nextSection");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="text-white bg-gradient-to-br from-green-500 to-black relative overflow-hidden">
      {/* Login/Signup Buttons */}
      <div className="fixed top-4 right-4 z-50 space-x-4">
        {/* Login Button */}
        <Link href="/login">
          <button className="bg-lime-500 hover:bg-lime-400 px-4 py-2 rounded-lg font-semibold">
            Login
          </button>
        </Link>

        {/* Sign Up Button */}
        <Link href="/signup">
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">
            Sign Up
          </button>
        </Link>
    </div>

      {/* Globe Section */}
      <section className="h-screen w-full flex items-center justify-center relative overflow-hidden">
        {windowSize.width > 0 && (
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            backgroundColor="rgba(0,0,0,0)"
            width={windowSize.width}
            height={windowSize.height}
            // globeRadius={globeZoom}
          />
        )}

        {/* Website Name Above the Globe */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-9xl font-extrabold z-50 text-center">
          Rest Countries
        </div>

        {/* Scroll Down Button (side with arrow) */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-10 right-10 bg-transparent text-white text-3xl font-bold hover:text-green-500 transition-colors z-50"
        >
          ↓
        </button>
      </section>

      {/* Services Section */}
      <section
        id="nextSection"
        className="snap-start min-h-screen px-8 py-20 bg-black text-white flex items-center justify-center opacity-0 transform translate-y-20 transition-all duration-700"
        style={{
          opacity: scrollY > windowSize.height * 0.5 ? 1 : 0,
          transform: scrollY > windowSize.height * 0.5 ? "translateY(0)" : "translateY(20px)"
        }}
      >
        <div className="text-center space-y-8">
          <h2 className="text-6xl font-bold text-lime-400 glow">Our Services</h2>
          <div className="text-3xl text-gray-300">
            <p className="mb-4">Retrieve all countries, Filter by Name, Currency, Capital, Language</p>
            <p className="mb-4">Access Flags, Region, Subregion, Get Translations & System Details</p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section
        className="snap-start min-h-screen px-8 py-20 bg-gradient-to-br from-black to-blue-900 opacity-0 transform translate-y-20 transition-all duration-700"
        style={{
          opacity: scrollY > windowSize.height * 1.5 ? 1 : 0,
          transform: scrollY > windowSize.height * 1.5 ? "translateY(0)" : "translateY(20px)"
        }}
      >
        <h2 className="text-6xl font-bold mb-10 text-blue-400 text-center">Plans & Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 justify-center">
          {subscriptions.map((plan) => (
            <div
              key={plan.id}
              className="border border-gray-600 rounded-2xl p-12 bg-black/70 shadow-2xl hover:scale-105 transition-transform transform"
            >
              <h3 className="text-4xl font-semibold text-lime-300">{plan.subscriptionName}</h3>
              <p className="text-lg text-gray-400">{plan.description}</p>
              <p className="mt-4 text-3xl text-white">
                ${plan.subscriptionPrice} {plan.subscriptionPriceCurrency}
              </p>
              <p className="text-lg mt-2">API Limit: {plan.apiRequestLimit === -1 ? 'Unlimited' : plan.apiRequestLimit}</p>
              <p className="text-lg">API Keys: {plan.apiKeyLimit}</p>
              <p className="mt-4 text-gray-400 text-sm italic">{plan.functionDescription}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
