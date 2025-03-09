import React from 'react';
import { Zap, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  const handleShopNow = () => {
    const inventorySection = document.getElementById('inventory');
    if (inventorySection) {
      inventorySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-purple-400/80 font-rajdhani tracking-[0.3em] md:tracking-[0.5em] text-xs mb-8">
            WEST COAST PREMIUM
          </p>
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-bold text-white font-rajdhani tracking-wider mb-8 leading-relaxed">
            PREMIUM<br />
            <span className="text-[#39ff14]">CANNABIS</span><br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-[#39ff14]">DELIVERED</span>
          </h1>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed max-w-xl">
            Experience the finest West Coast cannabis, delivered with style. 
            From order to arrival, we ensure a premium experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              onClick={handleShopNow}
              className="group flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-[#39ff14]/20 hover:from-purple-500/30 hover:to-[#39ff14]/30 text-white px-8 py-4 rounded-lg transition-all duration-300 border border-purple-500/20"
            >
              <ShoppingCart className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform text-[#39ff14]" />
              <span className="font-tech-mono tracking-[0.2em] text-lg">SHOP NOW</span>
            </button>
            <Link
              to="/track"
              className="group flex items-center justify-center bg-transparent text-purple-400/60 hover:text-purple-400 px-8 py-4 rounded-lg transition-all duration-300 border border-purple-500/10 hover:border-purple-500/20"
            >
              <Zap className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform" />
              <span className="font-tech-mono tracking-[0.2em] text-lg">TRACK ORDER</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}