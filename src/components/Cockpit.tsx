import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import SpaceBackground from './SpaceBackground';
import ControlPanel from './ControlPanel';
import StatusIndicators from './StatusIndicators';

const CockpitContainer = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 20px;
`;

const Title = styled.h1`
  font-family: 'Orbitron', sans-serif;
  color: #00D4FF;
  text-shadow: 0 0 5px #00D4FF;
  font-size: 24px;
  margin-bottom: 10px;
`;

const GameOverScreen = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #FF5733;
  font-family: 'Orbitron', sans-serif;
`;

const GameOverText = styled.h2`
  font-size: 48px;
  text-shadow: 0 0 10px #FF5733;
`;

const RestartButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 18px;
  font-family: 'Orbitron', sans-serif;
  color: #00D4FF;
  background: transparent;
  border: 2px solid #00D4FF;
  border-radius: 5px;
  cursor: pointer;
  text-shadow: 0 0 5px #00D4FF;
  &:hover {
    background: rgba(0, 212, 255, 0.2);
  }
`;

const Cockpit = () => {
  const [speed, setSpeed] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [isLaunched, setIsLaunched] = useState(false);
  const [asteroidsDestroyed, setAsteroidsDestroyed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [naveSpeedBoost, setNaveSpeedBoost] = useState(false);
  const [currentGalaxy, setCurrentGalaxy] = useState<'blue' | 'red' | 'green'>('blue');

  const handleAsteroidDestroyed = () => {
    console.log('Asteroid destruído, pontos:', asteroidsDestroyed + 1);
    setAsteroidsDestroyed((prev) => prev + 1);
  };

  const handleEnergyReduced = (amount: number) => {
    console.log('Energia reduzida em', amount);
    setEnergy((prev) => Math.max(0, prev - amount));
  };

  const handleNavigate = () => {
    if (isLaunched && !naveSpeedBoost) {
      console.log('Navegar: Aumentando velocidade da nave por 5 segundos');
      new Audio('/sounds/boost.mp3').play();
      setNaveSpeedBoost(true);
      setTimeout(() => {
        setNaveSpeedBoost(false);
        console.log('Navegar: Velocidade da nave voltou ao normal');
      }, 5000);
    }
  };

  const handleExplore = () => {
    if (isLaunched && energy >= 20) {
      console.log('Explorar: Mudando de galáxia');
      new Audio('/sounds/transition.mp3').play();
      setEnergy((prev) => prev - 20);
      setCurrentGalaxy((prev) => (prev === 'blue' ? 'red' : prev === 'red' ? 'green' : 'blue'));
    }
  };

  useEffect(() => {
    if (energy <= 0 && isLaunched) {
      console.log('Game Over!');
      setGameOver(true);
      setIsLaunched(false);
    }
  }, [energy, isLaunched]);

  const handleRestart = () => {
    setGameOver(false);
    setEnergy(100);
    setAsteroidsDestroyed(0);
    setSpeed(0);
    setIsLaunched(false);
    setNaveSpeedBoost(false);
    setCurrentGalaxy('blue');
  };

  return (
    <CockpitContainer
      animate={isLaunched ? { x: [0, 5, -5, 0], y: [0, 5, -5, 0] } : { x: 0, y: 0 }}
      transition={isLaunched ? { repeat: Infinity, duration: 0.2 } : { duration: 0 }}
    >
      <SpaceBackground
        speed={speed}
        isLaunched={isLaunched}
        onAsteroidDestroyed={handleAsteroidDestroyed}
        onEnergyReduced={handleEnergyReduced}
        asteroidsDestroyed={asteroidsDestroyed}
        naveSpeedBoost={naveSpeedBoost}
        currentGalaxy={currentGalaxy}
      />
      <StatusIndicators speed={speed} energy={energy} asteroidsDestroyed={asteroidsDestroyed} />
      <Title>Starship Commander</Title>
      <ControlPanel
        isLaunched={isLaunched}
        setIsLaunched={setIsLaunched}
        setSpeed={setSpeed}
        setEnergy={setEnergy}
        onNavigate={handleNavigate}
        onExplore={handleExplore}
        energy={energy}
      />
      {gameOver && (
        <GameOverScreen
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GameOverText>Game Over</GameOverText>
          <p>Asteroides Destruídos: {asteroidsDestroyed}</p>
          <RestartButton onClick={handleRestart}>Reiniciar</RestartButton>
        </GameOverScreen>
      )}
    </CockpitContainer>
  );
};

export default Cockpit;