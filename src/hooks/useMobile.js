/**
 * Mobile utilities and hooks for touch gestures and mobile optimization
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Hook for detecting mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

// Hook for touch gestures
export function useSwipeGesture(onSwipeLeft, onSwipeRight, threshold = 50) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

// Hook for network speed detection
export function useNetworkSpeed() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const checkConnection = () => {
        // Consider 2G and slow-2g as slow connections
        const slowConnections = ['slow-2g', '2g'];
        setIsSlowConnection(
          slowConnections.includes(connection.effectiveType) ||
          connection.downlink < 1.5
        );
      };

      checkConnection();
      connection.addEventListener('change', checkConnection);
      
      return () => connection.removeEventListener('change', checkConnection);
    }
  }, []);

  return isSlowConnection;
}

// Hook for viewport height (handles mobile browser address bar)
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const updateHeight = () => {
      // Use window.innerHeight for mobile to account for address bar
      setViewportHeight(`${window.innerHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return viewportHeight;
}

// Hook for pull-to-refresh gesture
export function usePullToRefresh(onRefresh, threshold = 100) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [isPulling, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= threshold) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isTriggered: pullDistance >= threshold,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

// Utility function to optimize images for mobile
export function getOptimizedImageSrc(src, width, quality = 75) {
  if (!src) return '';
  
  // If using Next.js Image optimization
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString()
  });
  
  return `/_next/image?${params.toString()}`;
}

// Utility function to detect if user prefers reduced motion
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Mobile-optimized button component
export function TouchButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 touch-manipulation
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
  };

  const sizes = {
    small: 'px-3 py-2 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[52px]'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-optimized input component
export function TouchInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3 text-base border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
        min-h-[44px] touch-manipulation
        ${className}
      `}
      {...props}
    />
  );
}

// Mobile navigation helper
export function useMobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, closeMenu]);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu
  };
}
