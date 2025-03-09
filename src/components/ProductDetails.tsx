import React from 'react';
import { Shield, Truck, Clock } from 'lucide-react';

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string;
    image: string;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg shadow-lg shadow-green-500/20 p-6 border border-green-500/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-lg overflow-hidden border border-green-500/20">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-green-500">{product.name}</h1>
            <p className="mt-2 text-xl text-green-400">${product.price.toFixed(2)}</p>
          </div>
          
          <p className="text-green-400/80">{product.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center text-green-400">
              <Shield className="w-5 h-5 mr-2" />
              <span>Secure Transaction</span>
            </div>
            <div className="flex items-center text-green-400">
              <Truck className="w-5 h-5 mr-2" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center text-green-400">
              <Clock className="w-5 h-5 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
          
          <button className="w-full bg-green-500/20 text-green-400 py-3 px-4 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/20">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}