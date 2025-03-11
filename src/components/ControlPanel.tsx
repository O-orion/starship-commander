import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const PanelContainer = styled.div`
  position: relative;
  width: 400px;
  padding: 10px;
  background: rgba(26, 31, 61, 0.8);
  border: 2px solid #00D4FF;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const StyledButton = styled(motion.button)<{ disabled?: boolean }>`
  padding: 8px 16px;
  background: ${({ disabled }) => (disabled ? '#6B7280' : 'linear-gradient(45deg, #00D4FF, #1A1F3D)')};
  border: none;
  border-radius: 5px;
  color: #E0E7FF;
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  outline: none;

  &:hover {
    background: ${({ disabled }) => (disabled ? '#6B7280' : 'linear-gradient(45deg, #00D4FF, #6B4E9C)')};
  }
`;

interface ControlPanelProps {
  isLaunched: boolean;
  setIsLaunched: (value: boolean) => void;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  setEnergy: React.Dispatch<React.SetStateAction<number>>;
  onNavigate: () => void;
  onExplore: () => void;
  energy: number;
}

const ControlPanel = ({ isLaunched, setIsLaunched, setSpeed, setEnergy, onNavigate, onExplore, energy }: ControlPanelProps) => {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLaunched) {
      interval = setInterval(() => {
        setSpeed((prev: number) => (prev < 100 ? prev + 10 : 100));
      }, 500);
    } else {
      setSpeed(0);
    }
    return () => clearInterval(interval);
  }, [isLaunched, setSpeed]);

  return (
    <PanelContainer>
      <StyledButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsLaunched(!isLaunched)}
      >
        {isLaunched ? 'Parar' : 'Lançar'}
      </StyledButton>
      <StyledButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNavigate}
        disabled={!isLaunched}
      >
        Navegar
      </StyledButton>
      <StyledButton
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExplore}
        disabled={!isLaunched || energy < 20}
      >
        Explorar
      </StyledButton>
    </PanelContainer>
  );
};

export default ControlPanel;