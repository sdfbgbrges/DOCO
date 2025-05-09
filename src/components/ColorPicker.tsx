import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  colors: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, colors }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          className={`h-8 w-8 rounded-full flex items-center justify-center ${
            color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' : ''
          }`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
};

export default ColorPicker;