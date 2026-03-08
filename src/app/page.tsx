"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Download, Trash, Search, Database, 
  CheckCircle, Star, Globe, Facebook, Instagram, Linkedin, Twitter,
  History, Zap, X, CheckSquare, Square, Mail, Phone, Share2,
  Maximize2, Minimize2, Filter, ChevronDown
} from 'lucide-react';
import { SearchableCombobox } from '@/components/Combobox';
import { INDUSTRIES, COUNTRIES, GEOGRAPHY } from '@/lib/constants';

interface LogMessage {
  jobId: string;
  type: string;
  level?: 'INFO' | 'ACTION' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message?: string;
  payload?: any;
  timestamp: string;
}

interface Lead {
  id: string; 
  businessName: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  googleMapsLink: string;
  city: string;
  country: string;
  source: string;
  category?: string;
  socials?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  savedAt?: string;
}



function CommandSelect({ 
  value, 
  onChange, 
  options, 
  placeholder,
  className = "" 
}: { 
  value: any, 
  onChange: (val: any) => void, 
  options: { value: any, label: string }[], 
  placeholder: string,
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedLabel, setSelectedLabel] = useState(placeholder);

  useEffect(() => {
    const found = options.find(o => o.value === value);
    if (found && found.label) setSelectedLabel(found.label);
    else setSelectedLabel(placeholder);
  }, [value, options, placeholder]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-indigo-500/5 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-black text-white hover:bg-white/5 transition-all uppercase tracking-tighter"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[300] top-full left-0 w-full min-w-[160px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="max-h-[250px] overflow-auto custom-scrollbar p-1.5">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all mb-0.5 last:mb-0 ${
                      isSelected 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [targetLeads, setTargetLeads] = useState(10);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [sessionLeads, setSessionLeads] = useState<Lead[]>([]);
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [selectedVaultIds, setSelectedVaultIds] = useState<Set<string>>(new Set());
  const [isVaultExpanded, setIsVaultExpanded] = useState(false);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCategory, setVaultCategory] = useState('ALL');
  const [vaultCountry, setVaultCountry] = useState('ALL');
  const [vaultCity, setVaultCity] = useState('ALL');
  const [vaultMinRating, setVaultMinRating] = useState(0);
  const [vaultSocialFilter, setVaultSocialFilter] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL');
  const [vaultSort, setVaultSort] = useState<'NEWEST' | 'RATING' | 'NAME'>('NEWEST');
  const [autoSave, setAutoSave] = useState(false);

  // DB Manager State
  const [databases, setDatabases] = useState<{id: number, name: string}[]>([]);
  const [activeDbId, setActiveDbId] = useState(1);
  const [dbManagerOpen, setDbManagerOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<number | null>(null);

  // Export Modal State
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, data: Lead[], filename: string }>({
    isOpen: false,
    data: [],
    filename: 'export'
  });
  const [exportFields, setExportFields] = useState<string[]>([
    'businessName', 'category', 'rating', 'reviews', 'website', 'email', 'phone', 'address', 'city', 'country', 'socials'
  ]);

  const AVAILABLE_FIELDS = [
    { id: 'businessName', label: 'Business Name' },
    { id: 'category', label: 'Category' },
    { id: 'rating', label: 'Rating' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'website', label: 'Website' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'address', label: 'Address' },
    { id: 'city', label: 'City' },
    { id: 'country', label: 'Country' },
    { id: 'socials', label: 'Social Media' },
    { id: 'image', label: 'Profile Picture' }
  ];

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVaultExpanded(false);
        setExportModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredVaultLeads = useMemo(() => {
    let filtered = savedLeads.filter(lead => {
      const matchesSearch = !vaultSearch || 
        lead.businessName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
        (lead.category && lead.category.toLowerCase().includes(vaultSearch.toLowerCase())) ||
        (lead.socials && lead.socials.toLowerCase().includes(vaultSearch.toLowerCase())) ||
        (lead.country && lead.country.toLowerCase().includes(vaultSearch.toLowerCase())) ||
        (lead.city && lead.city.toLowerCase().includes(vaultSearch.toLowerCase()));
      
      const matchesCategory = vaultCategory === 'ALL' || lead.category === vaultCategory;
      const matchesCountry = vaultCountry === 'ALL' || lead.country === vaultCountry;
      const matchesCity = vaultCity === 'ALL' || lead.city === vaultCity;
      const matchesRating = (lead.rating || 0) >= vaultMinRating;
      
      const hasSocials = lead.socials && lead.socials.trim().length > 0;
      const matchesSocial = vaultSocialFilter === 'ALL' || 
        (vaultSocialFilter === 'WITH' ? hasSocials : !hasSocials);
      
      return matchesSearch && matchesCategory && matchesCountry && matchesCity && matchesRating && matchesSocial;
    });

    // Sorting logic
    return filtered.sort((a, b) => {
      if (vaultSort === 'RATING') return (b.rating || 0) - (a.rating || 0);
      if (vaultSort === 'NAME') return a.businessName.localeCompare(b.businessName);
      // NEWEST: Use savedAt if available, or just original order (which is usually newest based on DB)
      return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime();
    });
  }, [savedLeads, vaultSearch, vaultCategory, vaultCountry, vaultCity, vaultMinRating, vaultSort]);

  const vaultCategories = useMemo(() => {
    const cats = new Set(savedLeads.map(l => l.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)].sort();
  }, [savedLeads]);

  const vaultCountries = useMemo(() => {
    const existing = new Set(savedLeads.map(l => l.country).filter(Boolean));
    // Filter the full COUNTRIES list from constants to only what exists in DB, but keep the order
    const ordered = COUNTRIES.filter(c => existing.has(c));
    return ['ALL', ...ordered];
  }, [savedLeads]);

  const vaultCities = useMemo(() => {
    const cities = new Set(savedLeads
      .filter(l => vaultCountry === 'ALL' || l.country === vaultCountry)
      .map(l => l.city)
      .filter(Boolean));
    return ['ALL', ...Array.from(cities)].sort();
  }, [savedLeads, vaultCountry]);

  useEffect(() => {
    const saved = localStorage.getItem('lead_generator_v1_params');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.industry) setIndustry(parsed.industry);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.city) setCity(parsed.city);
        if (parsed.targetLeads) setTargetLeads(parsed.targetLeads);
      } catch (e) {}
    }
    setIsHydrated(true);
    fetchDatabases();
    fetchSavedLeads(1);
  }, []);

  const fetchDatabases = async () => {
    try {
      const res = await fetch('/api/databases');
      const data = await res.json();
      if (!data.error) setDatabases(data);
    } catch (e) {}
  };

  const createDatabase = async (name: string) => {
    if (!name) return;
    try {
      const res = await fetch('/api/databases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchDatabases();
    } catch (e) {}
  };

  const deleteDatabase = async (id: number) => {
    if (id === 1) return;
    if (!confirm("DELETE CRATE AND ALL INTERRED DATA?")) return;
    try {
      const res = await fetch('/api/databases', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchDatabases();
        if (activeDbId === id) {
           setActiveDbId(1);
           fetchSavedLeads(1);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('lead_generator_v1_params', JSON.stringify({
        industry, country, city, targetLeads
      }));
    }
  }, [industry, country, city, targetLeads, isHydrated]);

  const fetchSavedLeads = async (db_id?: number) => {
    try {
      const targetId = db_id || activeDbId;
      const res = await fetch(`/api/leads?db_id=${targetId}`);
      const data = await res.json();
      if (!data.error) setSavedLeads(data);
    } catch (e) {}
  };

  const clearHistory = async () => {
    if (!confirm("WIPE ENTIRE DATABASE?")) return;
    try {
      const res = await fetch('/api/leads', { method: 'DELETE' });
      if (res.ok) {
        setSavedLeads([]);
        setSelectedVaultIds(new Set());
        alert("Vault Cleared.");
      }
    } catch (e) {}
  };

  const getFlagIcon = (countryName: string) => {
    if (!countryName || countryName === 'GL' || countryName === 'GLOBAL') return <span>🌐</span>;
    
    const countryToIso: { [key: string]: string } = {
      "United States": "us",
      "United Kingdom": "gb",
      "Canada": "ca",
      "Australia": "au",
      "Germany": "de",
      "France": "fr",
      "Italy": "it",
      "Spain": "es",
      "Japan": "jp",
      "India": "in",
      "Brazil": "br",
      "Mexico": "mx",
      "South Africa": "za",
      "Netherlands": "nl",
      "United Arab Emirates": "ae",
      "Saudi Arabia": "sa",
      "Kuwait": "kw",
      "Qatar": "qa",
      "Bahrain": "bh",
      "Oman": "om",
      "Egypt": "eg",
      "Jordan": "jo",
      "Lebanon": "lb",
      "Morocco": "ma",
      "Tunisia": "tn",
      "Algeria": "dz",
      "Iraq": "iq",
      "Palestine": "ps",
      "Libya": "ly",
      "Syria": "sy",
      "Sudan": "sd",
      "Singapore": "sg",
      "New Zealand": "nz",
      "Ireland": "ie",
      "Sweden": "se",
      "Norway": "no"
    };

    const code = countryToIso[countryName] || countryName.toLowerCase();
    if (code.length > 2) return <span className="text-[10px]">📍</span>;

    return (
      <img 
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} 
        alt={countryName}
        className="w-3.5 h-2.5 object-cover rounded-[1px] shadow-[0_0_2px_rgba(0,0,0,0.5)]"
      />
    );
  };

  const getSocialIcon = (url: string) => {
    const l = url.toLowerCase();
    if (l.includes('facebook.com')) return <Facebook className="w-4 h-4" />;
    if (l.includes('instagram.com')) return <Instagram className="w-4 h-4" />;
    if (l.includes('linkedin.com')) return <Linkedin className="w-4 h-4" />;
    if (l.includes('twitter.com') || l.includes('x.com')) return <Twitter className="w-4 h-4" />;
    return <Share2 className="w-4 h-4" />;
  };

  const LeadCard = ({ lead, isSelected, onToggle, isVault = false }: { lead: Lead, isSelected: boolean, onToggle: () => void, isVault?: boolean }) => {
    const [copyFeedback, setCopyFeedback] = useState<{ x: number, y: number } | null>(null);
    
    const socialsArray = useMemo(() => {
      if (!lead.socials) return [];
      return lead.socials.split(',').map(s => s.trim()).filter(Boolean);
    }, [lead.socials]);

    const performCopy = (e: React.MouseEvent, text: string) => {
      e.stopPropagation();
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopyFeedback({ x: e.clientX, y: e.clientY });
      setTimeout(() => setCopyFeedback(null), 1200);
    };

    const handleMainCopy = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Filter out clicks on buttons, links, or the selection toggle
      if (target.closest('button') || target.closest('a') || target.closest('.selection-trigger')) return;

      const report = `
[BUSINESS] ${lead.businessName}
[CATEGORY] ${lead.category || 'N/A'}
[PHONE]    ${lead.phone || 'N/A'}
[EMAIL]    ${lead.email || 'N/A'}
[WEBSITE]  ${lead.website || 'N/A'}
[ADDRESS]  ${lead.address || 'N/A'}
[MAPS_URL] ${lead.googleMapsLink || 'N/A'}
      `.trim();
      
      performCopy(e, report);
    };
    
    return (
      <div 
        onClick={handleMainCopy} 
        className={`relative group p-3 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
          isSelected 
            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.08)]' 
            : 'bg-[#0f172a]/60 border-white/5 hover:border-white/10 hover:bg-[#1e293b]/60'
        }`}
      >
        {/* Floating Intelligence Copied Notification */}
        {copyFeedback && (
          <div 
            className="fixed pointer-events-none z-[9999] px-2.5 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] flex items-center gap-2 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200"
            style={{ left: copyFeedback.x + 15, top: copyFeedback.y - 15 }}
          >
            <CheckCircle className="w-3.5 h-3.5" /> Intelligence Copied
          </div>
        )}

        <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${isSelected ? 'bg-indigo-500' : 'bg-transparent'}`} />
        
        {/* Header Area */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 min-w-0">
             {/* Dynamic Thumbnail */}
             <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {lead.image ? (
                   <img 
                      src={lead.image} 
                      alt={lead.businessName} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         target.parentElement!.innerHTML = '<div class="text-indigo-500/40 text-[10px] font-black italic">LINK</div>';
                      }}
                   />
                ) : (
                   <Database className="w-5 h-5 text-indigo-500/40" />
                )}
             </div>

             <div className="min-w-0">
                <div className="flex items-center gap-2 group/name" onClick={(e) => performCopy(e, lead.businessName)}>
                  <h3 className="text-[12px] font-black text-white truncate group-hover/name:text-indigo-400 transition-colors tracking-tight">
                    {lead.businessName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px]">
                    {lead.category || 'Classified_Lead'}
                  </span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
             {!isVault && (
               <button 
                 onClick={async (e) => {
                   e.stopPropagation();
                   try {
                     const res = await fetch('/api/save', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(lead)
                     });
                     if (res.ok) {
                       fetchSavedLeads();
                       setCopyFeedback({ x: e.clientX, y: e.clientY });
                       // We can even remove it from session if we want, but letting it stay is fine.
                     }
                   } catch (e) {}
                 }}
                 className="p-1 px-2 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-500 hover:text-white rounded-lg transition-all text-[8px] font-black uppercase tracking-tighter"
                 title="Quick Save to Vault"
               >
                 <Database className="w-2.5 h-2.5" /> SAVE
               </button>
             )}
             <div 
               onClick={(e) => { e.stopPropagation(); onToggle(); }}
               className={`selection-trigger w-5 h-5 rounded-lg border flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 hover:border-indigo-500/50'}`}
             >
                {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
             </div>
          </div>
        </div>

        {/* 4-Quadrant Intelligence Grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-4">
            {/* Phone Field */}
            <div 
              onClick={(e) => performCopy(e, lead.phone)}
              className={`flex items-center justify-between p-2 rounded-xl bg-black/40 border transition-all hover:bg-black/60 group/field ${lead.phone ? 'border-emerald-500/20 text-emerald-400' : 'border-white/5 opacity-20'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="w-3 h-3 opacity-50 shrink-0" />
                <span className="text-[9px] font-black font-mono truncate tracking-tighter">{lead.phone || 'NO_PHON'}</span>
              </div>
            </div>
            
            {/* Email Field */}
            <div 
              onClick={(e) => performCopy(e, lead.email)}
              className={`flex items-center justify-between p-2 rounded-xl bg-black/40 border transition-all hover:bg-black/60 group/field ${lead.email ? 'border-indigo-500/20 text-indigo-400' : 'border-white/5 opacity-20'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="w-3 h-3 opacity-50 shrink-0" />
                <span className="text-[9px] font-black font-mono truncate tracking-tighter">{lead.email.split(',')[0] || 'NO_MAIL'}</span>
              </div>
            </div>

            {/* Website Field */}
            <div 
              onClick={(e) => { if (!lead.website) return; performCopy(e, lead.website); }}
              className={`flex items-center justify-between p-2 rounded-xl bg-black/40 border transition-all hover:bg-black/60 group/field ${lead.website ? 'border-sky-500/20 text-sky-400' : 'border-white/5 opacity-20'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-3 h-3 opacity-50 shrink-0" />
                {lead.website ? (
                  <a 
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    className="text-[9px] font-black font-mono truncate tracking-tighter hover:underline text-sky-400/90"
                  >
                    {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                ) : (
                  <span className="text-[9px] font-black font-mono truncate tracking-tighter">NO_SITE</span>
                )}
              </div>
            </div>

            {/* Rating Field (Integrated) */}
            <div 
              onClick={(e) => performCopy(e, `${lead.rating} Stars / ${lead.reviews} Reviews`)}
              className={`flex items-center justify-between p-2 rounded-xl bg-black/40 border transition-all hover:bg-black/60 group/field ${lead.rating ? 'border-amber-500/20 text-amber-500' : 'border-white/5 opacity-20'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Star className={`w-3 h-3 shrink-0 ${lead.rating ? 'fill-current' : 'opacity-50'}`} />
                <span className="text-[9px] font-black font-mono truncate tracking-tighter">
                   {lead.rating ? `${lead.rating} / ${lead.reviews || 0}` : 'NO_RATE'}
                </span>
              </div>
            </div>
        </div>

        {/* Footer: Socials & Location - Tighter */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.03]">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {socialsArray.length > 0 ? (
              <div className="flex -space-x-1.5">
                {socialsArray.slice(0, 5).map((url, i) => (
                  <a 
                    key={i} 
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-full bg-slate-900 border-2 border-[#020617] flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all hover:scale-110 shadow-lg" 
                  >
                    <div className="scale-[0.8]"> {getSocialIcon(url)} </div>
                  </a>
                ))}
                {socialsArray.length > 5 && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-[#020617] flex items-center justify-center text-[7px] font-black text-slate-600 shadow-lg">
                    +{socialsArray.length - 5}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest opacity-30">NO_FOOTPRINT</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
             <div 
               onClick={(e) => performCopy(e, lead.address)}
               className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5 hover:border-white/20 transition-colors flex items-center gap-2"
             >
                <div className="flex-shrink-0 flex items-center" title={lead.country}>
                  {getFlagIcon(lead.country)}
                </div>
                <span className="truncate">{lead.city || 'GLOBAL'}</span>
             </div>
             {isVault && <span className="text-[7px] font-black text-slate-700 uppercase">{new Date(lead.savedAt || '').toLocaleDateString('en-GB')}</span>}
          </div>
        </div>
      </div>
    );
  };

  const handleBulkDeleteVault = async () => {
    if (selectedVaultIds.size === 0) return;
    if (!confirm(`Delete ${selectedVaultIds.size} selected leads?`)) return;
    try {
      const res = await fetch('/api/leads', { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedVaultIds) })
      });
      if (res.ok) {
        setSavedLeads(prev => prev.filter(l => !selectedVaultIds.has(String(l.id))));
        setSelectedVaultIds(new Set());
      }
    } catch (e) {}
  };
  const handleBulkMoveVault = async (targetDbId: number) => {
    if (selectedVaultIds.size === 0) return;
    setIsMoving(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'MOVE', 
          ids: Array.from(selectedVaultIds),
          target_db_id: targetDbId
        })
      });
      if (res.ok) {
        setSavedLeads(prev => prev.filter(l => !selectedVaultIds.has(String(l.id))));
        setSelectedVaultIds(new Set());
        setMoveTargetId(null);
      }
    } catch (e) {} finally {
      setIsMoving(false);
    }
  };


  const handleBulkDeleteSession = () => {
    if (selectedSessionIds.size === 0) return;
    setSessionLeads(prev => prev.filter(l => !selectedSessionIds.has(l.id)));
    setSelectedSessionIds(new Set());
  };

  const availableCities = useMemo(() => {
    if (!country) return [];
    return GEOGRAPHY[country] || [];
  }, [country]);

  useEffect(() => {
    if (isHydrated) {
       setCity('');
    }
  }, [country, isHydrated]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleFetchLeads = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !city || !country) return alert("Fill required fields");

    setIsScraping(true);
    setLogs([
      { jobId: 'loading', type: 'LOG', level: 'ACTION', message: '🛠️ [ENGINE] Initializing Local Intelligence...', timestamp: new Date().toISOString() },
      { jobId: 'loading', type: 'LOG', level: 'SUCCESS', message: '📡 [NETWORK] Handshake established with cloud Discovery cluster.', timestamp: new Date().toISOString() },
    ]);
    setSessionLeads([]);
    setSelectedSessionIds(new Set());

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, country, city, targetLeads }),
      });

      const { jobId, error } = await res.json();
      if (error) {
        setIsScraping(false);
        return alert(error);
      }
      setCurrentJobId(jobId);

      const eventSource = new EventSource(`/api/stream?jobId=${jobId}`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'LOG') {
          setLogs((prev) => [...prev, data]);
        } else if (data.type === 'LEAD') {
          const newLead = data.payload as Lead;
          setSessionLeads((prev) => [newLead, ...prev]);
          
          if (autoSave) {
            fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newLead)
            }).then(() => fetchSavedLeads()).catch(() => {});
          }
        } else if (data.type === 'END' || data.type === 'ERROR') {
          setLogs((prev) => [...prev, data]);
          setIsScraping(false);
          setCurrentJobId(null);
          eventSource.close();
          fetchSavedLeads();
        }
      };
      eventSource.onerror = () => {
        setIsScraping(false);
        setCurrentJobId(null);
        eventSource.close();
      };
    } catch (e: any) {
      alert("Failed to start job: " + e.message);
      setIsScraping(false);
    }
  };

  const handleStopJob = async () => {
    if (!currentJobId) return;
    try {
      await fetch('/api/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: currentJobId }),
      });
    } catch (e) {}
  };

  const triggerExport = (data: Lead[], filename: string) => {
    if (data.length === 0) return;
    setExportModal({ isOpen: true, data, filename });
  };

  const performExport = () => {
    const { data: rawData, filename } = exportModal;
    if (rawData.length === 0) return;

    // Smart Filter: Only include leads that have at least one of the selected fields populated
    const data = rawData.filter(lead => 
      exportFields.some(fieldId => {
        const val = (lead as any)[fieldId];
        return val && String(val).trim().length > 0;
      })
    );

    if (data.length === 0) {
      alert("No leads found with the selected intelligence dimensions.");
      return;
    }

    // Get selected labels/fields for the export
    const selectedFields = AVAILABLE_FIELDS.filter(f => exportFields.includes(f.id));

    // Premium intelligence export via HTML-XLS trick (fixes styles and Arabic)
    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style>
          table { border: 1px solid #E2E8F0; border-collapse: collapse; font-family: sans-serif; }
          th { background-color: #4F46E5; color: #FFFFFF; font-weight: bold; padding: 12px 8px; border: 1px solid #E2E8F0; text-transform: uppercase; font-size: 11px; text-align: left; }
          td { border: 1px solid #E2E8F0; padding: 10px 8px; font-size: 10px; color: #334155; }
          .phone-cell { mso-number-format:"\\@"; } /* This forces Excel to treat phones as text */
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${selectedFields.map(f => `<th>${f.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(l => `
              <tr>
                ${selectedFields.map(f => {
                  const val = (l as any)[f.id] || '';
                  const className = f.id === 'phone' ? 'phone-cell' : '';
                  return `<td class="${className}">${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `.trim();

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().getTime()}.xls`;
    a.click();
    
    setExportModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleSelectSession = (id: string) => {
    const next = new Set(selectedSessionIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedSessionIds(next);
  };

  const toggleSelectVault = (id: string) => {
    const next = new Set(selectedVaultIds);
    const sId = String(id);
    if (next.has(sId)) next.delete(sId); else next.add(sId);
    setSelectedVaultIds(next);
  };

  const selectAllSession = () => {
    if (selectedSessionIds.size === sessionLeads.length) {
      setSelectedSessionIds(new Set());
    } else {
      setSelectedSessionIds(new Set(sessionLeads.map(l => l.id)));
    }
  };

  const selectAllVault = () => {
    if (selectedVaultIds.size === savedLeads.length) {
      setSelectedVaultIds(new Set());
    } else {
      setSelectedVaultIds(new Set(savedLeads.map(l => String(l.id))));
    }
  };

  if (!isHydrated) return <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-indigo-500 animate-pulse">BOOTING_DISCOVERY_ENGINE...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-2 selection:bg-indigo-500/30 overflow-x-hidden">
      
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Minimal Header */}
        <header className="flex items-center justify-between px-6 py-2 glass rounded-2xl border border-white/5 mx-2 bg-slate-950/20">
            <h1 className="text-lg font-black text-white tracking-tighter flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500 fill-current" />
              DEEP<span className="text-indigo-500">DISCOVERY</span>
              <span className="text-[9px] text-slate-500 font-mono opacity-50 px-2 uppercase tracking-[0.3em]">Module_V4.1</span>
            </h1>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                  <Database className="w-3 h-3 text-indigo-500" /> {savedLeads.length} SECURED
               </div>
               <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button onClick={() => triggerExport(savedLeads, 'Discovery_Vault')} disabled={savedLeads.length === 0} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all disabled:opacity-10" title="Export All">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={clearHistory} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-600 hover:text-rose-500 transition-all" title="Wipe History">
                    <History className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start px-2">
          
          {/* Column 1: Config */}
          <section className="lg:col-span-3 space-y-4">
            <div className="glass rounded-3xl p-5 border border-white/5 relative overflow-hidden flex flex-col h-[850px]">
              
              {/* Config Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Targeting_Core</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Configure parameters for deep extraction</p>
              </div>

              <form onSubmit={handleFetchLeads} className="space-y-4">
                <SearchableCombobox label="Industry" options={INDUSTRIES} value={industry} onChange={setIndustry} required placeholder="Select Industry..." />
                <div className="grid grid-cols-2 gap-3">
                  <SearchableCombobox label="Nation" options={COUNTRIES} value={country} onChange={setCountry} required placeholder="Country" />
                  <SearchableCombobox label="City" options={availableCities} value={city} onChange={setCity} required placeholder="City" />
                </div>
                <div className="bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Discovery_Depth</span>
                    <span className="text-[11px] font-black text-indigo-400 font-mono">{targetLeads}</span>
                  </div>
                  <input type="range" min="1" max="500" value={targetLeads} onChange={(e) => setTargetLeads(Number(e.target.value))} className="w-full h-1 bg-white/5 rounded-full appearance-none accent-indigo-500 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group cursor-pointer" onClick={() => setAutoSave(!autoSave)}>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Auto_Sync_Vault</span>
                      <span className="text-[8px] text-slate-500 font-bold">Auto-adds found leads to DB</span>
                   </div>
                   <div className={`w-8 h-4 rounded-full p-0.5 transition-all duration-300 ${autoSave ? 'bg-indigo-600' : 'bg-white/10'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 ${autoSave ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                </div>

                {isScraping ? (
                  <div className="flex gap-2">
                    <button disabled className="flex-1 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black rounded-xl text-[10px] uppercase flex items-center justify-center gap-3">
                      <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      Decrypting_Assets...
                    </button>
                    <button type="button" onClick={handleStopJob} className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center group shadow-lg shadow-rose-900/10">
                      <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-xl text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3 group">
                    <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                    Initialize_Discovery
                  </button>
                )}
              </form>

              {/* Terminal View */}
              <div className="flex-1 bg-slate-950/80 rounded-2xl border border-white/5 overflow-hidden flex flex-col mt-6">
                <div className="bg-white/5 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE_ENGINE_FEED</span>
                  </div>
                  <button 
                    onClick={() => setLogs([])}
                    className="p-1 px-2 rounded-md hover:bg-white/5 text-[9px] font-black text-slate-600 hover:text-indigo-400 transition-all uppercase tracking-tighter"
                    title="Flush Terminal"
                  >
                   Flush
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[9px] space-y-2 custom-scrollbar scrolling-touch">
                  {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-20">
                       <Database className="w-5 h-5 text-slate-700" />
                       <div className="text-slate-700 italic font-black uppercase tracking-[0.2em]">STANDBY_STATUS_IDLE</div>
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className={`p-1.5 rounded-lg border border-transparent animate-in fade-in slide-in-from-left-2 duration-300 ${
                      log.level === 'ERROR' ? 'text-rose-400 bg-rose-500/5 border-rose-500/10' : 
                      log.level === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' : 
                      log.level === 'ACTION' ? 'text-indigo-400 bg-indigo-500/5' : 
                      'text-slate-500'
                    }`}>
                      <span className="opacity-30 mr-2">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      {log.message}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </section>

          {/* Column 2: Buffer */}
          <section className="lg:col-span-4 flex flex-col h-[850px]">
             <div className="glass rounded-3xl overflow-hidden flex flex-col flex-1 border border-white/5 bg-slate-900/10">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <div className="flex items-center gap-3">
                      <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-500" /> LIVE_Discovery
                      </h2>
                   </div>
                   <div className="flex items-center gap-1">
                      {sessionLeads.length > 0 && (
                        <>
                          <button 
                            onClick={async () => {
                              const batch = [...sessionLeads];
                              for (const l of batch) {
                                await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) });
                              }
                              fetchSavedLeads();
                              alert(`${batch.length} leads prioritized for permanent storage.`);
                            }}
                            className="p-1 px-2 flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-tighter"
                            title="Commit Buffer to Vault"
                          >
                            <Database className="w-3 h-3" /> Commit
                          </button>
                          <button 
                            onClick={() => { setSessionLeads([]); setSelectedSessionIds(new Set()); }}
                            className="p-1 px-2 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-tighter"
                            title="Purge Discovery Buffer"
                          >
                            Flush
                          </button>
                        </>
                      )}
                      
                      {selectedSessionIds.size > 0 && (
                        <div className="flex items-center gap-1 p-0.5 bg-indigo-500/5 rounded-lg border border-white/5 ml-2">
                           <button onClick={(e) => { e.stopPropagation(); triggerExport(sessionLeads.filter(l => selectedSessionIds.has(l.id)), 'Buffer_Selected'); }} className="p-1 px-2 hover:bg-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase">Export</button>
                        </div>
                      )}
                      
                      {sessionLeads.length > 0 && (
                        <button 
                          onClick={selectAllSession}
                          className="p-1.5 text-slate-500 hover:text-indigo-400 transition-all"
                          title={selectedSessionIds.size === sessionLeads.length ? "Deselect All" : "Select All"}
                        >
                          {selectedSessionIds.size === sessionLeads.length ? <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      
                      <button onClick={() => triggerExport(sessionLeads, 'Buffer_Dump')} disabled={sessionLeads.length === 0} className="p-1.5 text-slate-500 hover:text-white transition-all disabled:opacity-0"><Download className="w-3.5 h-3.5" /></button>
                   </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                   {sessionLeads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                         <div className="w-12 h-12 border-2 border-dashed border-indigo-500 rounded-full animate-[spin_10s_linear_infinite]" />
                         <span className="text-[10px] font-black tracking-[0.5em] uppercase">Ready_For_Extraction</span>
                      </div>
                   ) : (
                      <div className="p-3 space-y-3">
                        {sessionLeads.map((lead) => (
                           <LeadCard 
                             key={lead.id} 
                             lead={lead} 
                             isSelected={selectedSessionIds.has(lead.id)} 
                             onToggle={() => toggleSelectSession(lead.id)} 
                           />
                        ))}
                      </div>
                   )}
                </div>
             </div>
          </section>

          {/* Column 3: Secured Vault */}
          <section className={`flex flex-col h-[850px] transition-all duration-500 ease-in-out ${isVaultExpanded ? 'fixed inset-0 z-[100] p-6 bg-slate-950/90 backdrop-blur-xl' : 'lg:col-span-5'}`}>
             <div className={`glass rounded-3xl flex flex-col flex-1 border transition-all duration-500 ${isVaultExpanded ? 'border-indigo-500/30 bg-[#020617]/80 shadow-[0_0_100px_rgba(79,70,229,0.15)] ring-1 ring-white/5' : 'border-indigo-500/10 bg-indigo-950/5'}`}>
                   {/* Vault Header Container */}
                <div className={`px-5 border-b border-indigo-500/10 flex flex-col transition-all ${isVaultExpanded ? 'bg-indigo-500/10' : 'bg-indigo-500/[0.03]'}`}>
                   {/* Row 1: Identification & Controls */}
                   <div className={`flex items-center justify-between transition-all ${isVaultExpanded ? 'py-5' : 'py-3'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl transition-colors ${isVaultExpanded ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <Database className={isVaultExpanded ? 'w-5 h-5' : 'w-3 h-3'} />
                         </div>
                         <div>
                           <h2 className={`font-black text-white uppercase tracking-[0.2em] transition-all ${isVaultExpanded ? 'text-sm' : 'text-[10px]'}`}>
                              Secured_Vault
                           </h2>
                           <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{savedLeads.length} Entries Recorded</p>
                         </div>
                      </div>

                      {isVaultExpanded && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                           <div className="text-center">
                              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Active_Intelligence_Crate</span>
                              <button 
                                 onClick={() => setDbManagerOpen(true)}
                                 className="flex items-center gap-3 bg-indigo-500 border border-indigo-400 px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] group hover:scale-105 transition-all"
                              >
                                 <Database className="w-4 h-4 text-white" />
                                 <span className="text-[11px] font-black text-white uppercase tracking-wider">
                                    {databases.find(d => d.id === activeDbId)?.name || 'Main Database'}
                                 </span>
                                 <ChevronDown className="w-3 h-3 text-indigo-200 group-hover:rotate-12 transition-transform" />
                              </button>
                           </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                         {selectedVaultIds.size > 0 && (
                           <div className="flex items-center gap-1 p-1 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mr-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); selectAllVault(); }} 
                                className="p-1 px-3 hover:bg-white/5 rounded-lg text-[9px] font-black text-slate-400 uppercase"
                              >
                                {selectedVaultIds.size === savedLeads.length ? 'None' : 'All'}
                              </button>
                              <div className="w-[1px] h-3 bg-white/5 mx-1" />
                              
                              <div className="relative group">
                                <button className="flex items-center gap-1.5 p-1 px-3 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                                   Move_To <ChevronDown className="w-3 h-3" />
                                </button>
                                
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[300] p-2 space-y-1 pointer-events-none group-hover:pointer-events-auto">
                                   <span className="text-[7px] font-black text-slate-600 px-2 py-1 block uppercase tracking-tighter">Target Destination:</span>
                                   {databases.filter(db => db.id !== activeDbId).map(db => (
                                     <button 
                                       key={db.id}
                                       onClick={(e) => { e.stopPropagation(); handleBulkMoveVault(db.id); }}
                                       className="w-full text-left p-2 rounded-xl text-[9px] font-black text-slate-400 hover:bg-white/5 hover:text-white transition-all uppercase"
                                     >
                                       Transfer_To: {db.name}
                                     </button>
                                   ))}
                                   {databases.length <= 1 && <span className="p-2 text-[8px] text-slate-600 block text-center uppercase">No Other Crates</span>}
                                </div>
                              </div>

                              <div className="w-[1px] h-3 bg-white/5 mx-1" />
                              <button onClick={(e) => { e.stopPropagation(); triggerExport(savedLeads.filter(l => selectedVaultIds.has(String(l.id))), 'Vault_Selected'); }} className="p-1 px-3 hover:bg-white/5 rounded-lg text-[9px] font-black text-indigo-400 uppercase">Export</button>
                              <button onClick={(e) => { e.stopPropagation(); handleBulkDeleteVault(); }} className="p-1 px-3 hover:bg-rose-500/10 rounded-lg text-[9px] font-black text-rose-500 uppercase">Delete</button>
                           </div>
                         )}
                         
                         {savedLeads.length > 0 && (
                           <button 
                             onClick={selectAllVault}
                             className="p-1.5 text-slate-500 hover:text-indigo-400 transition-all font-black text-[10px]"
                             title={selectedVaultIds.size === savedLeads.length ? "Deselect All" : "Select All"}
                           >
                             {selectedVaultIds.size === savedLeads.length ? <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> : <Square className="w-3.5 h-3.5" />}
                           </button>
                         )}
                         
                         <button onClick={() => triggerExport(savedLeads, 'Vault_Dump')} disabled={savedLeads.length === 0} className="p-1.5 text-slate-500 hover:text-white transition-all disabled:opacity-0"><Download className="w-3.5 h-3.5" /></button>
                         
                         <div className="w-[1px] h-4 bg-white/10 mx-2" />
                         
                         <button 
                           onClick={() => setIsVaultExpanded(!isVaultExpanded)}
                           className={`p-1.5 rounded-lg transition-all ${isVaultExpanded ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                           title={isVaultExpanded ? "Close Panel (ESC)" : "Expand Intelligence Panel"}
                         >
                           {isVaultExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-3.5 h-3.5" />}
                         </button>
                      </div>
                   </div>

                   {/* Dashboard Filter Bar - Mission Control Redesign */}
                   {isVaultExpanded && (
                     <div className="pb-6 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
                        <div className="bg-slate-950/40 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col gap-5">
                           
                           {/* Row 1: Primary Search & Global Actions */}
                           <div className="flex flex-wrap items-center gap-4">
                              <div className="relative group/search flex-1 min-w-[320px]">
                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-emerald-500/50 group-focus-within/search:text-emerald-400 group-focus-within/search:scale-110 transition-all duration-300" />
                                 </div>
                                 <input 
                                    type="text"
                                    value={vaultSearch}
                                    onChange={(e) => setVaultSearch(e.target.value)}
                                    placeholder="Execute Deep Search: Name, Socials, Niche..."
                                    className="w-full bg-black/40 border border-white/5 group-hover/search:border-white/10 focus:border-emerald-500/30 rounded-2xl pl-11 pr-4 py-3 text-[11px] font-black text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all uppercase tracking-[0.15em] placeholder:text-slate-600 shadow-inner"
                                 />
                                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <span className="text-[7px] font-black text-slate-700 bg-white/5 px-2 py-1 rounded-md uppercase tracking-widest border border-white/5">Search_Query</span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2">
                                 <button 
                                    onClick={() => {
                                       setVaultSearch('');
                                       setVaultCategory('ALL');
                                       setVaultCountry('ALL');
                                       setVaultCity('ALL');
                                       setVaultMinRating(0);
                                       setVaultSocialFilter('ALL');
                                       setVaultSort('NEWEST');
                                    }}
                                    className="h-12 px-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all tracking-widest shadow-lg shadow-rose-950/20 flex items-center gap-2 group/flush"
                                 >
                                    <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                                    Flush_Filters
                                 </button>
                              </div>
                           </div>

                           {/* Row 2: Precision Filters & Sorting */}
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                              
                              {/* Filter Unit: Sector */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <Filter className="w-3 h-3 text-indigo-400" /> 1. Sector_Niche
                                 </label>
                                 <CommandSelect 
                                    value={vaultCategory}
                                    onChange={setVaultCategory}
                                    options={vaultCategories.map(cat => ({ value: cat, label: String(cat === 'ALL' ? 'ALL_SECTORS' : (cat || '')) }))}
                                    placeholder="ALL_SECTORS"
                                    className="w-full"
                                  />
                              </div>

                              {/* Filter Unit: Region */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <Globe className="w-3 h-3 text-emerald-400" /> 2. Region_Scope
                                 </label>
                                 <CommandSelect 
                                    value={vaultCountry}
                                    onChange={(val) => { setVaultCountry(val); setVaultCity('ALL'); }}
                                    options={vaultCountries.map(c => ({ value: c, label: String(c === 'ALL' ? 'GLOBAL_REACH' : c) }))}
                                    placeholder="GLOBAL_REACH"
                                    className="w-full"
                                 />
                              </div>

                              {/* Filter Unit: Metro */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <Globe className="w-3 h-3 text-sky-400 opacity-50" /> 3. Local_Hub
                                 </label>
                                 <CommandSelect 
                                    value={vaultCity}
                                    onChange={setVaultCity}
                                    options={vaultCities.map(c => ({ value: c, label: String(c === 'ALL' ? 'SELECT_METRO' : c) }))}
                                    placeholder="SELECT_METRO"
                                    className="w-full"
                                 />
                              </div>

                              {/* Filter Unit: Signal */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <Star className="w-3 h-3 text-amber-400" /> 4. Trust_Signal
                                 </label>
                                 <CommandSelect 
                                    value={vaultMinRating}
                                    onChange={(val) => setVaultMinRating(Number(val))}
                                    options={[
                                       { value: 0, label: 'ALLOW_ALL' },
                                       { value: 4, label: 'TIER_1 (4.0+)' },
                                       { value: 4.5, label: 'ELITE (4.5+)' }
                                    ]}
                                    placeholder="ALLOW_ALL"
                                    className="w-full"
                                 />
                              </div>

                              {/* Filter Unit: Matrix */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <Share2 className="w-3 h-3 text-pink-400" /> 5. Presence_Matrix
                                 </label>
                                 <CommandSelect 
                                    value={vaultSocialFilter}
                                    onChange={setVaultSocialFilter}
                                    options={[
                                       { value: 'ALL', label: 'IGNOR_SOCIAL' },
                                       { value: 'WITH', label: 'HAS_SOCIALS' },
                                       { value: 'WITHOUT', label: 'NO_SOCIALS' }
                                    ]}
                                    placeholder="IGNOR_SOCIAL"
                                    className="w-full"
                                 />
                              </div>

                              {/* Filter Unit: Order */}
                              <div className="flex flex-col gap-2">
                                 <label className="flex items-center gap-2 text-[8px] font-black text-indigo-500/50 uppercase tracking-[0.2em] ml-2">
                                    <Zap className="w-3 h-3" /> 6. Sort_Schema
                                 </label>
                                 <CommandSelect 
                                    value={vaultSort}
                                    onChange={setVaultSort}
                                    options={[
                                       { value: 'NEWEST', label: 'TIME_RECENCY' },
                                       { value: 'RATING', label: 'TOP_SIGNAL' },
                                       { value: 'NAME', label: 'ID_ALPHABET' }
                                    ]}
                                    placeholder="TIME_RECENCY"
                                    className="w-full"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                {/* Vault Content */}
                <div className="flex-1 overflow-auto custom-scrollbar p-3">
                   {savedLeads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                        <Database className="w-16 h-16" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Vault_Empty</span>
                      </div>
                   ) : filteredVaultLeads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                        <Search className="w-12 h-12 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">No_Matching_Intelligence</span>
                        <button onClick={() => { setVaultSearch(''); setVaultCategory('ALL'); }} className="text-[9px] font-black text-indigo-400 uppercase hover:underline">Clear_Filters</button>
                      </div>
                   ) : (
                      <div className={`grid gap-4 transition-all duration-500 ${isVaultExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                        {filteredVaultLeads.map((lead) => (
                           <LeadCard 
                             key={lead.id} 
                             lead={lead} 
                             isSelected={selectedVaultIds.has(String(lead.id))} 
                             onToggle={() => toggleSelectVault(String(lead.id))} 
                             isVault={true}
                           />
                        ))}
                      </div>
                   )}
                </div>
             </div>
          </section>
           {/* DB Manager Popup */}
           <AnimatePresence>
             {dbManagerOpen && (
               <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setDbManagerOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6"
                  >
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-widest">Archive_Manager</h3>
                           <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Manage Intelligence Crates</p>
                        </div>
                        <button onClick={() => setDbManagerOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                           <X className="w-5 h-5 text-slate-500" />
                        </button>
                     </div>

                     <div className="space-y-3 mb-8">
                        {databases.map(db => (
                          <div key={db.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeDbId === db.id ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                             <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeDbId === db.id ? 'bg-indigo-500 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>
                                   <Database className="w-4 h-4" />
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-wider ${activeDbId === db.id ? 'text-white' : 'text-slate-400'}`}>{db.name}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                {activeDbId !== db.id ? (
                                   <button 
                                      onClick={() => { setActiveDbId(db.id); fetchSavedLeads(db.id); setDbManagerOpen(false); }}
                                      className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest transition-all"
                                   >
                                      Switch_To
                                   </button>
                                ) : (
                                   <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest px-2 py-1 bg-indigo-500/10 rounded-lg">Operational</span>
                                )}
                                {db.id !== 1 && (
                                   <button onClick={() => deleteDatabase(db.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-all">
                                      <Trash className="w-3.5 h-3.5" />
                                   </button>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <input 
                           type="text"
                           placeholder="New Crate Identity..."
                           className="w-full bg-transparent border-none px-4 py-3 text-[10px] font-black text-white focus:outline-none uppercase tracking-widest"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               createDatabase((e.target as HTMLInputElement).value);
                               (e.target as HTMLInputElement).value = '';
                             }
                           }}
                        />
                     </div>
                     <p className="text-center text-[8px] text-slate-600 mt-4 uppercase font-black">Press [ENTER] to forge new crate</p>
                  </motion.div>
               </div>
             )}
           </AnimatePresence>
        </main>
      </div>
      {/* Export Selection Modal */}
      {exportModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" /> Selective_Export
              </h3>
              <button 
                onClick={() => setExportModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>Select Dimensions To Extract</span>
                  <button 
                    onClick={() => {
                      if (exportFields.length === AVAILABLE_FIELDS.length) {
                        setExportFields([]);
                      } else {
                        setExportFields(AVAILABLE_FIELDS.map(f => f.id));
                      }
                    }}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors lowercase italic"
                  >
                    {exportFields.length === AVAILABLE_FIELDS.length ? "[unselect_all]" : "[select_all]"}
                  </button>
                </div>
                <span className="text-indigo-400">{exportFields.length} / {AVAILABLE_FIELDS.length}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_FIELDS.map((field) => {
                  const isSelected = exportFields.includes(field.id);
                  const count = exportModal.data.filter(l => {
                    const val = (l as any)[field.id];
                    return val && String(val).trim().length > 0;
                  }).length;

                  return (
                    <button
                      key={field.id}
                      onClick={() => {
                        setExportFields(prev => 
                          isSelected ? prev.filter(f => f !== field.id) : [...prev, field.id]
                        );
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
                        isSelected 
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-[0_4px_20px_rgba(99,102,241,0.1)]' 
                          : 'bg-white/5 border-white/5 text-slate-600 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500' : 'bg-white/10'}`}>
                          {isSelected && <CheckSquare className="w-2.5 h-2.5" />}
                        </div>
                        {field.label}
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setExportModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={performExport}
                  disabled={exportFields.length === 0}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2 group"
                >
                  <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> 
                  Execute Extraction ({exportModal.data.length} Leads)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
