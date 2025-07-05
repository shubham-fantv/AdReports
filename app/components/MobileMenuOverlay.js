"use client";

import { useMobileMenu } from "../contexts/MobileMenuContext";

export default function MobileMenuOverlay() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();

  if (!isMobileMenuOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );
}