import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zazoom_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  try {
    switch (action.type) {
      case 'ADD_ITEM': {
        const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
        
        if (existingItemIndex !== -1) {
          // Create a new array to ensure proper state updates
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          
          newState = {
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          };
        } else {
          const newItems = [...state.items, action.payload];
          newState = {
            items: newItems,
            total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          };
        }
        break;
      }

      case 'REMOVE_ITEM': {
        const newItems = state.items.filter(item => item.id !== action.payload);
        newState = {
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        break;
      }

      case 'UPDATE_QUANTITY': {
        if (action.payload.quantity < 0) {
          throw new Error('Quantity cannot be negative');
        }

        const newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        );

        newState = {
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        break;
      }

      case 'CLEAR_CART':
        newState = {
          items: [],
          total: 0
        };
        break;

      case 'LOAD_CART':
        newState = action.payload;
        break;

      default:
        return state;
    }

    // Save to localStorage after every change
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newState));
    return newState;
  } catch (error) {
    logger.error('Cart state update failed:', error);
    return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && Array.isArray(parsedCart.items)) {
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      }
    } catch (error) {
      logger.error('Failed to load cart:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  const addItem = (item: CartItem) => {
    try {
      if (!item?.id || !item?.name || typeof item?.price !== 'number') {
        throw new Error('Invalid item data');
      }
      dispatch({ type: 'ADD_ITEM', payload: item });
      toast.success(`Added ${item.name} to cart`);
    } catch (error) {
      logger.error('Failed to add item:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeItem = (id: string) => {
    try {
      if (!id) throw new Error('Invalid item ID');
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      toast.success('Item removed from cart');
    } catch (error) {
      logger.error('Failed to remove item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    try {
      if (!id) throw new Error('Invalid item ID');
      if (quantity < 1) {
        removeItem(id);
        return;
      }
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    } catch (error) {
      logger.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem(CART_STORAGE_KEY);
      toast.success('Cart cleared');
    } catch (error) {
      logger.error('Failed to clear cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    items: state.items,
    total: state.total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};