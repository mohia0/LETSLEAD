"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComboboxProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function SearchableCombobox({ label, placeholder, options, value, onChange, required }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    const filtered = options.filter(opt => 
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50);
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchQuery(option);
    setIsOpen(false);
  };

  const clearInput = () => {
    onChange('');
    setSearchQuery('');
    setIsOpen(true);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group/input">
        <input 
          type="text" 
          required={required}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-black/40 border border-white/5 text-white rounded-2xl pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 group-hover/input:border-white/10"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {searchQuery && (
            <button 
              type="button" 
              onClick={clearInput}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (filteredOptions.length > 0 || searchQuery) && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute z-[60] w-full mt-2 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar overflow-x-hidden p-2"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <li 
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="px-4 py-2.5 hover:bg-indigo-600/20 hover:text-indigo-300 rounded-xl cursor-pointer text-sm text-slate-300 transition-all flex items-center justify-between group/item"
                >
                  <span className="flex-1 truncate">
                    {opt.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) => 
                      part.toLowerCase() === searchQuery.toLowerCase() ? (
                        <span key={index} className="text-indigo-400 font-bold">{part}</span>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    )}
                  </span>
                  {value === opt && (
                    <motion.div 
                      layoutId="active-dot"
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
                    />
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-[10px] text-slate-500 italic flex items-center space-x-3">
                <Search className="w-3.5 h-3.5 opacity-20" />
                <span>Custom input mode active</span>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
