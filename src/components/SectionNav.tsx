import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const sections = [
  { id: "hero", label: "Home" },
  { id: "features", label: "Features" },
  { id: "demo", label: "Demo" },
  { id: "pricing", label: "Pricing" },
  { id: "cta", label: "Get Started" },
];

export const SectionNav = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // Show nav after scrolling past hero
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Observe each section
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3, rootMargin: "-20% 0px -50% 0px" }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3"
          aria-label="Section navigation"
        >
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="group flex items-center gap-3 justify-end"
              aria-label={`Scroll to ${label}`}
              aria-current={activeSection === id ? "true" : undefined}
            >
              <span
                className={cn(
                  "text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground",
                  activeSection === id && "opacity-100 text-primary"
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300",
                  activeSection === id
                    ? "bg-primary border-primary scale-125"
                    : "bg-transparent border-muted-foreground/50 group-hover:border-primary group-hover:scale-110"
                )}
              />
            </button>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
