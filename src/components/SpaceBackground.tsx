import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SpaceContainer = styled.div<{ galaxy: 'blue' | 'red' | 'green' }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: ${({ galaxy }) =>
    galaxy === 'blue'
      ? 'linear-gradient(180deg, #1A1F3D 0%, #6B4E9C 100%)'
      : galaxy === 'red'
      ? 'linear-gradient(180deg, #3D1A1A 0%, #9C4E4E 100%)'
      : 'linear-gradient(180deg, #1A3D1A 0%, #4E9C4E 100%)'};
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

const Asteroid = styled(motion.div)<{ galaxy: 'blue' | 'red' | 'green' }>`
  position: absolute;
  width: 30px;
  height: 30px;
  background: ${({ galaxy }) =>
    galaxy === 'blue'
      ? 'radial-gradient(circle, #A9B2C3 40%, #6B7280 100%)'
      : galaxy === 'red'
      ? 'radial-gradient(circle, #FF5733 40%, #9C2E1A 100%)'
      : 'radial-gradient(circle, #33FF57 40%, #1A9C2E 100%)'};
  border-radius: 50%;
  border: 2px solid ${({ galaxy }) => (galaxy === 'blue' ? '#FF5733' : galaxy === 'red' ? '#FF9C33' : '#57FF33')};
  box-shadow: 0 0 5px rgba(255, 87, 51, 0.8);
`;

const Projectile = styled(motion.div)`
  position: absolute;
  width: 5px;
  height: 10px;
  background: #00D4FF;
  border-radius: 2px;
  box-shadow: 0 0 5px #00D4FF;
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

const PowerUp = styled(motion.div)<{ type: 'energy' | 'rapidFire' }>`
  position: absolute;
  width: 20px;
  height: 20px;
  background: ${({ type }) => (type === 'energy' ? '#00FF00' : '#FFFF00')};
  border-radius: 50%;
  box-shadow: 0 0 5px ${({ type }) => (type === 'energy' ? '#00FF00' : '#FFFF00')};
`;

interface SpaceBackgroundProps {
  speed: number;
  isLaunched: boolean;
  onAsteroidDestroyed?: () => void;
  onEnergyReduced?: (amount: number) => void;
  asteroidsDestroyed: number;
  naveSpeedBoost: boolean;
  currentGalaxy: 'blue' | 'red' | 'green';
}

const SpaceBackground = ({
  speed,
  isLaunched,
  onAsteroidDestroyed,
  onEnergyReduced,
  asteroidsDestroyed,
  naveSpeedBoost,
  currentGalaxy,
}: SpaceBackgroundProps) => {
  const [asteroids, setAsteroids] = useState<
    { id: number; x: number; y: number; isHit?: boolean; reachedBottom?: boolean }[]
  >([]);
  const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [powerUps, setPowerUps] = useState<
    { id: number; x: number; y: number; type: 'energy' | 'rapidFire' }[]
  >([]);
  const [naveX, setNaveX] = useState(50);
  const [rapidFire, setRapidFire] = useState(false);
  const asteroidRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const projectileRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const powerUpRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaunched) {
      const sensitivity = naveSpeedBoost ? 2 : 1;
      const x = (e.clientX / window.innerWidth) * 100 * sensitivity;
      setNaveX(Math.max(0, Math.min(100, x)));
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLaunched) {
      const projectileX = naveX;
      const naveY = 70 * window.innerHeight * 0.01 - 20;
      new Audio('/sounds/shoot.mp3').play();
      setProjectiles((prev) => [
        ...prev,
        { id: Date.now(), x: projectileX, y: naveY },
      ]);
      if (rapidFire) {
        setTimeout(() => {
          setProjectiles((prev) => [
            ...prev,
            { id: Date.now() + 1, x: projectileX, y: naveY },
          ]);
        }, 100);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaunched) {
      console.log('Gerando asteroides...');
      const spawnInterval = Math.max(800, 3000 - asteroidsDestroyed * 50);
      const asteroidsPerSpawn = asteroidsDestroyed > 20 ? 3 : asteroidsDestroyed > 10 ? 2 : 1;

      interval = setInterval(() => {
        const newAsteroids = Array.from({ length: asteroidsPerSpawn }, () => ({
          id: Date.now() + Math.random(),
          x: Math.random() * 90,
          y: -20,
        }));
        setAsteroids((prev) => [...prev, ...newAsteroids]);

        if (Math.random() < 0.1) {
          const type = Math.random() < 0.5 ? 'energy' : 'rapidFire';
          setPowerUps((prev) => [
            ...prev,
            { id: Date.now(), x: Math.random() * 90, y: -20, type },
          ]);
        }
      }, spawnInterval);
    } else {
      setAsteroids([]);
      setProjectiles([]);
      setPowerUps([]);
      setRapidFire(false);
    }
    return () => clearInterval(interval);
  }, [isLaunched, asteroidsDestroyed]);

  useEffect(() => {
    const checkCollisionsAndClean = () => {
      const bottomLimit = window.innerHeight * 0.7;
      let asteroidsUpdated = false;
      let projectilesUpdated = false;
      let powerUpsUpdated = false;
      const asteroidsToKeep = [...asteroids];
      const projectilesToKeep = [...projectiles];
      const powerUpsToKeep = [...powerUps];
      const hitAsteroids = new Set<number>();

      for (let aIndex = asteroidsToKeep.length - 1; aIndex >= 0; aIndex--) {
        const asteroid = asteroidsToKeep[aIndex];
        const asteroidRef = asteroidRefs.current.get(asteroid.id);
        if (!asteroidRef || asteroid.isHit || asteroid.reachedBottom) continue;

        const asteroidRect = asteroidRef.getBoundingClientRect();

        if (asteroidRect.top < 0) continue;

        for (let pIndex = projectilesToKeep.length - 1; pIndex >= 0; pIndex--) {
          const projectile = projectilesToKeep[pIndex];
          const projectileRef = projectileRefs.current.get(projectile.id);
          if (!projectileRef) continue;

          const projectileRect = projectileRef.getBoundingClientRect();

          const distance = Math.sqrt(
            (asteroidRect.x + asteroidRect.width / 2 - (projectileRect.x + projectileRect.width / 2)) ** 2 +
            (asteroidRect.y + asteroidRect.height / 2 - (projectileRect.y + projectileRect.height / 2)) ** 2
          );

          if (distance < 40 && !hitAsteroids.has(asteroid.id)) {
            console.log('Colisão detectada!', { distance, asteroidId: asteroid.id });
            new Audio('/sounds/explosion.mp3').play();
            asteroidsToKeep[aIndex] = { ...asteroid, isHit: true };
            projectilesToKeep.splice(pIndex, 1);
            projectileRefs.current.delete(projectile.id);
            hitAsteroids.add(asteroid.id);
            if (onAsteroidDestroyed) onAsteroidDestroyed();
            asteroidsUpdated = true;
            projectilesUpdated = true;
            break;
          }
        }
      }

      for (let aIndex = asteroidsToKeep.length - 1; aIndex >= 0; aIndex--) {
        const asteroid = asteroidsToKeep[aIndex];
        const asteroidRef = asteroidRefs.current.get(asteroid.id);
        if (!asteroidRef || asteroid.isHit || asteroid.reachedBottom) continue;

        const asteroidRect = asteroidRef.getBoundingClientRect();
        const asteroidBottom = asteroidRect.bottom;

        if (asteroidBottom > bottomLimit) {
          console.log('Asteroide atingiu o fundo:', { id: asteroid.id });
          new Audio('/sounds/explosion.mp3').play();
          asteroidsToKeep[aIndex] = { ...asteroid, reachedBottom: true };
          if (onEnergyReduced) onEnergyReduced(10);
          asteroidsUpdated = true;
        }
      }

      const naveRect = { x: (naveX / 100) * window.innerWidth - 25, y: window.innerHeight * 0.7 - 20, width: 50, height: 30 };
      for (let pIndex = powerUpsToKeep.length - 1; pIndex >= 0; pIndex--) {
        const powerUp = powerUpsToKeep[pIndex];
        const powerUpRef = powerUpRefs.current.get(powerUp.id);
        if (!powerUpRef) continue;

        const powerUpRect = powerUpRef.getBoundingClientRect();
        if (
          powerUpRect.x < naveRect.x + naveRect.width &&
          powerUpRect.x + powerUpRect.width > naveRect.x &&
          powerUpRect.y < naveRect.y + naveRect.height &&
          powerUpRect.y + powerUpRect.height > naveRect.y
        ) {
          console.log('Power-up coletado:', powerUp.type);
          if (powerUp.type === 'energy') {
            onEnergyReduced && onEnergyReduced(-30);
          } else if (powerUp.type === 'rapidFire') {
            setRapidFire(true);
            setTimeout(() => setRapidFire(false), 5000);
          }
          powerUpsToKeep.splice(pIndex, 1);
          powerUpRefs.current.delete(powerUp.id);
          powerUpsUpdated = true;
        }
      }

      if (asteroidsUpdated) setAsteroids(asteroidsToKeep);
      if (projectilesUpdated) setProjectiles(projectilesToKeep);
      if (powerUpsUpdated) setPowerUps(powerUpsToKeep);
    };

    if (isLaunched) {
      const timeout = setTimeout(() => {
        const interval = setInterval(checkCollisionsAndClean, 50);
        return () => clearInterval(interval);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isLaunched, onAsteroidDestroyed, onEnergyReduced, asteroids, projectiles, powerUps, naveX]);

  useEffect(() => {
    const cleanHitAsteroids = () => {
      setAsteroids((prev) => {
        const remainingAsteroids = prev.filter((asteroid) => !asteroid.isHit && !asteroid.reachedBottom);
        prev.forEach((asteroid) => {
          if (asteroid.isHit || asteroid.reachedBottom) asteroidRefs.current.delete(asteroid.id);
        });
        return remainingAsteroids;
      });
    };

    if (isLaunched) {
      const interval = setInterval(cleanHitAsteroids, 300);
      return () => clearInterval(interval);
    }
  }, [isLaunched]);

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

  const asteroidElements = asteroids.map((asteroid) => {
    const animationDuration = Math.max(1.5, 4 - asteroidsDestroyed * 0.05);
    return (
      <Asteroid
        key={asteroid.id}
        galaxy={currentGalaxy}
        ref={(el) => {
          if (el) asteroidRefs.current.set(asteroid.id, el);
        }}
        initial={{ top: asteroid.y }}
        animate={{ top: 70 * window.innerHeight * 0.01 }}
        transition={{ duration: animationDuration, ease: 'linear' }}
        style={{ left: `${asteroid.x}%` }}
        exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.3 } }}
      >
        {(asteroid.isHit || asteroid.reachedBottom) &&
          Array.from({ length: 5 }).map((_, i) => (
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
    );
  });

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

  const powerUpElements = powerUps.map((powerUp) => (
    <PowerUp
      key={powerUp.id}
      type={powerUp.type}
      ref={(el) => {
        if (el) powerUpRefs.current.set(powerUp.id, el);
      }}
      initial={{ top: powerUp.y }}
      animate={{ top: 70 * window.innerHeight * 0.01 }}
      transition={{ duration: 4, ease: 'linear' }}
      style={{ left: `${powerUp.x}%` }}
      onAnimationComplete={() => {
        setPowerUps((prev) => {
          const newPowerUps = prev.filter((p) => p.id !== powerUp.id);
          powerUpRefs.current.delete(powerUp.id);
          return newPowerUps;
        });
      }}
    />
  ));

  return (
    <SpaceContainer galaxy={currentGalaxy} onMouseMove={handleMouseMove} onClick={handleClick}>
      {stars}
      {asteroidElements}
      {projectileElements}
      {powerUpElements}
      <Nave
        style={{ left: `${naveX}%`, transform: 'translateX(-50%)' }}
        animate={{ y: isLaunched ? [0, -5, 0] : 0 }}
        transition={{ y: { repeat: Infinity, duration: 0.5 } }}
      />
    </SpaceContainer>
  );
};

export default SpaceBackground;