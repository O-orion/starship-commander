import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const IndicatorsContainer = styled.div`
  position: absolute;
  top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
`;

const Indicator = styled(motion.div)`
  width: 120px;
  padding: 10px;
  background: rgba(26, 31, 61, 0.6);
  border: 1px solid #00D4FF;
  border-radius: 8px;
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  color: #E0E7FF;
  text-shadow: 0 0 3px #00D4FF;
  font-size: 12px;
`;

const ProgressBar = styled.div<{ value: number }>`
  width: 100%;
  height: 8px;
  background: #1A1F3D;
  border-radius: 5px;
  margin-top: 5px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${(props) => props.value}%;
    height: 100%;
    background: linear-gradient(90deg, #00D4FF, #6B4E9C);
    transition: width 0.3s ease;
  }
`;

// prop para pontuação
interface StatusIndicatorsProps {
  speed: number;
  energy: number;
  asteroidsDestroyed: number; 
}

const StatusIndicators = ({ speed, energy, asteroidsDestroyed }: StatusIndicatorsProps) => {
  return (
    <IndicatorsContainer>
      <Indicator>
        <div>Velocidade</div>
        <ProgressBar value={speed} />
        <div>{speed}%</div>
      </Indicator>
      <Indicator>
        <div>Energia</div>
        <ProgressBar value={energy} />
        <div>{energy}%</div>
      </Indicator>
      <Indicator>
        <div>Asteroides</div>
        <div>{asteroidsDestroyed}</div>
      </Indicator>
    </IndicatorsContainer>
  );
};

export default StatusIndicators;