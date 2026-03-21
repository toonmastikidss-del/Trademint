import React, { useState, useEffect } from "react";
import banner1 from '../pictures/banner1.png';

const Slider = () => {
  const slides = [
    { id: 1, image: banner1 },
    { id: 2, image: banner1 },
    { id: 3, image: banner1 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    // ── FIX 1: w-full instead of w-[90%] — banner full width lega
    // ── FIX 2: overflow-hidden is on THIS div, not a child
    // ── FIX 3: mx-5 padding instead of percentage width — sides theek rahenge
    <div className="w-full px-4">
      <div className="relative w-full overflow-hidden rounded-2xl">

        {/* Slides track */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="flex-shrink-0 w-full">
              <img
                src={slide.image}
                alt="banner"
                // ── FIX 4: object-fill so full banner shows, not cropped
                className="w-full h-[180px] object-fill block"
              />
            </div>
          ))}
        </div>

        {/* Left button */}
        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? slides.length - 1 : prev - 1
            )
          }
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm"
        >
          ❮
        </button>

        {/* Right button */}
        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === slides.length - 1 ? 0 : prev + 1
            )
          }
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm"
        >
          ❯
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-[#49bace] w-5 h-2.5"
                  : "bg-white/40 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;