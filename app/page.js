"use client"
import React, { useEffect } from "react";
import Link from "next/link";


const LandingPage = () => {
  useEffect(() => {
    const cursor = document.querySelector(".cursor");
    const sparklesContainer = document.querySelector(".sparkles-container");

    document.addEventListener("mousemove", (e) => {
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Create sparkles
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      sparklesContainer.appendChild(sparkle);

      // Remove sparkle after animation
      setTimeout(() => {
        sparkle.remove();
      }, 1000);
    });
  }, []);

  return (
    <div className="landing-page">
      <div className="sparkles-container"></div> {/* Container for sparkles */}
      <div className="cursor"></div> {/* Custom cursor */}

      <header>
        <h1>OPTIPATH</h1>
        <p>Optimizing travel routes </p>
      </header>
      <main>
        <section className="hero">
          <h2>Find the Best Route for Your Journey</h2>
          <p>Powered by AI and Google Maps, our tool helps you plan the most efficient travel route.</p>
          <Link href="/main" className="cta-button">Get Started</Link>
        </section>

      </main>
      <footer>
        <p>&copy; 2025 TSP Optimizer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
