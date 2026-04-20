"use client"
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Copy } from 'lucide-react';

// --- Types ---
type Brand = 'RAL' | 'Benjamin Moore';

interface PaintColor {
  id: string;
  name: string;
  code: string;
  hex: string;
  brand: Brand;
}

// --- Mock Data (Replace with your actual SaaS database/JSON) ---
const PAINT_COLORS: PaintColor[] =[
  // Benjamin Moore
  { id: 'bm-1', name: 'Chantilly Lace', code: 'OC-65', hex: '#F5F7F2', brand: 'Benjamin Moore' },
  { id: 'bm-2', name: 'Hale Navy', code: 'HC-154', hex: '#464E5A', brand: 'Benjamin Moore' },
  { id: 'bm-3', name: 'Revere Pewter', code: 'HC-172', hex: '#CCC7B8', brand: 'Benjamin Moore' },
  { id: 'bm-4', name: 'Swiss Coffee', code: 'OC-45', hex: '#F1ECE3', brand: 'Benjamin Moore' },
  { id: 'bm-5', name: 'Kendall Charcoal', code: 'HC-166', hex: '#545654', brand: 'Benjamin Moore' },
  { id: 'bm-6', name: 'Aegean Teal', code: '2136-40', hex: '#4F7276', brand: 'Benjamin Moore' },
  // RAL
  { id: 'ral-1', name: 'Pure White', code: 'RAL 9010', hex: '#F1F0EA', brand: 'RAL' },
  { id: 'ral-2', name: 'Anthracite Grey', code: 'RAL 7016', hex: '#383E42', brand: 'RAL' },
  { id: 'ral-3', name: 'Traffic Red', code: 'RAL 3020', hex: '#CC0605', brand: 'RAL' },
  { id: 'ral-4', name: 'Ultramarine Blue', code: 'RAL 5002', hex: '#201370', brand: 'RAL' },
  { id: 'ral-5', name: 'Moss Green', code: 'RAL 6005', hex: '#114232', brand: 'RAL' },
  { id: 'ral-6', name: 'Light Ivory', code: 'RAL 1015', hex: '#E6D9BD', brand: 'RAL' },
];

export default function PaintColorPicker() {
  const [searchQuery, setSearchQuery] = useState('');
  const[activeBrand, setActiveBrand] = useState<Brand | 'All'>('All');
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter colors based on search and selected brand tab
  const filteredColors = useMemo(() => {
    return PAINT_COLORS.filter((color) => {
      const matchesSearch =
        color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = activeBrand === 'All' || color.brand === activeBrand;
      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, activeBrand]);

  // Handle Copy to Clipboard
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 font-sans">
      
      {/* Header & Controls */}
      <div className="max-w-6xl mx-auto mb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Color Library</h1>
          <p className="text-muted-foreground mt-1">Browse and select shades for your current project.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Brand Tabs */}
          <div className="flex bg-muted p-1 rounded-xl w-full md:w-auto">
            {['All', 'Benjamin Moore', 'RAL'].map((brand) => (
              <button
                key={brand}
                onClick={() => setActiveBrand(brand as Brand | 'All')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeBrand === brand
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search color name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid of Swatches */}
      <motion.div 
        layout 
        className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <AnimatePresence>
          {filteredColors.map((color) => (
            <motion.div
              layoutId={`card-${color.id}`}
              key={color.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedColor(color)}
              className="group cursor-pointer rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Color Swatch */}
              <motion.div
                layoutId={`swatch-${color.id}`}
                className="w-full aspect-square"
                style={{ backgroundColor: color.hex }}
              />
              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  {color.brand === 'Benjamin Moore' ? 'BM' : 'RAL'} • {color.code}
                </p>
                <h3 className="text-sm font-bold text-primary truncate leading-tight">
                  {color.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Empty State */}
        {filteredColors.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No colors found matching "{searchQuery}"
          </div>
        )}
      </motion.div>

      {/* Expanded Color Modal */}
      <AnimatePresence>
        {selectedColor && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedColor(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`card-${selectedColor.id}`}
                className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedColor(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full text-primary backdrop-blur-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Big Swatch Area */}
                <motion.div
                  layoutId={`swatch-${selectedColor.id}`}
                  className="w-full h-64 relative"
                  style={{ backgroundColor: selectedColor.hex }}
                />

                {/* Detailed Info */}
                <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                        {selectedColor.brand} • {selectedColor.code}
                      </p>
                      <h2 className="text-3xl font-bold text-primary leading-tight">
                        {selectedColor.name}
                      </h2>
                    </div>
                  </div>

                  {/* Actions / Details */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopyHex(selectedColor.hex)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium border border-border"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : selectedColor.hex}
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Hook this up to your SaaS logic (e.g. Add to project)
                        alert(`Added ${selectedColor.name} to project!`);
                        setSelectedColor(null);
                      }}
                      className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium shadow-sm"
                    >
                      Select Color
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}