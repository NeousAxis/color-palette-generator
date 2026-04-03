export type Color = {
  hex: string;
  hsl: [number, number, number]; // h: 0-360, s: 0-100, l: 0-100
};

export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const hexToHsl = (hex: string): [number, number, number] => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const generateRandomColor = (): Color => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 60) + 40; // 40-100%
  const l = Math.floor(Math.random() * 60) + 20; // 20-80%
  return { hex: hslToHex(h, s, l), hsl: [h, s, l] };
};

export type PaletteType = 'random' | 'monochromatic' | 'analogous' | 'complementary' | 'triadic';

export const generatePalette = (type: PaletteType): Color[] => {
  const baseColor = generateRandomColor();
  const [h, s, l] = baseColor.hsl;
  const palette: Color[] = [baseColor];

  if (type === 'random') {
    for (let i = 0; i < 4; i++) palette.push(generateRandomColor());
  } else if (type === 'monochromatic') {
    // Generate variations in lightness
    const lightnessSteps = [15, 30, 45, 60, 75, 85].filter(step => Math.abs(step - l) > 10);
    // Shuffle and pick 4
    const shuffledSteps = lightnessSteps.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    for (let i = 0; i < 4; i++) {
        let newL = shuffledSteps[i] || (l + (i+1) * 15) % 100;
        palette.push({ hex: hslToHex(h, s, newL), hsl: [h, s, newL] });
    }
  } else if (type === 'analogous') {
    // Colors next to each other on the color wheel
    for (let i = 1; i <= 4; i++) {
      const newH = (h + i * 30) % 360;
      palette.push({ hex: hslToHex(newH, s, l), hsl: [newH, s, l] });
    }
  } else if (type === 'complementary') {
    // Base, Complementary, and variations of them
    const compH = (h + 180) % 360;
    palette.push({ hex: hslToHex(compH, s, l), hsl: [compH, s, l] });
    palette.push({ hex: hslToHex(h, Math.max(20, s - 30), Math.min(90, l + 20)), hsl: [h, Math.max(20, s - 30), Math.min(90, l + 20)] });
    palette.push({ hex: hslToHex(compH, Math.max(20, s - 30), Math.max(10, l - 20)), hsl: [compH, Math.max(20, s - 30), Math.max(10, l - 20)] });
    palette.push({ hex: hslToHex(h, s, Math.max(10, l - 30)), hsl: [h, s, Math.max(10, l - 30)] });
  } else if (type === 'triadic') {
    const h2 = (h + 120) % 360;
    const h3 = (h + 240) % 360;
    palette.push({ hex: hslToHex(h2, s, l), hsl: [h2, s, l] });
    palette.push({ hex: hslToHex(h3, s, l), hsl: [h3, s, l] });
    palette.push({ hex: hslToHex(h, Math.max(20, s - 30), Math.min(90, l + 20)), hsl: [h, Math.max(20, s - 30), Math.min(90, l + 20)] });
    palette.push({ hex: hslToHex(h2, s, Math.max(10, l - 20)), hsl: [h2, s, Math.max(10, l - 20)] });
  }

  // Sort by lightness for a better visual flow
  return palette.sort((a, b) => b.hsl[2] - a.hsl[2]);
};

export const getContrastColor = (hex: string): string => {
  const [h, s, l] = hexToHsl(hex);
  return l > 60 ? '#111827' : '#F9FAFB'; // dark gray or light gray based on lightness
};
