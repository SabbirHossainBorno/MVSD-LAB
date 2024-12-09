'use client'; // Ensure this directive is at the top

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[99]">
      {isVisible && (
        <div
          onClick={scrollToTop}
          aria-label="scroll to top"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 text-white shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
          <span
            className="h-4 w-4 rotate-45 border-t-2 border-l-2 border-white"
            style={{ marginTop: "4px" }}
          ></span>
        </div>
      )}
    </div>
  );
}
