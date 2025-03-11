import React, { useState } from 'react';
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

const Cockpit = () => {
  const [speed, setSpeed] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [isLaunched, setIsLaunched] = useState(false);
  const [asteroidsDestroyed, setAsteroidsDestroyed] = useState(0);

  const handleAsteroidDestroyed = () => {
    setAsteroidsDestroyed((prev) => prev + 1);
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
      />
      <StatusIndicators speed={speed} energy={energy} asteroidsDestroyed={asteroidsDestroyed} />
      <Title>Starship Commander</Title>
      <ControlPanel
        isLaunched={isLaunched}
        setIsLaunched={setIsLaunched}
        setSpeed={setSpeed}
        setEnergy={setEnergy}
      />
    </CockpitContainer>
  );
};

export default Cockpit;