import { ColorScheme } from '../../types';
import { colorPalettes } from '../../constants/colorPalettes';

interface ColorPickerProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => (
  <div className="palette-list">
    {Object.values(ColorScheme).map((scheme) => (
      <button key={scheme} className={scheme === value ? 'palette is-active' : 'palette'} onClick={() => onChange(scheme)} type="button">
        <span>{scheme}</span>
        <span className="swatches">
          {colorPalettes[scheme].slice(0, 4).map((color) => (
            <i key={color} style={{ background: color }} />
          ))}
        </span>
      </button>
    ))}
  </div>
);
