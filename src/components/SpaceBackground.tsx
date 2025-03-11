import React, { useState, useEffect, useRef } from 'react';
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
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #A9B2C3 40%, #6B7280 100%);
  border-radius: 50%;
  border: 2px solid #FF5733;
  box-shadow: 0 0 5px rgba(255, 87, 51, 0.8);
`;

const Projectile = styled(motion.div)`
  position: absolute;
  width: 5px;
  height: 10px;
  background: #00D4FF;
  border-radius: 2px;
  box-shadow: 0 0 5px #00D4FF; /* Brilho no projétil */
`;

const Nave = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  width: 50px;
  height: 30px;
  background: linear-gradient(45deg, #00D4FF, #00A3CC);
  clip-path: polygon(50% 0%, 100% 70%, 80% 100%, 20% 100%, 0% 70%);
  box-shadow: 0 0 10px #00D4FF;
`;

const ExplosionParticle = styled(motion.div)`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #FF5733;
  border-radius: 50%;
  box-shadow: 0 0 3px #FF5733;
`;

interface SpaceBackgroundProps {
  speed: number;
  isLaunched: boolean;
  onAsteroidDestroyed?: () => void;
  onEnergyReduced?: (amount: number) => void;
}

const SpaceBackground = ({ speed, isLaunched, onAsteroidDestroyed, onEnergyReduced }: SpaceBackgroundProps) => {
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number }[]>([]);
  const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [naveX, setNaveX] = useState(50);
  const asteroidRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const projectileRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaunched) {
      const x = (e.clientX / window.innerWidth) * 100;
      setNaveX(Math.max(0, Math.min(100, x)));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLaunched) {
      const projectileX = naveX;
      const naveY = 70 * window.innerHeight * 0.01 - 20;
      setProjectiles((prev) => [
        ...prev,
        { id: Date.now(), x: projectileX, y: naveY },
      ]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaunched) {
      console.log('Gerando asteroides...');
      interval = setInterval(() => {
        setAsteroids((prev) => [
          ...prev,
          { id: Date.now(), x: Math.random() * 90, y: -20 },
        ]);
      }, 3000);
    } else {
      setAsteroids([]);
      setProjectiles([]);
    }
    return () => clearInterval(interval);
  }, [isLaunched]);

  useEffect(() => {
    const checkCollisionsAndClean = () => {
      setAsteroids((prevAsteroids) => {
        const asteroidsToKeep = prevAsteroids.filter((asteroid) => {
          const bottomLimit = 70 * window.innerHeight * 0.01;
          if (asteroid.y >= bottomLimit) {
            if (onEnergyReduced) {
              console.log('Asteroide atingiu o fundo, reduzindo energia');
              onEnergyReduced(10);
            }
            asteroidRefs.current.delete(asteroid.id);
            return false;
          }
          return true;
        });

        setProjectiles((prevProjectiles) => {
          const projectilesToKeep = [...prevProjectiles];

          for (let aIndex = asteroidsToKeep.length - 1; aIndex >= 0; aIndex--) {
            const asteroid = asteroidsToKeep[aIndex];
            const asteroidRef = asteroidRefs.current.get(asteroid.id);
            if (!asteroidRef) continue;

            const asteroidRect = asteroidRef.getBoundingClientRect();

            for (let pIndex = projectilesToKeep.length - 1; pIndex >= 0; pIndex--) {
              const projectile = projectilesToKeep[pIndex];
              const projectileRef = projectileRefs.current.get(projectile.id);
              if (!projectileRef) continue;

              const projectileRect = projectileRef.getBoundingClientRect();

              const distance = Math.sqrt(
                (asteroidRect.x + asteroidRect.width / 2 - (projectileRect.x + projectileRect.width / 2)) ** 2 +
                (asteroidRect.y + asteroidRect.height / 2 - (projectileRect.y + projectileRect.height / 2)) ** 2
              );

              if (distance < 40) {
                console.log('Colisão detectada!', { distance });
                asteroidsToKeep.splice(aIndex, 1);
                projectilesToKeep.splice(pIndex, 1);
                asteroidRefs.current.delete(asteroid.id);
                projectileRefs.current.delete(projectile.id);
                if (onAsteroidDestroyed) {
                  console.log('onAsteroidDestroyed chamado');
                  onAsteroidDestroyed();
                }
                break;
              }
            }
          }

          return projectilesToKeep;
        });
        return asteroidsToKeep;
      });
    };

    if (isLaunched) {
      const interval = setInterval(checkCollisionsAndClean, 50);
      return () => clearInterval(interval);
    }
  }, [isLaunched, onAsteroidDestroyed, onEnergyReduced]);

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
      ref={(el) => {
        if (el) asteroidRefs.current.set(asteroid.id, el);
      }}
      initial={{ top: asteroid.y }}
      animate={{ top: 70 * window.innerHeight * 0.01 }}
      transition={{ duration: 4, ease: 'linear' }}
      style={{ left: `${asteroid.x}%` }}
      exit={{
        scale: 1.5,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
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

  const projectileElements = projectiles.map((projectile) => (
    <Projectile
      key={projectile.id}
      ref={(el) => {
        if (el) projectileRefs.current.set(projectile.id, el);
      }}
      initial={{ top: projectile.y, left: `${projectile.x}%`, transform: 'translateX(-50%)' }}
      animate={{ top: -20 }}
      transition={{ duration: 1, ease: 'linear' }}
      onAnimationComplete={() => {
        setProjectiles((prev) => {
          const newProjectiles = prev.filter((p) => p.id !== projectile.id);
          projectileRefs.current.delete(projectile.id);
          return newProjectiles;
        });
      }}
    />
  ));

  return (
    <SpaceContainer onMouseMove={handleMouseMove} onClick={handleClick}>
      {stars}
      {asteroidElements}
      {projectileElements}
      <Nave
        style={{ left: `${naveX}%`, transform: 'translateX(-50%)' }}
        animate={{ y: isLaunched ? [0, -5, 0] : 0 }}
        transition={{ y: { repeat: Infinity, duration: 0.5 } }}
      />
    </SpaceContainer>
  );
};

export default SpaceBackground;