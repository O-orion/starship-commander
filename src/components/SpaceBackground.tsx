import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SpaceContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(180deg, #1A1F3D 0%, #6B4E9C 100%);
  overflow: hidden;
`;

const Star = styled.div<{ speed: number }>`
  position: absolute;
  width: 2px;
  height: 2px;
  background: #E0E7FF;
  border-radius: 50%;
  animation: moveStar ${(props) => 2 / (props.speed / 100 + 0.1)}s linear infinite;

  @keyframes moveStar {
    0% {
      transform: translateY(-10vh);
    }
    100% {
      transform: translateY(70vh);
    }
  }
`;

const Asteroid = styled(motion.div)`
  position: absolute;
  width: 20px;
  height: 20px;
  background: #A9B2C3;
  border-radius: 50%;
  border: 2px solid #FF5733;
  cursor: pointer;
`;

const ExplosionParticle = styled(motion.div)`
  position: absolute;
  width: 5px;
  height: 5px;
  background: #FF5733;
  border-radius: 50%;
`;

const Nave = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 20px;
  background: #00D4FF;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%); /* Triângulo */
`;

interface SpaceBackgroundProps {
  speed: number;
  isLaunched: boolean;
  onAsteroidDestroyed?: () => void; // Destruição dos asteroides
}

const SpaceBackground = ({ speed, isLaunched, onAsteroidDestroyed }: SpaceBackgroundProps) => {
  const [asteroids, setAsteroids] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaunched) {
      interval = setInterval(() => {
        setAsteroids((prev) => {
          if (prev.length < 5) {
            return [...prev, { id: Date.now(), x: Math.random() * 90 }];
          }
          return prev;
        });
      }, 3000);
    } else {
      setAsteroids([]);
    }
    return () => clearInterval(interval);
  }, [isLaunched]);

  const handleAsteroidClick = (id: number) => {
    setAsteroids((prev) => prev.filter((asteroid) => asteroid.id !== id));
    if (onAsteroidDestroyed) onAsteroidDestroyed(); // Chama a callback ao destruir
  };

  const stars = Array.from({ length: 30 }, (_, i) => (
    <Star
      key={i}
      speed={speed}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
      }}
    />
  ));

  const asteroidElements = asteroids.map((asteroid) => (
    <Asteroid
      key={asteroid.id}
      initial={{ y: -20 }}
      animate={{ y: 70 * window.innerHeight * 0.01 }}
      transition={{ duration: 4, ease: 'linear' }}
      style={{ left: `${asteroid.x}%` }}
      onClick={() => handleAsteroidClick(asteroid.id)}
      exit={{
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      {/* Partículas de explosão */}
      {Array.from({ length: 5 }).map((_, i) => (
        <ExplosionParticle
          key={i}
          initial={{ x: 0, y: 0 }}
          animate={{
            x: Math.cos((i * 2 * Math.PI) / 5) * 20,
            y: Math.sin((i * 2 * Math.PI) / 5) * 20,
            opacity: 0,
          }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </Asteroid>
  ));

  return <SpaceContainer>
    {stars}
  {asteroidElements}
  <Nave
      animate={isLaunched ? { y: [0, -5, 0] } : { y: 0 }}
      transition={{ repeat: Infinity, duration: 0.5 }}
    />
  </SpaceContainer>;
};

export default SpaceBackground;