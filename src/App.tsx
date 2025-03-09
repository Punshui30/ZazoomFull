import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { Inventory } from './components/Inventory';
import { Cart } from './components/Cart';
import { AdminAccess } from './components/AdminAccess';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/admin/AdminLogin';
import { SecretPortal } from './components/admin/SecretPortal';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
              style={{ 
                objectPosition: 'center center',
                opacity: 0.4
              }}
            >
              <source src="https://imgur.com/wE948ot.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Background Gradient */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(128,0,255,0.1) 50%, rgba(57,255,20,0.1) 100%)'
            }}
          />

          {/* Animated Grid */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(128,0,255,0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(57,255,20,0.2) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-scroll 20s linear infinite'
            }}
          />
        </div>

        <div className="relative z-10">
          <Navigation />
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'bg-black/90 text-[#39ff14] border border-[#39ff14]/20',
              duration: 3000
            }}
          />
          
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
                  <Inventory />
                  <Cart />
                </div>
              </>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/secret" element={<SecretPortal />} />
            <Route path="/admin/*" element={<AdminPanel />} />
          </Routes>

          <footer className="relative z-20 bg-black/50 backdrop-blur-sm border-t border-purple-500/20 py-8 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-purple-400 font-bold mb-4 uppercase tracking-wider">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/track" className="text-[#39ff14]/70 hover:text-[#39ff14] text-sm">
                        Track Order
                      </a>
                    </li>
                    <li>
                      <a href="/support" className="text-[#39ff14]/70 hover:text-[#39ff14] text-sm">
                        Support
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-purple-400/70 text-sm font-bold uppercase tracking-widest">
                    West Coast Premium
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <AdminAccess />
      </div>
    </ErrorBoundary>
  );
}

export default App;