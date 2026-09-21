import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { playHover, playPop } from '../../utils/soundEngine';
import { useBouncyAnimation } from '../../hooks/useBouncyAnimation';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 16)
  magneticPull?: number; // Maximum translation offset in px (default: 12)
  scaleOnHover?: number; // Scale on hover (default: 1.03)
  enableSound?: boolean;
  enableGlare?: boolean;
  bouncyEntrance?: boolean;
  index?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  className = '',
  onClick,
  maxTilt = 16,
  magneticPull = 12,
  scaleOnHover = 1.03,
  enableSound = true,
  enableGlare = true,
  bouncyEntrance = true,
  index,
  delay = 0,
  style = {},
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const bouncy = useBouncyAnimation({
    type: 'card',
    index,
    delay,
    enableHover: false, // Handled dynamically by physics spring
    enableTap: false,
  });

  // Normalized mouse offset from center [-0.5 to 0.5]
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Pixel coordinates within card for dynamic specular light
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Responsive spring physics for a buttery smooth yet snappy feel
  const springConfig = { damping: 18, stiffness: 260, mass: 0.6 };

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Magnetic cursor-following translation
  const transX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-magneticPull, magneticPull]), springConfig);
  const transY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-magneticPull, magneticPull]), springConfig);

  const scale = useSpring(isHovered ? scaleOnHover : 1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);

    const pxX = ((e.clientX - rect.left) / width) * 100;
    const pxY = ((e.clientY - rect.top) / height) * 100;
    glareX.set(pxX);
    glareY.set(pxY);

    // Update CSS variables for .glass-interactive specular highlight
    cardRef.current.style.setProperty('--mouse-x', `${pxX}%`);
    cardRef.current.style.setProperty('--mouse-y', `${pxY}%`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (enableSound) {
      playHover();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = () => {
    if (enableSound) {
      playPop();
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={bouncyEntrance ? bouncy.initial : undefined}
      animate={bouncyEntrance ? bouncy.animate : undefined}
      exit={bouncyEntrance ? bouncy.exit : undefined}
      transition={bouncyEntrance ? bouncy.transition : undefined}
      style={{ perspective: 1200 }}
      className="w-full relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          rotateX,
          rotateY,
          x: transX,
          y: transY,
          scale,
          transformStyle: 'preserve-3d',
          ...style,
        }}
        whileTap={{ scale: 0.98 }}
        className={`glass-interactive cursor-pointer ${className}`}
      >
        {/* Dynamic Specular Light / Glare on 3D plane */}
        {enableGlare && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-20"
          >
            <div
              className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 320px at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.12), rgba(99, 102, 241, 0.08) 40%, transparent 80%)`,
              }}
            />
          </motion.div>
        )}

        {/* Card Content with 3D Depth support */}
        <div style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
