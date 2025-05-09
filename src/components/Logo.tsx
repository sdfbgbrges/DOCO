import React from 'react';
import { FileText } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return <FileText className={className} color="#3B82F6" />;
};

export default Logo;