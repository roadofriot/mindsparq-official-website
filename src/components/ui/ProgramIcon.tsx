import React from 'react';
import { Calculator, Brain, Cpu, PenTool, Sparkles, School } from 'lucide-react';

interface ProgramIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgramIcon: React.FC<ProgramIconProps> = ({ name, size = 24, className, style }) => {
  switch (name) {
    case 'Calculator':
      return <Calculator size={size} className={className} style={style} aria-hidden="true" />;
    case 'Brain':
      return <Brain size={size} className={className} style={style} aria-hidden="true" />;
    case 'Cpu':
      return <Cpu size={size} className={className} style={style} aria-hidden="true" />;
    case 'PenTool':
      return <PenTool size={size} className={className} style={style} aria-hidden="true" />;
    case 'Sparkles':
      return <Sparkles size={size} className={className} style={style} aria-hidden="true" />;
    case 'School':
      return <School size={size} className={className} style={style} aria-hidden="true" />;
    default:
      return <Sparkles size={size} className={className} style={style} aria-hidden="true" />;
  }
};
