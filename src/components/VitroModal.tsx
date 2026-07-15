import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Check, Trash2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';
import { supabase } from '../lib/supabase';

interface VitroModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedFields: Partial<UserProfile>) => void;
}

interface DecorationItem {
  name: string;
  filename: string;
  category: 'Cats & Dogs' | 'Futuristic' | 'Nature & Cute' | 'Orbiting & FX';
}

const DECORATIONS: DecorationItem[] = [
  // Cats & Dogs
  { name: "Calico Cat", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cat%20Calico.gif", category: "Cats & Dogs" },
  { name: "Ginger Cat", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cat%20Ginger.gif", category: "Cats & Dogs" },
  { name: "White Cat", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cat%20White.gif", category: "Cats & Dogs" },
  { name: "Yellow Cat", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cat%20Yellow.gif", category: "Cats & Dogs" },
  { name: "Brown & White Dog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Dog%20Brown%20%26%20White.gif", category: "Cats & Dogs" },
  { name: "Dark Brown Dog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Dog%20Dark%20Brown.gif", category: "Cats & Dogs" },
  { name: "Light Brown Dog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Dog%20Light%20Brown.gif", category: "Cats & Dogs" },
  { name: "Angry Frog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Frog%20Angry.gif", category: "Cats & Dogs" },
  { name: "Derpy Frog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Frog%20Derpy.gif", category: "Cats & Dogs" },
  { name: "Happy Frog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Frog%20Happy.gif", category: "Cats & Dogs" },
  { name: "Sad Frog", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Frog%20Sad.gif", category: "Cats & Dogs" },

  // Futuristic
  { name: "Blue Headphones", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Headphones%20Blue.gif", category: "Futuristic" },
  { name: "Green Headphones", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Headphones%20Green.gif", category: "Futuristic" },
  { name: "Pink Headphones", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Headphones%20Pink.gif", category: "Futuristic" },
  { name: "Blue Helmet (Green Shine)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Blue%20%28Green%20Shine%29.gif", category: "Futuristic" },
  { name: "Blue Helmet (Green Warp)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Blue%20%28Green%20Warp%29.gif", category: "Futuristic" },
  { name: "Green Helmet (Pink Shine)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Green%20%28Pink%20Shine%29.gif", category: "Futuristic" },
  { name: "Green Helmet (Pink Warp)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Green%20%28Pink%20Warp%29.gif", category: "Futuristic" },
  { name: "Pink Helmet (Green Shine)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Pink%20%28Green%20Shine%29.gif", category: "Futuristic" },
  { name: "Pink Helmet (Green Warp)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Helmet%20Pink%20%28Green%20Warp%29.gif", category: "Futuristic" },
  { name: "Blue Interface", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Interface%20Blue.gif", category: "Futuristic" },
  { name: "Green Interface", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Interface%20Green.gif", category: "Futuristic" },
  { name: "Pink Interface", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Futuristic%20Interface%20Pink.gif", category: "Futuristic" },

  // Nature & Cute
  { name: "Cherry Blossom (Dark Pink)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cherry%20Blossom%20Dark%20Pink.gif", category: "Nature & Cute" },
  { name: "Cherry Blossom (Green)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cherry%20Blossom%20Green.gif", category: "Nature & Cute" },
  { name: "Cherry Blossom (Soft Pink)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cherry%20Blossom%20Soft%20Pink.gif", category: "Nature & Cute" },
  { name: "Cherry Blossom (Yellow)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Cherry%20Blossom%20Yellow.gif", category: "Nature & Cute" },
  { name: "Forest Canopy", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Forest.gif", category: "Nature & Cute" },
  { name: "Green Mushroom", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Mushroom%20Green.gif", category: "Nature & Cute" },
  { name: "Orange Mushroom", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Mushroom%20Orange.gif", category: "Nature & Cute" },
  { name: "Pink Mushroom", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Mushroom%20Pink.gif", category: "Nature & Cute" },
  { name: "Red Mushroom", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Mushroom%20Red.gif", category: "Nature & Cute" },

  // Orbiting & FX
  { name: "Gear Spin Flames", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Gear%20Spin%20%28Pink%20%26%20Blue%20Flames%2C%20Green%20Stars%29.gif", category: "Orbiting & FX" },
  { name: "Orbiting Circles (Blue)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Orbiting%20Circles%20Blue.gif", category: "Orbiting & FX" },
  { name: "Orbiting Circles (Green)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Orbiting%20Circles%20Green.gif", category: "Orbiting & FX" },
  { name: "Orbiting Circles (Pink)", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Orbiting%20Circles%20Pink.gif", category: "Orbiting & FX" },
  { name: "Blue Smoke Clouds", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Smoke%20Clouds%20%28Blue%20Border%29.gif", category: "Orbiting & FX" },
  { name: "Green Smoke Clouds", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Smoke%20Clouds%20%28Green%20Border%29.gif", category: "Orbiting & FX" },
  { name: "Pink Smoke Clouds", filename: "https://raw.githubusercontent.com/nyatter1/nitro./main/Smoke%20Clouds%20%28Pink%20Border%29.gif", category: "Orbiting & FX" },
];

const NAMEPLATES = [
  { name: "Goofy Happy Tune", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/goofy_happy_tune.webm" },
  { name: "Gothic Arches", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/gothic_arches.webm" },
  { name: "Green Mana", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/green_mana.webm" },
  { name: "Grogu", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/grogu.webm" },
  { name: "Gudetama", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/gudetama.webm" },
  { name: "Haiti", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/haiti.webm" },
  { name: "Heart's Reflection", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/heart%27s_reflection.webm" },
  { name: "Hello Kitty", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hello_kitty.webm" },
  { name: "Hermit's Lantern", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hermit%27s_lantern.webm" },
  { name: "Hoppy Boi's Perch", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hoppy_boi%27s_perch.webm" },
  { name: "Hot Dog", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hot_dog.webm" },
  { name: "Hunny Bunnies", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hunny_bunnies.webm" },
  { name: "Hyperspace", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/hyperspace.webm" },
  { name: "Ichi Nyan", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/ichi_nyan.webm" },
  { name: "Infinite Swirl", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/infinite_swirl.webm" },
  { name: "Iran", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/iran.webm" },
  { name: "Iraq", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/iraq.webm" },
  { name: "Japan", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/japan.webm" },
  { name: "Jordan", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/jordan.webm" },
  { name: "K Heart (Base)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/k_heart_%28base%29.webm" },
  { name: "K Heart (Dark)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/k_heart_%28dark%29.webm" },
  { name: "K Heart (Light)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/k_heart_%28light%29.webm" },
  { name: "K Heart (Medium)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/k_heart_%28medium%29.webm" },
  { name: "Koi Pond", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/koi_pond.webm" },
  { name: "Kuromi x My Melody", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/kuromi_x_my_melody.webm" },
  { name: "Ladybug Lulau", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/ladybug_lulau.webm" },
  { name: "Leo", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/leo.webm" },
  { name: "Red Dragon", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/red_dragon.webm" },
  { name: "Red Mana", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/red_mana.webm" },
  { name: "Ripper Awakens", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/ripper_awakens.webm" },
  { name: "Roly Roly (Blue)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/roly_roly_%28blue%29.webm" },
  { name: "Roly Roly (Orange)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/roly_roly_%28orange%29.webm" },
  { name: "Roly Roly (Pink)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/roly_roly_%28pink%29.webm" },
  { name: "Ryomen Sukuna", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/ryomen_sukuna.webm" },
  { name: "Sagittarius", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sagittarius.webm" },
  { name: "Satoru Gojo", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/satoru_gojo.webm" },
  { name: "Saudi Arabia", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/saudi_arabia.webm" },
  { name: "Scorpio", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/scorpio.webm" },
  { name: "Scotland", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/scotland.webm" },
  { name: "Secret Agent", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/secrect_agent.webm" },
  { name: "Senegal", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/senegal.webm" },
  { name: "Shattered Veil", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/shattered_veil.webm" },
  { name: "Skibidi Toilet", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/skibidi_toilet.webm" },
  { name: "South Africa", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/south_africa.webm" },
  { name: "South America", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/south_america.webm" },
  { name: "South Korea", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/south_korea.webm" },
  { name: "Spain", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spain.webm" },
  { name: "Spider-Man (Logo)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spider-man_%28logo%29.webm" },
  { name: "Spider-Man (No Logo)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spider-man_%28no_logo%29.webm" },
  { name: "Spider-Man vs Venom", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spider-man_vs_venom.webm" },
  { name: "Spirit Blossom Petrals", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spirit_blossom_petrals.webm" },
  { name: "Spirit Blossom Springs", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spirit_blossom_springs.webm" },
  { name: "Spirit Moon", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spirit_moon.webm" },
  { name: "Spirit of Spring", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spirit_of_spring.webm" },
  { name: "Spray Doodles", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/spray_doodles.webm" },
  { name: "Sproutling", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sproutling.webm" },
  { name: "Squad Wipe", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/squad_wipe.webm" },
  { name: "Star Drift", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/star_drift.webm" },
  { name: "Star Struck", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/star_struck.webm" },
  { name: "Starfall Tides", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/starfall_tides.webm" },
  { name: "Starfall Tides (Nightshade)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/starfall_tides_%28Nightshade%29.webm" },
  { name: "Starfall Tides (Rose)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/starfall_tides_%28rose%29.webm" },
  { name: "Starfall Tides (Void)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/starfall_tides_%28void%29.webm" },
  { name: "Starlight Whales", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/starlight_whales.webm" },
  { name: "Sub Saharan Africa", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sub_saharan_africa.webm" },
  { name: "Sun and Moon", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sun_and_moon.webm" },
  { name: "Sunlit Radiance", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sunlit_radiance.webm" },
  { name: "Sweden", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sweden.webm" },
  { name: "Sweetheart Charm", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sweetheart_charm.webm" },
  { name: "Switzerland", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/switzerland.webm" },
  { name: "Sword of Legend", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/sword_of_legend.webm" },
  { name: "Taurus", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/taurus.webm" },
  { name: "The Clawww", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/the_clawww.webm" },
  { name: "The Grid Fireworks", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/the_grid_fireworks.webm" },
  { name: "The Same Duck", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/the_same_duck.webm" },
  { name: "Toasty", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/toasty.webm" },
  { name: "Touch Grass", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/touch_grass.webm" },
  { name: "Tower's Strike", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/tower%27s_strike.webm" },
  { name: "Tunisia", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/tunisia.webm" },
  { name: "Turkey", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/turkey.webm" },
  { name: "TV Woman", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/tv_woman.webm" },
  { name: "Twilight", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/twilight.webm" },
  { name: "Twilight (Dusk)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/twilight_%28dusk%29.webm" },
  { name: "Twilight (Fuchsia)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/twilight_%28fuchsia%29.webm" },
  { name: "Under The Sea", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/under_the_sea.webm" },
  { name: "United States", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/united_states.webm" },
  { name: "Uruguay", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/uruguay.webm" },
  { name: "Uzbekistan", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/uzbekistan.webm" },
  { name: "Vault", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/vault.webm" },
  { name: "Vengeance", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/vengeance.webm" },
  { name: "Venom (Logo)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/venom_%28logo%29.webm" },
  { name: "Venom (No Logo)", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/venom_%28no_logo%29.webm" },
  { name: "Virgo", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/virgo.webm" },
  { name: "Western Europe", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/western_europe.webm" },
  { name: "White Mana", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/white_mana.webm" },
  { name: "Woodsprite", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/woodsprite.webm" },
  { name: "Woody's Badge", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/woody%27s_badge.webm" },
  { name: "Yoda", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/yoda.webm" },
  { name: "Yuji Itadori", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/yuji_itadori.webm" },
  { name: "Yunara's Aion Er'na", filename: "https://raw.githubusercontent.com/nyatter1/usercards/main/yunara%27s_aion_er%27na.webm" }
];
const CATEGORIES = ["All", "Cats & Dogs", "Futuristic", "Nature & Cute", "Orbiting & FX"];

export const VitroModal: React.FC<VitroModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'decorations' | 'nameplates'>('decorations');
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewDecoration, setPreviewDecoration] = useState<string | null>(user.avatar_decoration || null);
  const [previewNameplate, setPreviewNameplate] = useState<string | null>(user.nameplate || null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

    // Normalize path helpers
  const getCleanFilename = (path: string | null) => {
    if (!path) return null;
    
    if (path.startsWith('http')) {
      return path;
    }

    let filename = path.split('/').pop() || path;
    filename = filename.replace(/_/g, ' ');
    
    if (filename === "Cherry Blossom Dark Pink.gif" && !filename.includes('(')) {
      // Nothing
    }
    
    let url = `https://raw.githubusercontent.com/nyatter1/nitro./main/${encodeURIComponent(filename)}`;
    url = url.replace(/\(/g, '%28').replace(/\)/g, '%29');
    return url;
  };

  const currentDecorFilename = getCleanFilename(user.avatar_decoration);
  const previewDecorFilename = getCleanFilename(previewDecoration);
  const currentNameplate = user.nameplate;
  const previewNameplateFile = previewNameplate;

  // Filtering list
  const filteredDecorations = useMemo(() => {
    return DECORATIONS.filter(item => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      if (activeTab === 'nameplates') {
        const { error } = await supabase
          .from('profiles')
          .update({ nameplate: previewNameplate })
          .eq('id', user.id);
        if (error) throw error;
        onUpdateUser({ nameplate: previewNameplate || "" });
        alert("Successfully applied your new Vitro Nameplate!");
        onClose();
        return;
      }

      // Normalize decoration to be stored
      const decorationValue = getCleanFilename(previewDecoration);

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_decoration: decorationValue })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      onUpdateUser({ avatar_decoration: decorationValue || "" });
      alert("Successfully applied your new Vitro profile decoration!");
      onClose();
    } catch (err: any) {
      console.error("Error applying decoration:", err);
      alert("Failed to apply. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemove = () => {
    if (activeTab === 'nameplates') {
      setPreviewNameplate(null);
      return;
    }
    setPreviewDecoration(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[85vh] min-h-[500px] bg-[#0c1020] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Navigation, Categories & Grid */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 pt-6 pl-6 pr-6 md:pr-0 pb-6 md:pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide uppercase">Vitro Customizer</h2>
                <p className="text-xs font-bold text-slate-400">Personalize your avatar & nameplate</p>
              </div>
            </div>
            
            {/* Mobile close button (only visible on small screens) */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex pr-6 mb-4 shrink-0">
            <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl w-full">
              <button 
                onClick={() => setActiveTab('decorations')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'decorations' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Decorations
              </button>
              <button 
                onClick={() => setActiveTab('nameplates')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'nameplates' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Nameplates
              </button>
            </div>
          </div>

          {activeTab === 'decorations' && (
            <div className="flex flex-col flex-1 min-h-0 pr-6">
              {/* Search & Categories Bar */}
              <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium decorations..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 hover:bg-white/[0.07] focus:bg-white/[0.08] border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-pink-500/50"
                  />
                </div>
                
                {/* Categories tab scroll */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar shrink-0">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-white/20 text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Decorations Grid */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredDecorations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                    <p className="text-sm font-bold">No decorations found matching your search.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                      className="mt-2 text-xs text-pink-400 hover:underline font-bold"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3.5 p-0.5">
                    {filteredDecorations.map((item) => {
                      const isCurrentlyPreviewed = previewDecorFilename === item.filename;
                      const isCurrentlyApplied = currentDecorFilename === item.filename;
                      
                      return (
                        <button
                          key={item.filename}
                          onClick={() => setPreviewDecoration(item.filename)}
                          className={`relative aspect-square rounded-xl p-2.5 flex flex-col items-center justify-center transition-all group ${
                            isCurrentlyPreviewed
                              ? "bg-pink-500/10 border-2 border-pink-500 shadow-md shadow-pink-500/10"
                              : "bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* Avatar with Overlay Decoration */}
                          <div className="relative mb-2">
                            <Avatar
                              src={user.pfp}
                              alt={item.name}
                              decoration={item.filename}
                              size="lg"
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white text-center truncate w-full leading-tight">
                            {item.name}
                          </span>
                          
                          {isCurrentlyApplied && (
                            <div className="absolute top-1.5 right-1.5 bg-green-500/20 text-green-400 p-0.5 rounded-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'nameplates' && (
            <div className="flex flex-col flex-1 min-h-0 pr-6">
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 gap-3 p-0.5">
                  {NAMEPLATES.map((item) => {
                    const isCurrentlyPreviewed = previewNameplateFile === item.filename;
                    const isCurrentlyApplied = currentNameplate === item.filename;
                    return (
                      <button
                        key={item.filename}
                        onClick={() => setPreviewNameplate(item.filename)}
                        className={`relative h-20 rounded-xl flex items-center justify-center overflow-hidden transition-all group ${
                          isCurrentlyPreviewed
                            ? "border-2 border-pink-500 shadow-md shadow-pink-500/10"
                            : "border border-white/5 hover:border-white/10"
                        }`}
                      >
                        <video 
                          src={item.filename} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />
                        
                        <div className="relative z-20 flex items-center gap-3 w-full px-4 justify-between">
                          <span className="font-bold text-white drop-shadow-md text-sm truncate">
                            {item.name}
                          </span>
                          {isCurrentlyApplied && (
                            <div className="bg-green-500 text-white p-1 rounded-md shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Preview Pane */}
        <div className="w-full md:w-72 bg-white/[0.02] p-6 flex flex-col justify-between shrink-0 h-full">
          <div className="flex flex-col h-full">
            <div className="flex justify-end hidden md:flex mb-6">
              <button 
                onClick={onClose}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Live Discord Presence Card */}
            <div className="w-full bg-[#111424] rounded-2xl border border-white/5 overflow-hidden shadow-xl p-5 relative">
              {/* Profile Card Banner */}
              <div className="h-16 w-full bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent absolute top-0 left-0" />
              
              {/* Nameplate preview background */}
              {activeTab === 'nameplates' && previewNameplate && (
                <div className="absolute inset-0 z-0 opacity-40">
                  <video 
                    src={previewNameplate} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Showcase Avatar Area */}
              <div className="relative mt-4 flex justify-center z-10">
                <Avatar
                  src={user.pfp}
                  alt={user.username}
                  decoration={activeTab === 'decorations' ? previewDecoration : user.avatar_decoration}
                  size="2xl"
                  className="ring-4 ring-[#111424] bg-slate-900"
                />
              </div>

              {/* User Bio Details */}
              <div className="text-center mt-5 space-y-1 relative z-10">
                <h4 className="text-base font-black text-white leading-tight flex items-center justify-center gap-1">
                  {user.username}
                  {user.nameplate && <img src={user.nameplate} alt="Nameplate" className="h-4 object-contain shrink-0" referrerPolicy="no-referrer" />}
                </h4>
                <p className="text-[10px] text-pink-400 font-bold tracking-wider uppercase">Vitro Preview</p>
                
                <div className="h-px bg-white/5 my-3.5" />
                <p className="text-xs text-slate-400 italic">"{user.mood || 'Adjusting my aesthetics...'}"</p>
              </div>
            </div>

            {/* Item description info */}
            <div className="mt-5 p-4 rounded-xl bg-white/[0.01] border border-white/5">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                Active {activeTab === 'decorations' ? 'Decoration' : 'Nameplate'}
              </span>
              <p className="text-sm font-bold text-white">
                {activeTab === 'decorations' 
                  ? (previewDecoration 
                      ? DECORATIONS.find(d => d.filename === getCleanFilename(previewDecoration))?.name || "Premium Decoration"
                      : "None")
                  : (previewNameplate 
                      ? NAMEPLATES.find(n => n.filename === previewNameplate)?.name || "Premium Nameplate"
                      : "None")
                }
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === 'decorations'
                  ? (previewDecoration 
                     ? "An elegant, custom-crafted looping overlay designed to make your profile stand out." 
                     : "Select a decoration from the Vitro gallery to preview it live.")
                  : (previewNameplate
                     ? "An animated background that shows behind your user card in the online players list."
                     : "Select a nameplate to preview it live.")
                }
              </p>
            </div>
            
            {/* Spacer */}
            <div className="flex-1 min-h-[20px]" />
            
            {/* Action buttons footer */}
            <div className="space-y-2 mt-6 shrink-0">
              {(activeTab === 'decorations' ? previewDecoration : previewNameplate) && (
                <button
                  onClick={handleRemove}
                  className="w-full py-2 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove {activeTab === 'decorations' ? 'Decoration' : 'Nameplate'}
                </button>
              )}
              
              <button
                onClick={handleApply}
                disabled={isApplying}
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isApplying 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : (activeTab === 'decorations' ? previewDecoration === user.avatar_decoration : previewNameplate === user.nameplate)
                      ? "bg-white/10 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/20 active:scale-95 cursor-pointer"
                }`}
              >
                {isApplying 
                  ? "Saving..." 
                  : (activeTab === 'decorations' ? previewDecoration === user.avatar_decoration : previewNameplate === user.nameplate)
                    ? "Equipped" 
                    : "Apply"}
                {!isApplying && (activeTab === 'decorations' ? previewDecoration !== user.avatar_decoration : previewNameplate !== user.nameplate) && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
