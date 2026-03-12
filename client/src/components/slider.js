import React, { useState, useEffect } from "react";
import banner1 from '../pictures/banner1.png';

const Slider = () => {
  const slides = [
    {
      id: 1,
      image: banner1,
    },
    {
      id: 2,
      image: banner1,
    },
    {
      id: 3,
      image: banner1,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-[90%] max-w-screen-xl mx-auto overflow-hidden rounded-md ">
      <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="flex-shrink-0 w-full">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-[180px] object-cover " 
            />
          </div>
        ))}
      </div>
      {/* Navigation Buttons */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        ❮
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
      >
        ❯
      </button>
      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? "bg-[#49bace] scale-125" : "bg-gray-500/50"}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Slider;
