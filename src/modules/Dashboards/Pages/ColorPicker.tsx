import React, { useState, useEffect, useRef, memo } from "react";

const PREDEFINED_COLORS = [
  "#1976d2", "#2196f3", "#03a9f4", "#00bcd4", "#009688",
  "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107",
  "#ff9800", "#ff5722", "#f44336", "#e91e63", "#9c27b0",
  "#673ab7", "#3f51b5", "#607d8b", "#795548", "#000000"
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.min(k - 3, 9 - k, 1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function ColorPickerInner({
  value,
  onChange,
  label,
  className = ""
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(50);
  const [lightness, setLightness] = useState(50);
  /** Lets users type/paste hex without the controlled field snapping back each render. */
  const [hexDraft, setHexDraft] = useState(value || "#000000");
  const [hexFocused, setHexFocused] = useState(false);
  const wasModalOpen = useRef(false);

  useEffect(() => {
    if (value && value.startsWith("#")) {
      const [h, s, l] = hexToHsl(value);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && !wasModalOpen.current) {
      setHexDraft(value || "#000000");
      setHexFocused(false);
    }
    wasModalOpen.current = isOpen;
  }, [isOpen, value]);

  useEffect(() => {
    if (hexFocused) return;
    setHexDraft(value || "#000000");
  }, [value, hexFocused]);

  const handleColorChange = (newHue: number, newSat: number, newLight: number) => {
    setHue(newHue);
    setSaturation(newSat);
    setLightness(newLight);
    onChange(hslToHex(newHue, newSat, newLight));
  };

  const commitHexString = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const normalized = t.startsWith("#") ? t : `#${t}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      const lower = normalized.toLowerCase();
      onChange(lower);
      const [h, s, l] = hexToHsl(lower);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:scale-105 transition-transform cursor-pointer"
          style={{ backgroundColor: value }}
          title="Click to open color picker"
        />
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Seleccionar Color</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div
                  className="w-full h-48 rounded-lg border border-gray-300 relative cursor-crosshair"
                  style={{
                    background: `linear-gradient(to right, white, hsl(${hue}, 100%, 50%)), linear-gradient(to bottom, transparent, black)`
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const newSat = Math.round((x / rect.width) * 100);
                    const newLight = Math.round(100 - (y / rect.height) * 100);
                    handleColorChange(hue, Math.max(0, Math.min(100, newSat)), Math.max(0, Math.min(100, newLight)));
                  }}
                >
                  <div
                    className="absolute w-3 h-3 border-2 border-white rounded-full pointer-events-none shadow-lg"
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - lightness}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Matiz</label>
                <div className="relative">
                  <div
                    className="w-full h-6 rounded border border-gray-300 cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const newHue = Math.round((x / rect.width) * 360);
                      handleColorChange(newHue, saturation, lightness);
                    }}
                  />
                  <div
                    className="absolute top-0 w-2 h-6 border-2 border-white rounded pointer-events-none shadow-lg"
                    style={{
                      left: `${(hue / 360) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Matiz</label>
                  <input
                    type="number"
                    value={Math.round(hue)}
                    onChange={(e) => handleColorChange(Number(e.target.value), saturation, lightness)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    min="0"
                    max="360"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Saturación</label>
                  <input
                    type="number"
                    value={Math.round(saturation)}
                    onChange={(e) => handleColorChange(hue, Number(e.target.value), lightness)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Luminosidad</label>
                  <input
                    type="number"
                    value={Math.round(lightness)}
                    onChange={(e) => handleColorChange(hue, saturation, Number(e.target.value))}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Color HEX</label>
                <input
                  type="text"
                  value={hexDraft}
                  spellCheck={false}
                  autoComplete="off"
                  onFocus={() => setHexFocused(true)}
                  onChange={(e) => {
                    const next = e.target.value;
                    setHexDraft(next);
                    const t = next.trim();
                    const normalized = t.startsWith("#") ? t : t.length ? `#${t}` : "";
                    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
                      commitHexString(normalized);
                    }
                  }}
                  onBlur={() => {
                    setHexFocused(false);
                    const t = hexDraft.trim();
                    const normalized = t.startsWith("#") ? t : t.length ? `#${t}` : "";
                    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
                      commitHexString(normalized);
                      setHexDraft(normalized.toLowerCase());
                    } else {
                      setHexDraft(value || "#000000");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 font-mono"
                  placeholder="#000000"
                />
                <p className="text-xs text-gray-500 mt-1">Formato: #RRGGBB (6 dígitos hexadecimales)</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Colores predefinidos</label>
                <div className="grid grid-cols-10 gap-1">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${value === color ? 'border-gray-800 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onChange(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ColorPicker = memo(ColorPickerInner);
