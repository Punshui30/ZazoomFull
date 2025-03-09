import React, { useState } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Navigation() {
  const { items, total } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCartOpen(!isCartOpen);
  };

  // Close cart when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setIsCartOpen(false);
    if (isCartOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isCartOpen]);

  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-[#39ff14]/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="https://imgur.com/fLZMeh7.jpg"
              alt="ZaZoom"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <span className="text-white font-bold text-xl md:text-2xl font-syncopate">
                ZAZOOM
              </span>
              <p className="text-[#39ff14]/70 text-xs hidden sm:block">
                Cannabis Delivery
              </p>
            </div>
          </Link>
          
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#39ff14]/50" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50 focus:ring-1 focus:ring-[#39ff14]/20"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#39ff14]"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={toggleCart}
                className="relative p-2 text-[#39ff14] hover:bg-[#39ff14]/10 rounded-lg transition-all duration-300 hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#39ff14] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Cart Preview Dropdown */}
              {isCartOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-sm rounded-lg shadow-lg border border-[#39ff14]/20 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <h3 className="text-[#39ff14] font-bold mb-4">Shopping Cart</h3>
                    {items.length === 0 ? (
                      <p className="text-[#39ff14]/70 text-center py-4">Your cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-black/30 rounded">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[#39ff14] text-sm truncate">{item.name}</p>
                                <p className="text-[#39ff14]/70 text-xs">
                                  {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#39ff14]/20">
                          <div className="flex justify-between text-[#39ff14] mb-4">
                            <span>Total:</span>
                            <span className="font-bold">${total.toFixed(2)}</span>
                          </div>
                          <Link
                            to="/checkout"
                            onClick={() => setIsCartOpen(false)}
                            className="block w-full bg-[#39ff14]/20 text-[#39ff14] text-center py-2 rounded-lg hover:bg-[#39ff14]/30 transition-colors"
                          >
                            Checkout
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#39ff14]/10 py-4">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#39ff14]/50" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
                />
              </div>

              {/* Mobile Cart */}
              <Link
                to="/checkout"
                className="flex items-center justify-between p-2 text-[#39ff14] hover:bg-[#39ff14]/10 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                </span>
                {itemCount > 0 && (
                  <span className="bg-[#39ff14] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}