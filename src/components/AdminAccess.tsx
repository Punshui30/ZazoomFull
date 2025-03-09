import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const TOUCH_PATTERN_TIMEOUT = 2000; // 2 seconds
const REQUIRED_TOUCHES = 6;

export function AdminAccess() {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newSequence = [...keySequence, event.key];
      
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }
      
      setKeySequence(newSequence);

      if (newSequence.join(',') === KONAMI_CODE.join(',')) {
        setKeySequence([]);
        navigate('/admin/secret');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence, navigate]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = Date.now();
    
    if (currentTime - lastTouchTime > TOUCH_PATTERN_TIMEOUT) {
      setTouchCount(1);
    } else {
      setTouchCount(prev => prev + 1);
    }
    
    setLastTouchTime(currentTime);

    if (touchCount + 1 === REQUIRED_TOUCHES) {
      setTouchCount(0);
      navigate('/admin/secret');
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 w-32 h-32 z-[60]"
      onClick={handleClick}
      style={{
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        MozUserSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <div className="absolute bottom-0 right-0 text-[#39ff14]/20 text-xs select-none">
        © 2025 ZaZoom
      </div>
    </div>
  );
}