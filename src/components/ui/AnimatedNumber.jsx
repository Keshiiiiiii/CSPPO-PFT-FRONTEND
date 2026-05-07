import { useState, useEffect } from 'react';

export default function AnimatedNumber({ value, duration = 900 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const endValue = typeof value === 'number' ? value : parseInt(value, 10) || 0;
    
    // Fallback if value is 0 or less, no need to animate
    if (endValue <= 0) {
      setCount(endValue);
      return;
    }

    // Easing function for smooth deceleration
    const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      
      const current = endValue * easeOutExpo(percent);
      setCount(Math.floor(current));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return <>{count}</>;
}
