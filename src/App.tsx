import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Check, Palette, SlidersHorizontal, Download, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePalette, Color, PaletteType, getContrastColor } from './lib/colorUtils';

const PALETTE_TYPES: { value: PaletteType; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'monochromatic', label: 'Monochromatic' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'triadic', label: 'Triadic' },
];

export default function App() {
  const [palette, setPalette] = useState<Color[]>([]);
  const [paletteType, setPaletteType] = useState<PaletteType>('analogous');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // Small timeout to allow animation to start
    setTimeout(() => {
      setPalette(generatePalette(paletteType));
      setIsGenerating(false);
    }, 300);
  }, [paletteType]);

  useEffect(() => {
    setPalette(generatePalette(paletteType));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  const copyToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyEntirePalette = () => {
    const hexCodes = palette.map((c) => c.hex).join(', ');
    navigator.clipboard.writeText(hexCodes);
    // Could add a global toast here
  };

  if (palette.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Palette size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">ColorCraft</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
            {PALETTE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setPaletteType(type.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paletteType === type.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Generate</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Palette Type Selector */}
        <div className="md:hidden p-4 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {PALETTE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setPaletteType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  paletteType === type.value
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Palette Display */}
        <div className="flex-1 flex flex-col lg:flex-row w-full h-full">
          <AnimatePresence mode="wait">
            {palette.map((color, index) => {
              const contrastColor = getContrastColor(color.hex);
              return (
                <motion.div
                  key={`${color.hex}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex-1 flex flex-col justify-end lg:justify-center items-center p-6 lg:p-10 relative group cursor-pointer min-h-[150px] lg:min-h-0"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex, index)}
                >
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  
                  {/* Color Info */}
                  <div 
                    className="relative z-10 flex flex-col items-center gap-3 transform lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300"
                    style={{ color: contrastColor }}
                  >
                    <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                      {copiedIndex === index ? <Check size={24} /> : <Copy size={24} />}
                    </button>
                    <div className="text-center">
                      <p className="text-2xl font-bold tracking-wider uppercase">{color.hex}</p>
                      <p className="text-sm opacity-80 font-medium mt-1">
                        HSL({color.hsl[0]}, {color.hsl[1]}%, {color.hsl[2]}%)
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile always visible hex */}
                  <div 
                    className="absolute bottom-6 left-6 lg:hidden font-bold text-xl tracking-wider uppercase"
                    style={{ color: contrastColor }}
                  >
                    {color.hex}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Actions */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono text-gray-700 mx-1">Space</kbd> to generate a new palette
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/NeousAxis/color-palette-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Github size={16} />
            GitHub
          </a>
          <button 
            onClick={copyEntirePalette}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy size={16} />
            Copy All Hex
          </button>
        </div>
      </footer>
    </div>
  );
}
