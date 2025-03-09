import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Filter, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

// Placeholder data
const PLACEHOLDER_PRODUCTS = [
  // Flowers
  {
    id: '1',
    name: 'Purple Haze',
    description: 'Classic sativa strain with sweet berry aroma and energetic effects',
    price: 45.99,
    quantity: 100,
    category: 'flowers',
    thc_content: '22%',
    cbd_content: '1%',
    strain_type: 'Sativa',
    image: 'https://source.unsplash.com/800x600/?cannabis-flower,purple'
  },
  {
    id: '2',
    name: 'OG Kush',
    description: 'Legendary hybrid with earthy pine scent and relaxing effects',
    price: 49.99,
    quantity: 100,
    category: 'flowers',
    thc_content: '24%',
    cbd_content: '0.5%',
    strain_type: 'Hybrid',
    image: 'https://source.unsplash.com/800x600/?cannabis-flower,kush'
  },
  // Edibles
  {
    id: '3',
    name: 'Cosmic Brownies',
    description: 'Rich chocolate brownies with precise dosing',
    price: 24.99,
    quantity: 50,
    category: 'edibles',
    thc_content: '10mg/piece',
    cbd_content: '0mg',
    strain_type: 'Hybrid',
    image: 'https://source.unsplash.com/800x600/?brownies,chocolate'
  },
  {
    id: '4',
    name: 'Galaxy Gummies',
    description: 'Fruit-flavored gummies for controlled microdosing',
    price: 19.99,
    quantity: 75,
    category: 'edibles',
    thc_content: '5mg/piece',
    cbd_content: '5mg',
    strain_type: 'Hybrid',
    image: 'https://source.unsplash.com/800x600/?gummies,candy'
  },
  // Concentrates
  {
    id: '5',
    name: 'Diamond Dust',
    description: 'High-purity THC crystals with intense effects',
    price: 89.99,
    quantity: 30,
    category: 'concentrates',
    thc_content: '99%',
    cbd_content: '0%',
    strain_type: 'Hybrid',
    image: 'https://source.unsplash.com/800x600/?crystals,diamond'
  },
  {
    id: '6',
    name: 'Nebula Shatter',
    description: 'Glass-like concentrate with cosmic potency',
    price: 69.99,
    quantity: 40,
    category: 'concentrates',
    thc_content: '85%',
    cbd_content: '0%',
    strain_type: 'Sativa',
    image: 'https://source.unsplash.com/800x600/?glass,amber'
  },
  // Pre-Rolls
  {
    id: '7',
    name: 'Meteor Shower',
    description: 'Pack of 5 premium pre-rolled joints',
    price: 29.99,
    quantity: 60,
    category: 'pre-rolls',
    thc_content: '25%',
    cbd_content: '1%',
    strain_type: 'Sativa',
    image: 'https://source.unsplash.com/800x600/?joint,roll'
  },
  {
    id: '8',
    name: 'Black Hole',
    description: 'Extra-large pre-roll infused with kief',
    price: 19.99,
    quantity: 80,
    category: 'pre-rolls',
    thc_content: '30%',
    cbd_content: '0.5%',
    strain_type: 'Indica',
    image: 'https://source.unsplash.com/800x600/?smoke,dark'
  },
  // Accessories
  {
    id: '9',
    name: 'Quantum Grinder',
    description: 'Premium 4-piece aerospace aluminum grinder',
    price: 39.99,
    quantity: 25,
    category: 'accessories',
    thc_content: 'N/A',
    cbd_content: 'N/A',
    strain_type: 'N/A',
    image: 'https://source.unsplash.com/800x600/?grinder,metal'
  },
  {
    id: '10',
    name: 'Gravity Bong',
    description: 'Scientific glass water pipe with percolator',
    price: 149.99,
    quantity: 15,
    category: 'accessories',
    thc_content: 'N/A',
    cbd_content: 'N/A',
    strain_type: 'N/A',
    image: 'https://source.unsplash.com/800x600/?glass,pipe'
  }
];

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { addItem } = useCart();

  // Listen for real-time inventory updates
  useWebSocket(['inventory_update'], (event) => {
    if (event.type === 'inventory_update') {
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === event.data.id ? { ...product, ...event.data } : product
        )
      );
      
      // Show toast notification for low stock
      if (event.data.quantity <= 5) {
        toast.warning(`Low stock alert: ${event.data.name}`);
      }
    }
  });

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'flowers', name: 'Flowers' },
    { id: 'edibles', name: 'Edibles' },
    { id: 'concentrates', name: 'Concentrates' },
    { id: 'pre-rolls', name: 'Pre-Rolls' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const filteredProducts = PLACEHOLDER_PRODUCTS
    .filter(product => 
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      (searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleAddToCart = (product: any) => {
    try {
      if (!product?.id || !product?.name || typeof product?.price !== 'number') {
        throw new Error('Invalid product data');
      }

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image || ''
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div id="inventory" className="max-w-[2000px] mx-auto px-4 py-12 scroll-mt-20">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
          style={{ 
            objectPosition: 'center center',
            opacity: 0.6
          }}
        >
          <source src="https://imgur.com/wE948ot.mp4" type="video/mp4" />
        </video>
        
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(57, 255, 20, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(57, 255, 20, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-scroll 20s linear infinite'
          }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      <div className="relative z-10">
        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#39ff14] font-syncopate tracking-wider">
              Our Products
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto max-w-2xl">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#39ff14]/50" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-3 pl-10 pr-4 text-[#39ff14] placeholder-[#39ff14]/50 focus:outline-none focus:border-[#39ff14]/50"
                />
              </div>
              
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#39ff14]/50" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/30 border border-[#39ff14]/20 rounded-lg py-3 pl-10 pr-4 text-[#39ff14] focus:outline-none focus:border-[#39ff14]/50 appearance-none"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 font-syncopate tracking-wider text-sm ${
                  selectedCategory === category.id
                    ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/20'
                    : 'bg-black/30 text-[#39ff14]/70 hover:text-[#39ff14] border border-transparent'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden border border-[#39ff14]/20 hover:border-[#39ff14]/40 transition-all duration-300 hover:transform hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {product.strain_type && product.strain_type !== 'N/A' && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-[#39ff14] text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      {product.strain_type}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#39ff14] mb-2">{product.name}</h3>
                  <p className="text-[#39ff14]/70 text-sm line-clamp-2">{product.description}</p>
                </div>
                
                {(product.thc_content !== 'N/A' || product.cbd_content !== 'N/A') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-black/30 rounded-lg">
                      <span className="text-[#39ff14]/70 text-xs block mb-1">THC</span>
                      <p className="text-[#39ff14] font-bold">{product.thc_content}</p>
                    </div>
                    <div className="text-center p-3 bg-black/30 rounded-lg">
                      <span className="text-[#39ff14]/70 text-xs block mb-1">CBD</span>
                      <p className="text-[#39ff14] font-bold">{product.cbd_content}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-[#39ff14]/10">
                  <span className="text-2xl font-bold text-[#39ff14]">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity === 0}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
                      product.quantity === 0
                        ? 'bg-red-900/50 text-red-400 cursor-not-allowed'
                        : 'bg-[#39ff14]/20 text-[#39ff14] hover:bg-[#39ff14]/30'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}