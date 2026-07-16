import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, useMemo } from "react";
import { 
  Menu, X, Send, Plus, Smile, Users, 
  Crown, ShieldAlert as RulesIcon, ChevronLeft, ChevronRight, LogOut, Shield,
  MoreHorizontal, EyeOff, Trash2, Reply, Volume2, VolumeX,
  Bell, Mail, ShieldCheck, Sparkles, AlertTriangle, Eye, Check, Heart, Edit2, Camera,
  Palette, CreditCard, Star, Lock, Unlock, Coins, Hand, Type, Newspaper, Layers,
  Vote, Gift, ArrowRightLeft, Dices, UserCog, Info, Ban, UserPlus, MessageSquare, Search, User
} from "lucide-react";
import { UserProfile, Message, OnlineUser, RANKS_INFO, mapDbRankToUserRank, UserRank, getLevelFromXp, Story, PrivateMessage } from "../types";
import ProfileModal from "./ProfileModal";
import { Avatar } from "./Avatar";
import { VitroModal } from "./VitroModal";
import { supabase, getSyncedDate, firestore } from "../lib/supabase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, addDoc } from "firebase/firestore";
import { uploadImageToStorage } from "../lib/storage";

// Feature Modals
import PaintModal from "./PaintModal";
import StyleModal from "./StyleModal";
import ConvertModal from "./ConvertModal";
import SecretMessageModal from "./SecretMessageModal";
import GallerySettingsModal from "./GallerySettingsModal";
import { Image as ImageIcon } from "lucide-react";
import SecretMessagesListModal from "./SecretMessagesListModal";
import RevealDecisionModal from "./RevealDecisionModal";
import NewsSidebar from "./NewsSidebar";
import ProfileVisitorsModal from "./ProfileVisitorsModal";
import PollModal from "./PollModal";
import GiftModal from "./GiftModal";
import DiceModal from "./DiceModal";
import PrivateMessageSystem from "./PrivateMessageSystem";
import NotificationsModal from "./NotificationsModal";
import { updateCurrentlyPlaying } from "../lib/spotify";

const getAssetUrl = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return cleanBase + cleanPath;
};

// Font & Icon Colors Customization Lists (100 Icon Colors & 50+ Fonts)
const ALL_FONTS = [
  "Default",
  "Inter",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Lato",
  "Poppins",
  "Oswald",
  "Source Sans Pro",
  "Raleway",
  "Ubuntu",
  "Nunito",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "PT Serif",
  "Roboto Mono",
  "JetBrains Mono",
  "Fira Code",
  "Share Tech Mono",
  "Space Grotesk",
  "Outfit",
  "Syne",
  "Lexend",
  "Pacifico",
  "Caveat",
  "Amatic SC",
  "Shadows Into Light",
  "Great Vibes",
  "Cinzel",
  "Cormorant Garamond",
  "Bebas Neue",
  "Righteous",
  "Lobster",
  "Fredoka One",
  "Comfortaa",
  "Permanent Marker",
  "Press Start 2P",
  "Creepster",
  "Bungee",
  "Russo One",
  "Archivo Black",
  "Sacramento",
  "Courgette",
  "Kaushan Script",
  "Orbitron",
  "Syncopate",
  "Audiowide",
  "Goldman",
  "Bangers",
  "Cinzel Decorative",
  "Teko"
];

const SOLID_COLORS = [
  { id: "solid-white", name: "Solid White", value: "#ffffff" },
  { id: "solid-slate", name: "Solid Slate", value: "#94a3b8" },
  { id: "solid-charcoal", name: "Solid Charcoal", value: "#475569" },
  { id: "solid-red", name: "Solid Red", value: "#ef4444" },
  { id: "solid-rose", name: "Solid Rose", value: "#f43f5e" },
  { id: "solid-pink", name: "Solid Pink", value: "#ec4899" },
  { id: "solid-fuchsia", name: "Solid Fuchsia", value: "#d946ef" },
  { id: "solid-purple", name: "Solid Purple", value: "#a855f7" },
  { id: "solid-violet", name: "Solid Violet", value: "#8b5cf6" },
  { id: "solid-indigo", name: "Solid Indigo", value: "#6366f1" },
  { id: "solid-blue", name: "Solid Blue", value: "#3b82f6" },
  { id: "solid-sky", name: "Solid Sky Blue", value: "#0ea5e9" },
  { id: "solid-cyan", name: "Solid Cyan", value: "#06b6d4" },
  { id: "solid-teal", name: "Solid Teal", value: "#14b8a6" },
  { id: "solid-mint", name: "Solid Mint", value: "#10b981" },
  { id: "solid-emerald", name: "Solid Emerald", value: "#059669" },
  { id: "solid-green", name: "Solid Green", value: "#22c55e" },
  { id: "solid-lime", name: "Solid Lime", value: "#84cc16" },
  { id: "solid-yellow", name: "Solid Yellow", value: "#eab308" },
  { id: "solid-amber", name: "Solid Amber", value: "#f59e0b" },
  { id: "solid-orange", name: "Solid Orange", value: "#f97316" },
  { id: "solid-tangerine", name: "Solid Tangerine", value: "#ff4500" },
  { id: "solid-gold", name: "Solid Gold", value: "#ffd700" },
  { id: "solid-lavender", name: "Solid Lavender", value: "#e9d5ff" },
  { id: "solid-coral", name: "Solid Coral", value: "#ff7f50" }
];

const GRADIENTS = [
  { id: "grad-sunset", name: "Sunset Glow", from: "#ff4500", to: "#ff007f" },
  { id: "grad-ocean", name: "Ocean Breeze", from: "#00ffff", to: "#0055ff" },
  { id: "grad-laser", name: "Neon Laser", from: "#39ff14", to: "#bc13fe" },
  { id: "grad-royal", name: "Royal Amethyst", from: "#a855f7", to: "#3b82f6" },
  { id: "grad-rose", name: "Rose Petal", from: "#f43f5e", to: "#ec4899" },
  { id: "grad-sun", name: "Golden Sun", from: "#ffd700", to: "#f97316" },
  { id: "grad-mint", name: "Emerald Mint", from: "#10b981", to: "#06b6d4" },
  { id: "grad-cosmic", name: "Cosmic Sky", from: "#6366f1", to: "#ec4899" },
  { id: "grad-cyber", name: "Cyberpunk", from: "#ec4899", to: "#00ffff" },
  { id: "grad-lava", name: "Lava Flow", from: "#ef4444", to: "#eab308" },
  { id: "grad-twilight", name: "Twilight", from: "#8b5cf6", to: "#1e1b4b" },
  { id: "grad-ice", name: "Ice Crystal", from: "#ffffff", to: "#38bdf8" },
  { id: "grad-moss", name: "Forest Moss", from: "#a3e635", to: "#15803d" },
  { id: "grad-candy", name: "Cotton Candy", from: "#93c5fd", to: "#fbcfe8" },
  { id: "grad-bubblegum", name: "Bubblegum", from: "#f472b6", to: "#22d3ee" },
  { id: "grad-rainbow", name: "Rainbow", from: "#ff0000", via: "#00ff00", to: "#0000ff" },
  { id: "grad-fireice", name: "Fire & Ice", from: "#ef4444", to: "#60a5fa" },
  { id: "grad-lilac", name: "Lilac Dreams", from: "#f5d0fe", to: "#a21caf" },
  { id: "grad-peach", name: "Peach Sherbet", from: "#ffedd5", to: "#fdba74" },
  { id: "grad-lights", name: "Northern Lights", from: "#2dd4bf", to: "#a21caf" },
  { id: "grad-copper", name: "Copper Gold", from: "#b45309", to: "#fbbf24" },
  { id: "grad-solar", name: "Solar Wind", from: "#f97316", to: "#eab308" },
  { id: "grad-deepsea", name: "Deep Sea", from: "#0284c7", to: "#030712" },
  { id: "grad-nebula", name: "Nebula", from: "#e879f9", to: "#4f46e5" },
  { id: "grad-matcha", name: "Matcha Green", from: "#86efac", to: "#14532d" },
  { id: "grad-paradise", name: "Paradise", from: "#fde047", to: "#0d9488" },
  { id: "grad-berry", name: "Berry Blast", from: "#f43f5e", to: "#86198f" },
  { id: "grad-midnight", name: "Midnight", from: "#000000", to: "#312e81" },
  { id: "grad-electric", name: "Electric Violet", from: "#d946ef", to: "#2563eb" },
  { id: "grad-prism", name: "Prism", from: "#ff007f", via: "#ffd700", to: "#00ffff" }
];

const NEON_COLORS = [
  { id: "neon-pink", name: "Neon Pink", value: "#ff007f", glowColor: "#ff007f" },
  { id: "neon-cyan", name: "Neon Cyan", value: "#00ffff", glowColor: "#00ffff" },
  { id: "neon-lime", name: "Neon Lime", value: "#39ff14", glowColor: "#39ff14" },
  { id: "neon-gold", name: "Neon Gold", value: "#ffd700", glowColor: "#ffd700" },
  { id: "neon-purple", name: "Neon Purple", value: "#bc13fe", glowColor: "#bc13fe" },
  { id: "neon-red", name: "Neon Red", value: "#ff073a", glowColor: "#ff073a" },
  { id: "neon-orange", name: "Neon Orange", value: "#ff355e", glowColor: "#ff355e" },
  { id: "neon-violet", name: "Neon Violet", value: "#9d00ff", glowColor: "#9d00ff" },
  { id: "neon-aqua", name: "Neon Aqua", value: "#00f5ff", glowColor: "#00f5ff" },
  { id: "neon-green", name: "Neon Green", value: "#00ff00", glowColor: "#00ff00" },
  { id: "neon-yellow", name: "Neon Yellow", value: "#ffff00", glowColor: "#ffff00" },
  { id: "neon-coral", name: "Neon Coral", value: "#ff7f50", glowColor: "#ff7f50" },
  { id: "neon-mint", name: "Neon Mint", value: "#10b981", glowColor: "#10b981" },
  { id: "neon-ruby", name: "Neon Ruby", value: "#e11d48", glowColor: "#e11d48" },
  { id: "neon-blue", name: "Neon Blue", value: "#1e40af", glowColor: "#3b82f6" },
  { id: "neon-electric-blue", name: "Neon Electric Blue", value: "#0070f3", glowColor: "#0070f3" },
  { id: "neon-magenta", name: "Neon Magenta", value: "#ff00ff", glowColor: "#ff00ff" },
  { id: "neon-lava", name: "Neon Lava", value: "#ff4500", glowColor: "#ff4500" },
  { id: "neon-chartreuse", name: "Neon Chartreuse", value: "#7fff00", glowColor: "#7fff00" },
  { id: "neon-ice", name: "Neon Ice", value: "#e0f2fe", glowColor: "#38bdf8" },
  { id: "neon-emerald", name: "Neon Emerald", value: "#10b981", glowColor: "#059669" },
  { id: "neon-hotpink", name: "Neon Hotpink", value: "#ff69b4", glowColor: "#ff69b4" },
  { id: "neon-electric-indigo", name: "Neon Electric Indigo", value: "#4f46e5", glowColor: "#4f46e5" },
  { id: "neon-amber", name: "Neon Amber", value: "#fbbf24", glowColor: "#fbbf24" },
  { id: "neon-peach", name: "Neon Peach", value: "#ffedd5", glowColor: "#fdba74" }
];

const SHIMMERS = [
  { id: "shimmer-silver", name: "Silver Shimmer", value: "#ffffff", glowColor: "#cbd5e1" },
  { id: "shimmer-aurora", name: "Aurora Shimmer", value: "#00ffff", glowColor: "#10b981" },
  { id: "shimmer-opal", name: "Opal Shimmer", value: "#fbcfe8", glowColor: "#93c5fd" },
  { id: "shimmer-ruby", name: "Ruby Shimmer", value: "#f43f5e", glowColor: "#be123c" },
  { id: "shimmer-diamond", name: "Diamond Shimmer", value: "#ffffff", glowColor: "#38bdf8" },
  { id: "shimmer-amethyst", name: "Amethyst Shimmer", value: "#c084fc", glowColor: "#6b21a8" },
  { id: "shimmer-gold", name: "Gold Dust Shimmer", value: "#f59e0b", glowColor: "#ef4444" },
  { id: "shimmer-sapphire", name: "Sapphire Shimmer", value: "#3b82f6", glowColor: "#1d4ed8" },
  { id: "shimmer-emerald", name: "Emerald Spark Shimmer", value: "#10b981", glowColor: "#064e3b" },
  { id: "shimmer-cosmic", name: "Cosmic Shimmer", value: "#ff007f", glowColor: "#3b82f6" },
  { id: "shimmer-grad-sunset", name: "Sunset Shimmer", value: "gradient", from: "#ff4500", to: "#ff007f", glowColor: "#ff007f" },
  { id: "shimmer-grad-cyber", name: "Cyber Shimmer", value: "gradient", from: "#ec4899", to: "#00ffff", glowColor: "#00ffff" },
  { id: "shimmer-grad-lights", name: "Lights Shimmer", value: "gradient", from: "#2dd4bf", to: "#a21caf", glowColor: "#a21caf" },
  { id: "shimmer-grad-sun", name: "Sol Shimmer", value: "gradient", from: "#ffd700", to: "#f97316", glowColor: "#f97316" },
  { id: "shimmer-grad-royal", name: "Royal Shimmer", value: "gradient", from: "#a855f7", to: "#3b82f6", glowColor: "#3b82f6" },
  { id: "shimmer-grad-mint", name: "Mint Shimmer", value: "gradient", from: "#10b981", to: "#06b6d4", glowColor: "#06b6d4" },
  { id: "shimmer-neon-gold", name: "Glitz Shimmer", value: "#ffd700", glowColor: "#ffffff" },
  { id: "shimmer-neon-purple", name: "Electro Shimmer", value: "#bc13fe", glowColor: "#ffffff" },
  { id: "shimmer-hotpink", name: "Pulse Shimmer", value: "#ff69b4", glowColor: "#ff007f" },
  { id: "shimmer-teal", name: "Deep Reef Shimmer", value: "#0d9488", glowColor: "#2dd4bf" }
];

const BOT_USER: OnlineUser = {
  id: "musicvibe-bot-system-id",
  username: "System",
  gender: "OTHER",
  age: 0,
  pfp: "https://musicvibe.io/default_images/avatar/default_system.png",
  rank: "BOT",
  aboutMe: "",
  mood: "Always active ⚡",
  likes: 9999,
  isSystem: true,
  status: "online"
};

interface ChatRoomProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

export default function ChatRoom({ user, onLogout, onUpdateUser }: ChatRoomProps) {
  const onUpdateUserRef = useRef(onUpdateUser);
  useEffect(() => {
    onUpdateUserRef.current = onUpdateUser;
  }, [onUpdateUser]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnlinePanelOpen, setIsOnlinePanelOpen] = useState(window.innerWidth > 768);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileMenuView, setProfileMenuView] = useState<'default' | 'status' | 'wallet' | 'level'>('default');
  const [showChatBgModal, setShowChatBgModal] = useState(false);
  const [tempBgBase64, setTempBgBase64] = useState<string | null>(null);
  const [tempBgFile, setTempBgFile] = useState<File | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [chatBgError, setChatBgError] = useState<string | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "staff" | "rules">("chat");
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"online" | "staff" | "friends" | "search">("online");
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE" | "OTHER">("ALL");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set());
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);

  // Stories real-time state map
  const [activeStories, setActiveStories] = useState<{[userId: string]: Story}>({});

  // Profile Modal State
  const [profileTarget, setProfileTarget] = useState<UserProfile | null>(null);
  const [profileMode, setProfileMode] = useState<"quick" | "view" | "edit">("quick");
  const [profileStoryView, setProfileStoryView] = useState(false);

  // Dynamic custom ranks, announcements, notifications, and admin state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isVitroModalOpen, setIsVitroModalOpen] = useState(false);

  // Mail / Inbox Menu States
  const [isMailMenuOpen, setIsMailMenuOpen] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [activeChats, setActiveChats] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`active_chats_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [dismissedPms, setDismissedPms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`dismissed_pms_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`active_chats_${user.id}`, JSON.stringify(activeChats));
  }, [activeChats, user.id]);

  useEffect(() => {
    localStorage.setItem(`dismissed_pms_${user.id}`, JSON.stringify(dismissedPms));
  }, [dismissedPms, user.id]);

  // Spotify currently playing poller is removed

  useEffect(() => {
    if (!user.id) return;
    
    const q1 = query(collection(firestore, "private_messages"), where("recipient_id", "==", user.id));
    const q2 = query(collection(firestore, "private_messages"), where("sender_id", "==", user.id));
    
    let isInitial = true;
    const unsubscribe1 = onSnapshot(q1, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrivateMessage));
      setPrivateMessages(prev => {
        const other = prev.filter(m => m.recipient_id !== user.id);
        return [...other, ...msgs];
      });

      // Auto-restore dismissed chats if they send a new message
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (data.sender_id && dismissedPms.includes(data.sender_id)) {
            setDismissedPms(prev => prev.filter(id => id !== data.sender_id));
          }
        }
      });

      if (!isInitial) {
        const hasNewIncoming = snapshot.docChanges().some(change => change.type === "added" && !(change.doc.data().sender_id === user.id));
        if (hasNewIncoming && soundsEnabled) {
          playAudio('/private.mp3');
        }
      }
      isInitial = false;
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrivateMessage));
      setPrivateMessages(prev => {
        const other = prev.filter(m => m.sender_id !== user.id);
        return [...other, ...msgs];
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [user.id, soundsEnabled]);

  // Font & Icon Control Customization States
  const [isFontControlMenuOpen, setIsFontControlMenuOpen] = useState(false);
  const [showFontFamilyModal, setShowFontFamilyModal] = useState(false);
  const [showIconColorModal, setShowIconColorModal] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>("Default");
  const [selectedIconStyle, setSelectedIconStyle] = useState<any>({ id: 'default', type: 'default' });
  const [fontSizeScale, setFontSizeScale] = useState<number>(100);
  
  // Friend & Status Requests State
  const [receivedFriendRequests, setReceivedFriendRequests] = useState<any[]>([]);
  const [receivedStatusRequests, setReceivedStatusRequests] = useState<any[]>([]);
  const [isRequestsMenuOpen, setIsRequestsMenuOpen] = useState(false);
  const [customRanks, setCustomRanks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  const pmConversations = useMemo(() => {
    const convoMap = new Map<string, { unread: number; lastMessageAt: number; text: string }>();
    
    privateMessages.forEach(m => {
      const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      const isUnread = !m.is_read && m.recipient_id === user.id;
      const time = new Date(m.created_at).getTime();

      const existing = convoMap.get(otherId) || { unread: 0, lastMessageAt: 0, text: "" };
      if (isUnread) existing.unread += 1;
      if (time > existing.lastMessageAt) {
        existing.lastMessageAt = time;
        existing.text = m.text || "Shared an attachment";
      }
      
      convoMap.set(otherId, existing);
    });

    return Array.from(convoMap.entries())
      .map(([userId, data]) => {
        const profile = allProfiles.find(p => p.id === userId);
        return { userId, profile, ...data };
      })
      .filter(c => c.profile && !dismissedPms.includes(c.userId))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }, [privateMessages, user.id, allProfiles, dismissedPms]);

  const totalUnreadPrivateCount = useMemo(() => {
    return privateMessages.filter(m => !m.is_read && m.recipient_id === user.id).length;
  }, [privateMessages, user.id]);

  const handleOpenPrivateChat = (userId: string) => {
    setDismissedPms(prev => prev.filter(id => id !== userId));
    if (!activeChats.includes(userId)) {
      setActiveChats(prev => [...prev, userId]);
    }
  };

  const handleClosePrivateChat = (userId: string) => {
    setActiveChats(prev => prev.filter(id => id !== userId));
  };

  const handleDismissConversation = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleClosePrivateChat(userId);
    if (!dismissedPms.includes(userId)) {
      setDismissedPms(prev => [...prev, userId]);
    }
  };

  const handleClearPrivateChatsHistory = async () => {
    const messagesToClear = privateMessages.filter(m => m.sender_id === user.id || m.recipient_id === user.id);
    for (const msg of messagesToClear) {
      try {
        await deleteDoc(doc(firestore, "private_messages", msg.id));
      } catch (e) {
        console.error(e);
      }
    }
    setPrivateMessages([]);
    setActiveChats([]);
    setDismissedPms([]);
    setShowClearConfirmModal(false);
  };

  // Collaborative Paint, Currency Convert, and Secret Messages States
  const [showPlusOptions, setShowPlusOptions] = useState(false);
  const [showSoundSettingsModal, setShowSoundSettingsModal] = useState(false);
  const [chatSoundsEnabled, setChatSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem("chatSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [privateSoundsEnabled, setPrivateSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem("privateSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [notificationSoundsEnabled, setNotificationSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [tagSoundsEnabled, setTagSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem("tagSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [callSoundsEnabled, setCallSoundsEnabled] = useState(() => {
    const saved = localStorage.getItem("callSoundsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [showPaintModal, setShowPaintModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSecretMessageModal, setShowSecretMessageModal] = useState(false);
  const [showGallerySettingsModal, setShowGallerySettingsModal] = useState(false);
  const [showSecretMessagesListModal, setShowSecretMessagesListModal] = useState(false);
  const [showProfileVisitorsModal, setShowProfileVisitorsModal] = useState(false);
  const [activeDecisionNotif, setActiveDecisionNotif] = useState<any | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);

  // Form states inside Admin Panel
  const [newRankKey, setNewRankKey] = useState("");
  const [newRankName, setNewRankName] = useState("");
  const [newRankIcon, setNewRankIcon] = useState("");
  const [newRankPriority, setNewRankPriority] = useState("15");
  const [newRankIsStaff, setNewRankIsStaff] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [globalNotifText, setGlobalNotifText] = useState("");
  const [adminTab, setAdminTab] = useState<"accounts" | "ranks" | "announcements">("accounts");

  const playNotifySound = () => {
    if (!soundsEnabled) return;
    playAudio('/notify.mp3');
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});
  const lastPlayTime = useRef<{ [key: string]: number }>({});

  const playSynthSound = (src: string) => {
    const nowTime = Date.now();
    const last = lastPlayTime.current[src] || 0;
    if (nowTime - last < 150) return; // Prevent double trigger in fast succession
    lastPlayTime.current[src] = nowTime;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (src.includes('clear')) {
        // Soft sweep sound for clear
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (src.includes('username')) {
        // Elegant double chime note alert for mention tags
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        osc.frequency.setValueAtTime(784, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (src.includes('message')) {
        // High quality sweet organic notification bubble sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.exponentialRampToValueAtTime(784, now + 0.12); // G5
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (src.includes('private')) {
        // Soft double-pulse private message chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (src.includes('notify')) {
        // Multi-tone chime sound for notifications/username changes
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(554, now + 0.08); // C#5
        osc.frequency.setValueAtTime(659, now + 0.16); // E5
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (src.includes('join')) {
        // Pleasant bubble join sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554, now + 0.15);
        gainNode.gain.setValueAtTime(0.07, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        // Simple pleasant short alert
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      console.warn("Synthesizer fallback failed to construct:", e);
    }
  };

  const playAudio = (src: string) => {
    if (!soundsEnabled) return;
    
    // Normalize and map to the specific requested sound files
    let filename = "";
    const lower = src.toLowerCase();
    
    // Check individual toggles
    if (lower.includes('message') || lower.includes('msg')) {
      if (!chatSoundsEnabled) return;
    }
    if (lower.includes('private') || lower.includes('pm')) {
      if (!privateSoundsEnabled) return;
    }
    if (lower.includes('username') || lower.includes('tag')) {
      if (!tagSoundsEnabled) return;
    }
    if (lower.includes('notify') || lower.includes('notif') || lower.includes('news')) {
      if (!notificationSoundsEnabled) return;
    }
    if (lower.includes('action') || lower.includes('ban') || lower.includes('kick') || lower.includes('mute') || lower.includes('username_change') || lower.includes('clear')) {
      if (!callSoundsEnabled) return;
    }

    if (lower.includes('clear')) filename = "clear.mp3";
    else if (lower.includes('username') || lower.includes('tag')) filename = "username.mp3";
    else if (lower.includes('private') || lower.includes('pm')) filename = "private.mp3";
    else if (lower.includes('message') || lower.includes('msg')) filename = "message.mp3";
    else if (lower.includes('action') || lower.includes('ban') || lower.includes('kick') || lower.includes('mute') || lower.includes('username_change')) filename = "action.mp3";
    else if (lower.includes('notify') || lower.includes('notif')) filename = "notify.mp3";
    else if (lower.includes('news')) filename = "new_news.mp3";
    else filename = src;

    // Remove any leading slashes or full paths to standardize
    if (filename.includes('/')) {
      filename = filename.substring(filename.lastIndexOf('/') + 1);
    }

    try {
      const fullSrc = `/${filename}`;
      let audio = audioCache.current[fullSrc];
      if (!audio) {
        audio = new Audio(getAssetUrl(fullSrc));
        audioCache.current[fullSrc] = audio;
      }
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn(`HTML5 Audio play failed for ${filename}, falling back to synthesizer:`, err);
        // Play synth fallback
        const synthKey = filename.replace('.mp3', '');
        playSynthSound(synthKey);
      });
    } catch (err) {
      console.warn("Audio element setup failed, falling back to synthesizer:", err);
      const synthKey = filename.replace('.mp3', '');
      playSynthSound(synthKey);
    }
  };

  // Real-time listener for user stories to display indicator rings
  useEffect(() => {
    const storiesCol = collection(firestore, 'stories');
    const unsubscribe = onSnapshot(storiesCol, (snapshot) => {
      const storiesMap: {[userId: string]: Story} = {};
      const now = Date.now();
      snapshot.forEach((doc) => {
        const storyData = doc.data() as Story;
        try {
          const storyTime = new Date(storyData.created_at).getTime();
          if (now - storyTime < 24 * 60 * 60 * 1000) {
            storiesMap[storyData.user_id] = storyData;
          }
        } catch (e) {
          storiesMap[storyData.user_id] = storyData;
        }
      });
      setActiveStories(storiesMap);
    }, (error) => {
      console.error("Error listening to stories:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      // Warm up and unlock AudioContext if needed
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (err) {}

      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // 1. Fetch initial messages and subscribe to real-time
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload?.new as any;
        if (!newMsg) return;
        
        if (newMsg.text?.startsWith('[SYSTEM] Chat cleared by') || newMsg.text?.startsWith('[SYSTEM] Chat cleared:')) {
           playAudio('/clear.mp3');
           setMessages([]);
           fetchMessageAuthor(newMsg);
           return;
        } else if (newMsg.text?.startsWith('[USERNAME_CHANGE] ')) {
           playAudio('/action.mp3');
        } else if (newMsg.text?.startsWith('[SYSTEM] ') && (
          newMsg.text.includes('has been banned') ||
          newMsg.text.includes('has been unbanned') ||
          newMsg.text.includes('has been kicked') ||
          newMsg.text.includes('has been unkicked') ||
          newMsg.text.includes('has been muted') ||
          newMsg.text.includes('has been unmuted')
        )) {
           playAudio('/action.mp3');
        } else if (newMsg.profile_id !== user.id) {
           if (newMsg.text && newMsg.text.toLowerCase().includes(`@${user.username.toLowerCase()}`)) {
              playAudio('/username.mp3');
           } else {
              playAudio('/message.mp3');
           }
        }
        
        fetchMessageAuthor(newMsg);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        if (payload?.old?.id) {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMsg = payload?.new as any;
        if (!updatedMsg) return;
        setMessages(prev => prev.map(m => {
          if (m.id === updatedMsg.id) {
            return {
              ...m,
              text: updatedMsg.text || "",
              image_url: updatedMsg.image_url,
            };
          }
          return m;
        }));
      })
      .subscribe();

    const handleBeforeUnload = () => {
       supabase.removeChannel(channel);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user.id, user.username]);

  // Dynamic custom ranks, announcements, notifications, and profiles fetch + real-time subscriptions
  useEffect(() => {
    // 1. Fetch custom ranks
    supabase
      .from('custom_ranks')
      .select('*')
      .order('priority', { ascending: true })
      .then(({ data }) => {
        if (data) setCustomRanks(data);
      });

    // 2. Fetch announcements
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data);
      });

    // 3. Fetch notifications for current user
    supabase
      .from('notifications')
      .select('*')
      .or(`target_id.is.null,target_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data);
      });

    // 4. Set up real-time subscriptions for notifications, custom_ranks, and announcements
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload?.new;
        if (!newNotif) return;
        if (!newNotif.target_id || newNotif.target_id === user.id) {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadNotifications(true);
          playNotifySound();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload?.old?.id) {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    const customRanksChannel = supabase
      .channel('custom-ranks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_ranks' }, () => {
        supabase
          .from('custom_ranks')
          .select('*')
          .order('priority', { ascending: true })
          .then(({ data }) => {
            if (data) setCustomRanks(data);
          });
      })
      .subscribe();

    const announcementsChannel = supabase
      .channel('announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) setAnnouncements(data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(customRanksChannel);
      supabase.removeChannel(announcementsChannel);
    };
  }, [user.id]);

  const allRanksInfo = useMemo(() => {
    const ranks = { ...RANKS_INFO };
    customRanks.forEach((cr) => {
      ranks[cr.rank_key.toUpperCase()] = {
        name: cr.name,
        icon: cr.icon,
        priority: cr.priority,
        isStaff: cr.is_staff
      };
    });
    return ranks;
  }, [customRanks]);

  const friendsProfiles = useMemo(() => {
    return friends.map(f => {
      const friendId = f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1;
      return allProfiles.find(p => p.id === friendId);
    }).filter(Boolean) as UserProfile[];
  }, [friends, allProfiles, user.id]);

  const fetchAllProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setAllProfiles(data.map(p => {
        const isDev = p.email === 'dev@gmail.com';
        return {
          id: p.id,
          username: p.username,
          gender: p.gender || "Not specified",
          age: p.age || 0,
          pfp: p.pfp || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`,
          banner: p.banner,
          aboutMe: p.about_me,
          mood: p.mood,
          rank: mapDbRankToUserRank(p.rank),
          email: p.email,
          is_muted: p.is_muted,
          mute_expires_at: p.mute_expires_at,
          coins: isDev ? 100000000 : (p.coins !== undefined ? p.coins : 1000),
          rubies: isDev ? 1000000 : (p.rubies !== undefined ? p.rubies : 10),
          total_xp: isDev ? 24975000 : (p.total_xp || 0),
          weekly_xp: isDev ? 24975000 : (p.weekly_xp || 0),
          monthly_xp: isDev ? 24975000 : (p.monthly_xp || 0),
          chat_background: p.chat_background || "",
          custom_status: p.custom_status || "online",
          custom_profile_enabled: p.custom_profile_enabled,
          profile_layout: p.profile_layout,
          profile_locked: p.profile_locked,
          profile_lock_count: p.profile_lock_count,
          avatar_decoration: p.avatar_decoration || "",
          nameplate: p.nameplate || ""
        };
      }));
    }
  };

  const handleAddCustomRank = async () => {
    if (!newRankKey.trim() || !newRankName.trim() || !newRankIcon.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const priorityNum = parseInt(newRankPriority);
    if (isNaN(priorityNum)) {
      alert("Priority must be a valid number.");
      return;
    }
    
    const { error } = await supabase.from('custom_ranks').insert({
      rank_key: newRankKey.toUpperCase().trim(),
      name: newRankName.trim(),
      icon: newRankIcon.trim(),
      priority: priorityNum,
      is_staff: newRankIsStaff
    });
    
    if (!error) {
      setNewRankKey("");
      setNewRankName("");
      setNewRankIcon("");
      setNewRankPriority("15");
      setNewRankIsStaff(false);
      alert("Custom rank added successfully!");
    } else {
      alert("Error adding custom rank: " + error.message);
    }
  };

  const handleDeleteCustomRank = async (id: string) => {
    const { error } = await supabase.from('custom_ranks').delete().eq('id', id);
    if (error) {
      alert("Error deleting custom rank: " + error.message);
    }
  };

  const handleSendGlobalNotification = async () => {
    if (!globalNotifText.trim()) return;
    
    const { error } = await supabase.from('notifications').insert({
      target_id: null,
      sender_id: user.id,
      sender_username: user.username,
      sender_pfp: user.pfp,
      sender_rank: user.rank,
      message: globalNotifText
    });
    
    if (!error) {
      setGlobalNotifText("");
      alert("Global notification broadcasted successfully!");
    } else {
      alert("Error broadcasting: " + error.message);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username, pfp, rank, username_color, message_color, avatar_decoration, nameplate)')
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      const formatted = data
        .filter((m: any) => !(typeof m.text === 'string' && (m.text.startsWith('[SYSTEM] Chat cleared by') || m.text.startsWith('[SYSTEM] Chat cleared:'))))
        .map((m: any) => {
        const isSystem = typeof m.text === 'string' && m.text.startsWith('[SYSTEM]');
        return {
          id: m.id,
          profile_id: m.profile_id,
          username: m.profiles?.username || "Unknown",
          pfp: m.profiles?.pfp || "https://api.dicebear.com/7.x/adventurer/svg?seed=existence",
          text: isSystem && m.text ? m.text.replace('[SYSTEM]', '').trim() : (m.text || ""),
          image_url: m.image_url,
          time: m.created_at && !isNaN(new Date(m.created_at).getTime()) ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : getSyncedDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isSystem,
          rank: mapDbRankToUserRank(m.profiles?.rank),
          username_color: m.profiles?.username_color,
          message_color: m.profiles?.message_color,
          avatar_decoration: m.profiles?.avatar_decoration,
          nameplate: m.profiles?.nameplate
        };
      });
      setMessages(formatted);
    }
  };

  const fetchMessageAuthor = async (rawMsg: any) => {
    if (!rawMsg) return;

    let profileData: any = null;
    if (rawMsg.profile_id) {
      const { data } = await supabase
        .from('profiles')
        .select('username, pfp, rank, username_color, message_color, avatar_decoration, nameplate')
        .eq('id', rawMsg.profile_id)
        .single();
      profileData = data;
    }

    const username = profileData?.username || rawMsg.username || "Unknown";
    const pfp = profileData?.pfp || rawMsg.pfp || "https://api.dicebear.com/7.x/adventurer/svg?seed=existence";
    const rawText = rawMsg.text || "";
    const isSystem = typeof rawText === 'string' && rawText.startsWith('[SYSTEM]');
    
    const rawTime = rawMsg.created_at ? new Date(rawMsg.created_at) : getSyncedDate();
    const formattedTime = isNaN(rawTime.getTime()) 
       ? getSyncedDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
       : rawTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formattedMsg: Message = {
      id: rawMsg.id,
      profile_id: rawMsg.profile_id || null,
      username,
      pfp,
      text: isSystem && typeof rawText === 'string' ? rawText.replace('[SYSTEM]', '').trim() : rawText,
      image_url: rawMsg.image_url || null,
      time: formattedTime,
      isSystem,
      rank: mapDbRankToUserRank(profileData?.rank || rawMsg.rank || 'VIP'),
      username_color: profileData?.username_color || rawMsg.username_color,
      message_color: profileData?.message_color || rawMsg.message_color,
      avatar_decoration: profileData?.avatar_decoration,
      nameplate: profileData?.nameplate
    };

    setMessages(prev => {
      if (typeof rawText === 'string' && (rawText.startsWith('[SYSTEM] Chat cleared by') || rawText.startsWith('[SYSTEM] Chat cleared:'))) {
        return [formattedMsg];
      }
      const next = [
        ...prev.filter(m => 
          m && m.id !== formattedMsg.id && 
          !(m.id && typeof m.id === 'string' && m.id.startsWith('temp-') && 
            (m.profile_id === formattedMsg.profile_id || (m.username === formattedMsg.username && m.profile_id === null)) && 
            (m.text || "").trim() === (formattedMsg.text || "").trim() && 
            (m.image_url || null) === (formattedMsg.image_url || null))
        ), 
        formattedMsg
      ];
      return next.slice(-500); // Wipe history after 500
    });
  };

  // 2. Online List logic & Presence
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const mapDbProfileToOnlineUser = (p: any): OnlineUser => {
    const isDev = p.email === 'dev@gmail.com';
    return {
      id: p.id,
      username: p.username,
      gender: p.gender || "Not specified",
      age: p.age || 0,
      pfp: p.pfp || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`,
      banner: p.banner,
      aboutMe: p.about_me,
      mood: p.mood,
      createdDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      language: p.language,
      currentRoom: p.current_room,
      rank: mapDbRankToUserRank(p.rank),
      likes: p.likes || 0,
      is_muted: p.is_muted,
      mute_expires_at: p.mute_expires_at,
      email: p.email,
      coins: isDev ? 100000000 : (p.coins !== undefined ? p.coins : 1000),
      rubies: isDev ? 1000000 : (p.rubies !== undefined ? p.rubies : 10),
      total_xp: isDev ? 24975000 : (p.total_xp || 0),
      weekly_xp: isDev ? 24975000 : (p.weekly_xp || 0),
      monthly_xp: isDev ? 24975000 : (p.monthly_xp || 0),
      chat_background: p.chat_background || "",
      custom_status: p.custom_status || "online",
      custom_profile_enabled: p.custom_profile_enabled,
      profile_layout: p.profile_layout,
      profile_locked: p.profile_locked,
      profile_lock_count: p.profile_lock_count,
      username_color: p.username_color || "#ffffff",
      message_color: p.message_color || "#e9d5ff",
      avatar_decoration: p.avatar_decoration || "",
      nameplate: p.nameplate || "",
      isSystem: false,
      isCurrentUser: user && p.id === user.id,
      status: 'offline' // Overridden by computedUsers dynamically
    };
  };

  const getUserCardStyle = (u: any): { style: React.CSSProperties; className: string } => {
    return { style: {}, className: "" };
  };

  const fetchFriends = async () => {
    if (!user || !user.id) return;
    const { data, error } = await supabase
      .from('friends')
      .select('*');
    if (!error && data) {
      const filtered = data.filter((f: any) => f.user_id_1 === user.id || f.user_id_2 === user.id);
      setFriends(filtered);
    }
  };

  // Listen to received friend and relationship/status requests
  useEffect(() => {
    if (!user || !user.id) return;

    const unsubFriendReqs = onSnapshot(collection(firestore, "friend_requests"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const pendingReqs = docs.filter(r => r.receiver_id === user.id && r.status === "pending");
      setReceivedFriendRequests(pendingReqs);
    });

    const unsubRelReqs = onSnapshot(collection(firestore, "relationship_requests"), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const pendingReqs = docs.filter(r => r.receiver_id === user.id && r.status === "pending");
      setReceivedStatusRequests(pendingReqs);
    });

    return () => {
      unsubFriendReqs();
      unsubRelReqs();
    };
  }, [user.id]);

  // Dynamic Font & Icon Style custom helpers
  const loadGoogleFont = (fontName: string) => {
    if (!fontName || fontName === 'Default') {
      document.documentElement.style.removeProperty('--app-font-family');
      return;
    }
    const fontId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      const formattedName = fontName.replace(/\s+/g, '+');
      link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;700;900&display=swap`;
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--app-font-family', `"${fontName}", sans-serif`);
  };

  const applyIconStyle = (style: any) => {
    if (!style || style.id === 'default') {
      document.documentElement.style.removeProperty('--app-icon-stroke');
      document.documentElement.style.removeProperty('--app-icon-filter');
      document.documentElement.style.removeProperty('--app-icon-animation');
      return;
    }

    if (style.type === 'solid') {
      document.documentElement.style.setProperty('--app-icon-stroke', style.value);
      document.documentElement.style.removeProperty('--app-icon-filter');
      document.documentElement.style.removeProperty('--app-icon-animation');
    } else if (style.type === 'gradient') {
      document.documentElement.style.setProperty('--app-icon-stroke', `url(#icon-grad-${style.id})`);
      document.documentElement.style.removeProperty('--app-icon-filter');
      document.documentElement.style.removeProperty('--app-icon-animation');
    } else if (style.type === 'neon') {
      document.documentElement.style.setProperty('--app-icon-stroke', style.value);
      document.documentElement.style.setProperty('--app-icon-filter', `drop-shadow(0 0 2px ${style.glowColor}) drop-shadow(0 0 5px ${style.glowColor})`);
      document.documentElement.style.removeProperty('--app-icon-animation');
    } else if (style.type === 'shimmer') {
      if (style.id.startsWith('shimmer-grad-')) {
        document.documentElement.style.setProperty('--app-icon-stroke', `url(#icon-grad-${style.id})`);
      } else {
        document.documentElement.style.setProperty('--app-icon-stroke', style.value);
      }
      document.documentElement.style.setProperty('--app-icon-filter', `drop-shadow(0 0 3px ${style.glowColor || '#ffffff'})`);
      document.documentElement.style.setProperty('--app-icon-animation', 'icon-shimmer-pulse 2s infinite ease-in-out');
    }
  };

  const handleZoomIn = () => {
    setFontSizeScale(prev => {
      const next = Math.min(prev + 10, 150);
      localStorage.setItem('app-font-size-scale', next.toString());
      document.documentElement.style.fontSize = `${next}%`;
      return next;
    });
  };

  const handleZoomOut = () => {
    setFontSizeScale(prev => {
      const next = Math.max(prev - 10, 70);
      localStorage.setItem('app-font-size-scale', next.toString());
      document.documentElement.style.fontSize = `${next}%`;
      return next;
    });
  };

  const handleResetFont = () => {
    setFontFamily('Default');
    localStorage.removeItem('app-font-family');
    document.documentElement.style.removeProperty('--app-font-family');
    setFontSizeScale(100);
    localStorage.setItem('app-font-size-scale', '100');
    document.documentElement.style.fontSize = '100%';
  };

  const handleResetIcons = () => {
    setSelectedIconStyle({ id: 'default', type: 'default' });
    localStorage.removeItem('app-icon-style');
    document.documentElement.style.removeProperty('--app-icon-stroke');
    document.documentElement.style.removeProperty('--app-icon-filter');
    document.documentElement.style.removeProperty('--app-icon-animation');
  };

  const handleResetAll = () => {
    handleResetFont();
    handleResetIcons();
  };

  // Customization Startup Loader Effect
  useEffect(() => {
    try {
      const savedScale = localStorage.getItem('app-font-size-scale');
      if (savedScale) {
        setFontSizeScale(Number(savedScale));
        document.documentElement.style.fontSize = `${savedScale}%`;
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const savedFont = localStorage.getItem('app-font-family');
      if (savedFont) {
        setFontFamily(savedFont);
        loadGoogleFont(savedFont);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const savedIconStyle = localStorage.getItem('app-icon-style');
      if (savedIconStyle) {
        const style = JSON.parse(savedIconStyle);
        setSelectedIconStyle(style);
        applyIconStyle(style);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const mappedFriendRequests = useMemo(() => {
    return receivedFriendRequests.map(req => {
      const sender = allProfiles.find(p => p.id === req.sender_id);
      return {
        ...req,
        sender
      };
    }).filter(req => req.sender) as any[];
  }, [receivedFriendRequests, allProfiles]);

  const mappedStatusRequests = useMemo(() => {
    return receivedStatusRequests.map(req => {
      const sender = allProfiles.find(p => p.id === req.sender_id);
      return {
        ...req,
        sender
      };
    }).filter(req => req.sender) as any[];
  }, [receivedStatusRequests, allProfiles]);

  const totalRequestsCount = useMemo(() => {
    return mappedFriendRequests.length + mappedStatusRequests.length;
  }, [mappedFriendRequests, mappedStatusRequests]);

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    try {
      const friendshipId = `friend_${senderId}_${user.id}`;
      await setDoc(doc(firestore, "friends", friendshipId), {
        id: friendshipId,
        user_id_1: senderId,
        user_id_2: user.id,
        created_at: new Date().toISOString()
      });
      await deleteDoc(doc(firestore, "friend_requests", requestId));
      alert("Friend request accepted!");
    } catch (err) {
      console.error(err);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(firestore, "friend_requests", requestId));
      alert("Friend request declined.");
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRelationshipRequest = async (requestId: string, senderId: string, type: string) => {
    try {
      const relId = `rel_${senderId}_${user.id}`;
      await setDoc(doc(firestore, "relationships", relId), {
        id: relId,
        user_id_1: senderId,
        user_id_2: user.id,
        status: type,
        created_at: new Date().toISOString()
      });
      await deleteDoc(doc(firestore, "relationship_requests", requestId));
      alert("Relationship request accepted!");
    } catch (err) {
      console.error(err);
    }
  };

  const declineRelationshipRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(firestore, "relationship_requests", requestId));
      alert("Relationship request declined.");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    fetchFriends();
    fetchAllProfiles();

    const friendsChannel = supabase
      .channel('friends-realtime-chatroom')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friends' }, () => {
        fetchFriends();
        fetchAllProfiles();
      })
      .subscribe();
    
    // Subscribe to all profile changes (INSERT, UPDATE, DELETE) in real-time
    const profileChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        fetchAllProfiles();
        if (payload.eventType === 'INSERT' && payload.new) {
          const newUser = mapDbProfileToOnlineUser(payload.new);
          setOnlineUsers(prev => {
            if (prev.some(u => u.id === newUser.id)) return prev;
            const updatedList = [...prev, newUser];
            
            // Re-sort the list: Rank priority first, then username alphabetical
            return updatedList.sort((a, b) => {
              const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
              if (rankDiff !== 0) return rankDiff;
              return a.username.localeCompare(b.username);
            });
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setOnlineUsers(prev => {
            const updatedList = prev.map(u => 
              u.id === payload.new.id ? { 
                ...u, 
                username: payload.new.username !== undefined ? payload.new.username : u.username,
                pfp: payload.new.pfp !== undefined ? payload.new.pfp : u.pfp,
                banner: payload.new.banner !== undefined ? payload.new.banner : u.banner,
                aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : u.aboutMe,
                mood: payload.new.mood !== undefined ? payload.new.mood : u.mood,
                age: payload.new.age !== undefined ? payload.new.age : u.age,
                gender: payload.new.gender !== undefined ? payload.new.gender : u.gender,
                rank: mapDbRankToUserRank(payload.new.rank),
                likes: payload.new.likes !== undefined ? payload.new.likes : u.likes,
                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : u.is_muted,
                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : u.mute_expires_at,
                username_color: payload.new.username_color !== undefined ? payload.new.username_color : u.username_color,
                message_color: payload.new.message_color !== undefined ? payload.new.message_color : u.message_color,
                avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : u.avatar_decoration,
                nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : u.nameplate
              } : u
            );
            
            // Re-sort the list in case username or rank changed
            return updatedList.sort((a, b) => {
              const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
              if (rankDiff !== 0) return rankDiff;
              return a.username.localeCompare(b.username);
            });
          });
          
          if (user && payload.new.id === user.id) {
            onUpdateUserRef.current({
              username: payload.new.username !== undefined ? payload.new.username : user.username,
              pfp: payload.new.pfp !== undefined ? payload.new.pfp : user.pfp,
              banner: payload.new.banner !== undefined ? payload.new.banner : user.banner,
              aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : user.aboutMe,
              mood: payload.new.mood !== undefined ? payload.new.mood : user.mood,
              age: payload.new.age !== undefined ? payload.new.age : user.age,
              gender: payload.new.gender !== undefined ? payload.new.gender : user.gender,
              rank: mapDbRankToUserRank(payload.new.rank),
              is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : user.is_muted,
              mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : user.mute_expires_at,
              username_color: payload.new.username_color !== undefined ? payload.new.username_color : user.username_color,
              message_color: payload.new.message_color !== undefined ? payload.new.message_color : user.message_color,
              avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : user.avatar_decoration,
              nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : user.nameplate
            });
          }

          setProfileTarget(prev => {
            if (prev && prev.id === payload.new.id) {
              return {
                ...prev,
                username: payload.new.username !== undefined ? payload.new.username : prev.username,
                pfp: payload.new.pfp !== undefined ? payload.new.pfp : prev.pfp,
                banner: payload.new.banner !== undefined ? payload.new.banner : prev.banner,
                aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : prev.aboutMe,
                mood: payload.new.mood !== undefined ? payload.new.mood : prev.mood,
                age: payload.new.age !== undefined ? payload.new.age : prev.age,
                gender: payload.new.gender !== undefined ? payload.new.gender : prev.gender,
                rank: mapDbRankToUserRank(payload.new.rank),
                likes: payload.new.likes !== undefined ? payload.new.likes : prev.likes,
                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : prev.is_muted,
                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : prev.mute_expires_at,
                username_color: payload.new.username_color !== undefined ? payload.new.username_color : prev.username_color,
                message_color: payload.new.message_color !== undefined ? payload.new.message_color : prev.message_color,
                avatar_decoration: payload.new.avatar_decoration !== undefined ? payload.new.avatar_decoration : prev.avatar_decoration,
                nameplate: payload.new.nameplate !== undefined ? payload.new.nameplate : prev.nameplate
              };
            }
            return prev;
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setOnlineUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    // Supabase Presence
    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: user.id } }
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const ids = new Set<string>();
      for (const id in state) {
        ids.add(id);
      }
      setOnlineUserIds(ids);
    }).on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // Silenced join events as requested
    }).on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // Silenced leave events as requested
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && user) {
        await presenceChannel.track({ username: user.username, online_at: getSyncedDate().toISOString() });
      }
    });

    const handleBeforeUnloadPresence = () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
    window.addEventListener('beforeunload', handleBeforeUnloadPresence);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnloadPresence);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(friendsChannel);
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [user.id]);

  const fetchOnlineUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (data) {
      const formatted: OnlineUser[] = data.map(mapDbProfileToOnlineUser);

      // Sort: Rank priority first, then username alphabetical
      const sorted = formatted.sort((a, b) => {
        const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
        if (rankDiff !== 0) return rankDiff;
        return a.username.localeCompare(b.username);
      });

      setOnlineUsers(sorted);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const incrementXp = async () => {
    if (user.email === 'dev@gmail.com') return;

    const currentXp = user.total_xp || 0;
    const newXp = currentXp + 1;
    const newWeeklyXp = (user.weekly_xp || 0) + 1;
    const newMonthlyXp = (user.monthly_xp || 0) + 1;

    const { level: oldLevel } = getLevelFromXp(currentXp);
    const { level: newLevel } = getLevelFromXp(newXp);

    const updates: any = {
      total_xp: newXp,
      weekly_xp: newWeeklyXp,
      monthly_xp: newMonthlyXp
    };

    if (newLevel > oldLevel) {
      const currentCoins = user.coins ?? 1000;
      const currentRubies = user.rubies ?? 10;
      const bonusCoins = 200;
      const bonusRubies = 10;

      updates.coins = currentCoins + bonusCoins;
      updates.rubies = currentRubies + bonusRubies;

      onUpdateUser(updates);
      await supabase.from('profiles').update(updates).eq('id', user.id);

      await supabase.from('notifications').insert({
        target_id: user.id,
        message: `You leveled up to Level ${newLevel}! Received ${bonusCoins} Gold and ${bonusRubies} Rubies!`
      });

      addLocalSystemMessage(`🎉 LEVEL UP! You reached Level ${newLevel} and received ${bonusCoins} Gold & ${bonusRubies} Rubies!`);
      if (soundsEnabled) {
        playAudio('/level_up.mp3');
      }
    } else {
      onUpdateUser(updates);
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  const addLocalSystemMessage = (textStr: string) => {
    const localMsg: Message = {
      id: "local-sys-" + Date.now() + Math.random(),
      profile_id: "system",
      username: "System",
      pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=system",
      text: textStr,
      time: getSyncedDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
      rank: 'DEVELOPER'
    };
    setMessages(prev => [...prev, localMsg]);
  };

  const activeUserRef = useRef(user);

  useEffect(() => {
    activeUserRef.current = user;
  }, [user]);

  const [sessionMessageCount, setSessionMessageCount] = useState(0);

  const incrementMessageCount = () => {
    setSessionMessageCount(prev => {
      const next = prev + 1;
      if (next % 50 === 0) {
        (async () => {
          const currentRubies = activeUserRef.current?.rubies ?? 10;
          const nextRubies = currentRubies + 5;
          onUpdateUserRef.current({ rubies: nextRubies });
          await supabase.from('profiles').update({ rubies: nextRubies }).eq('id', user.id);
          addLocalSystemMessage("💎 Multi-message reward: You received 5 Rubies for sending 50 messages!");
          if (soundsEnabled) {
            playAudio('/action.mp3');
          }
        })();
      }
      return next;
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentU = activeUserRef.current;
      if (currentU && currentU.id) {
        const currentCoins = currentU.coins ?? 1000;
        const nextCoins = currentCoins + 100;
        onUpdateUserRef.current({ coins: nextCoins });
        await supabase.from('profiles').update({ coins: nextCoins }).eq('id', currentU.id);
        addLocalSystemMessage("🪙 Active reward: You received 100 Gold for being active!");
        if (soundsEnabled) {
          playAudio('/action.mp3');
        }
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [soundsEnabled]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (user.is_muted && user.mute_expires_at) {
      const muteEnd = new Date(user.mute_expires_at).getTime();
      const now = getSyncedDate().getTime();
      if (muteEnd > now) {
        alert(`You are muted. Reason: ${user.mute_reason || 'No reason'}`);
        return;
      } else {
        // Mute expired, update profile
        await supabase.from('profiles').update({ is_muted: false, mute_reason: null, mute_expires_at: null }).eq('id', user.id);
        onUpdateUser({ is_muted: false, mute_reason: undefined, mute_expires_at: undefined });
      }
    }

    const text = inputText.trim();
    if (!text) return;

    if (/@system\b/i.test(text)) {
      alert("You cannot mention the System Bot.");
      return;
    }
    
    setInputText("");

    if (text.startsWith('/')) {
      const parts = text.split(' ').filter(Boolean);
      const cmd = parts[0].toLowerCase();
      
      const knownCommands = ['/commands', '/clear', '/announcement', '/annoucement', '/notify'];
      if (!knownCommands.includes(cmd)) {
        if (cmd === '/allin' || cmd === '/dice') {
          addLocalSystemMessage("🎰 Gambling commands are temporarily disabled.");
          return;
        }
        addLocalSystemMessage(`Unknown command "${cmd}". Type /commands to see all available commands.`);
        return;
      }

      if (cmd === '/commands') {
        addLocalSystemMessage(
          `📜 Chat Commands List:\n` +
          `• /commands - Show this help list (only visible to you).\n` +
          `• /clear - Clear your chat screen locally.\n` +
          `• /announcement set [announcement] - (Dev) Set global announcement.\n` +
          `• /announcement remove - (Dev) Remove global announcement.\n` +
          `• /notify [message] - (Dev) Send everyone a notification.`
        );
        return;
      }

      if (cmd === '/announcement' || cmd === '/annoucement') {
        const isDevEmail = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(user.email || '');
        if (!isDevEmail) {
          addLocalSystemMessage("You do not have permission to run this command. (Developer only)");
          return;
        }

        const action = (parts[1] || '').toLowerCase();
        if (action === 'set') {
          const announcementContent = parts.slice(2).join(' ');
          if (!announcementContent.trim()) {
            addLocalSystemMessage("Usage: /announcement set [announcement text]");
            return;
          }

          try {
            await supabase.from('announcements').insert({
              profile_id: user.id,
              text: announcementContent,
            });
            addLocalSystemMessage("📢 Global announcement has been successfully created!");
          } catch (err: any) {
            addLocalSystemMessage(`❌ Error creating announcement: ${err.message}`);
          }
        } else if (action === 'remove') {
          try {
            await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            addLocalSystemMessage("📢 All global announcements have been successfully removed!");
          } catch (err: any) {
            addLocalSystemMessage(`❌ Error removing announcements: ${err.message}`);
          }
        } else {
          addLocalSystemMessage("Usage: /announcement set [text]  OR  /announcement remove");
        }
        return;
      }

      if (cmd === '/notify') {
        const isDevEmail = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(user.email || '');
        if (!isDevEmail) {
          addLocalSystemMessage("You do not have permission to run this command. (Developer only)");
          return;
        }

        const notificationContent = parts.slice(1).join(' ');
        if (!notificationContent.trim()) {
          addLocalSystemMessage("Usage: /notify [notification message]");
          return;
        }

        try {
          await supabase.from('notifications').insert({
            target_id: null,
            sender_id: user.id,
            sender_username: user.username,
            sender_pfp: user.pfp,
            sender_rank: user.rank,
            message: notificationContent
          });
          addLocalSystemMessage("🔔 Global notification has been successfully broadcasted!");
        } catch (err: any) {
          addLocalSystemMessage(`❌ Error sending notification: ${err.message}`);
        }
        return;
      }

      if (cmd === '/clear') {
        const userPriority = allRanksInfo[user.rank]?.priority ?? 14;
        const isFounderOrAbove = userPriority <= 2;

        if (isFounderOrAbove) {
          setMessages([]);
          playAudio('/clear.mp3');
          // Clear on database background
          (async () => {
            try {
              // 1. First insert the trigger system message so other clients get notified in real-time
              await supabase.from('messages').insert([
                {
                  profile_id: user.id,
                  text: `[SYSTEM] Chat cleared by: ${user.username}`,
                  room: 'main'
                }
              ]);
              
              // 2. Wait 2.5 seconds to make sure everyone received the event, then delete everything
              setTimeout(async () => {
                try {
                  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                } catch (e) {
                  console.error("Failed to delete all messages after clear:", e);
                }
              }, 2500);
            } catch (err) {
              console.error("Failed to clear chat on database:", err);
            }
          })();
        } else {
          addLocalSystemMessage("You do not have permission to clear the chat. (Founder and above only)");
        }
        return;
      }

      if (cmd === '/allin') {
        const currency = (parts[1] || '').toLowerCase();
        if (currency !== 'gold' && currency !== 'rubies') {
          addLocalSystemMessage('Usage: /allin [gold/rubies]');
          return;
        }

        const balance = currency === 'gold' ? (user.coins ?? 1000) : (user.rubies ?? 10);
        if (balance <= 0) {
          addLocalSystemMessage(`You do not have any ${currency} to go all-in!`);
          return;
        }

        const betAmount = balance;
        const winRoll = Math.random();
        const won = winRoll < 0.45; // 45% win chance

        let multiplier = 0;
        let payout = 0;

        if (won) {
          const multRoll = Math.random();
          if (multRoll < 0.75) {
            multiplier = 1.5 + Math.random() * 0.5;
          } else if (multRoll < 0.93) {
            multiplier = 2.1 + Math.random() * 2.9;
          } else if (multRoll < 0.98) {
            multiplier = 5.0 + Math.random() * 15.0;
          } else if (multRoll < 0.998) {
            multiplier = 20.0 + Math.random() * 80.0;
          } else {
            multiplier = 100.0 + Math.random() * 900.0;
          }
          multiplier = Math.round(multiplier * 10) / 10;
          payout = Math.floor(betAmount * multiplier);
        }

        const newBalance = balance - betAmount + payout;

        if (currency === 'gold') {
          await onUpdateUser({ coins: newBalance });
        } else {
          await onUpdateUser({ rubies: newBalance });
        }

        const serialized = `[GAMBLE]:${JSON.stringify({
          command: `/allin ${currency}`,
          currency,
          bet: betAmount,
          won,
          payout,
          multiplier
        })}`;

        const { error } = await supabase.from('messages').insert({
          profile_id: user.id,
          text: serialized,
          room: 'main'
        });

        if (!error) {
          await incrementXp();
        } else {
          console.error("Gamble insert error:", error);
        }
        return;
      }

      if (cmd === '/dice') {
        const currency = (parts[1] || '').toLowerCase();
        if (currency !== 'gold' && currency !== 'rubies') {
          addLocalSystemMessage('Usage: /dice [gold/rubies] [amount]');
          return;
        }

        const amountStr = (parts[2] || '').toLowerCase();
        if (!amountStr) {
          addLocalSystemMessage('Usage: /dice [gold/rubies] [amount]');
          return;
        }

        const balance = currency === 'gold' ? (user.coins ?? 1000) : (user.rubies ?? 10);
        let betAmount = 0;
        if (amountStr === 'all' || amountStr === 'allin') {
          betAmount = balance;
        } else {
          betAmount = parseInt(amountStr, 10);
          if (isNaN(betAmount) || betAmount <= 0) {
            addLocalSystemMessage('Please specify a valid positive amount or "all".');
            return;
          }
        }

        if (betAmount > balance) {
          addLocalSystemMessage(`Insufficient funds! You only have ${balance.toLocaleString()} ${currency}.`);
          return;
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        const won = roll === 6;

        let multiplier = 0;
        let payout = 0;

        if (won) {
          const multRoll = Math.random();
          if (multRoll < 0.75) {
            multiplier = 3.0 + Math.random() * 2.0;
          } else if (multRoll < 0.93) {
            multiplier = 5.1 + Math.random() * 9.9;
          } else if (multRoll < 0.98) {
            multiplier = 15.0 + Math.random() * 35.0;
          } else if (multRoll < 0.998) {
            multiplier = 50.0 + Math.random() * 150.0;
          } else {
            multiplier = 200.0 + Math.random() * 800.0;
          }
          multiplier = Math.round(multiplier * 10) / 10;
          payout = Math.floor(betAmount * multiplier);
        }

        const newBalance = balance - betAmount + payout;

        if (currency === 'gold') {
          await onUpdateUser({ coins: newBalance });
        } else {
          await onUpdateUser({ rubies: newBalance });
        }

        const serialized = `[GAMBLE]:${JSON.stringify({
          command: `/dice ${currency} ${betAmount}`,
          currency,
          bet: betAmount,
          roll,
          won,
          payout,
          multiplier
        })}`;

        const { error } = await supabase.from('messages').insert({
          profile_id: user.id,
          text: serialized,
          room: 'main'
        });

        if (!error) {
          await incrementXp();
        } else {
          console.error("Gamble insert error:", error);
        }
        return;
      }
    }

    const optimisticMsg: Message = {
      id: "temp-" + Date.now(),
      profile_id: user.id,
      username: user.username,
      pfp: user.pfp,
      text: text,
      time: getSyncedDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rank: user.rank,
      username_color: user.username_color,
      message_color: user.message_color,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('messages').insert({
      profile_id: user.id,
      text: text,
      room: 'main'
    });
    if (!error) {
      await incrementXp();
      incrementMessageCount();
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local object URL for instant local feedback
    const localUrl = URL.createObjectURL(file);
    const tempId = "temp-" + Date.now();

    const optimisticMsg: Message = {
      id: tempId,
      profile_id: user.id,
      username: user.username,
      pfp: user.pfp,
      text: "",
      image_url: localUrl,
      time: getSyncedDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rank: user.rank,
      username_color: user.username_color,
      message_color: user.message_color,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // Upload file to Supabase storage (or fallback base64 if not configured)
      const imageUrl = await uploadImageToStorage(file, 'chat', file.name);

      const { error } = await supabase.from('messages').insert({
        profile_id: user.id,
        text: " ",
        image_url: imageUrl,
        room: 'main'
      });
      
      if (!error) {
        await incrementXp();
        incrementMessageCount();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      // Remove the optimistic message if upload fails completely
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      // Clean up local object URL
      try {
        URL.revokeObjectURL(localUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleProfileClick = (target: UserProfile, mode: "quick" | "view" | "edit" = "quick", storyView: boolean = false) => {
    setProfileTarget(target);
    setProfileMode(mode);
    setProfileStoryView(storyView);

    if (target && target.id !== user.id && user.id && user.id !== "system" && !user.isSystem) {
      supabase.from("profile_visits").insert({
        profile_id: target.id,
        visitor_id: user.id,
        visitor_username: user.username,
        visitor_pfp: user.pfp || "",
        visitor_rank: user.rank || "USER",
        created_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error("Error logging profile visit:", error);
      });
    }
  };

  const handleMention = (username: string) => {
    setInputText((prev) => (prev ? `${prev} @${username}` : `@${username} `));
  };

  const renderMessageText = (text: string, currentUsername: string) => {
    if (!text) return null;
    const parts = text.split(new RegExp(`(@${currentUsername})\\b`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === `@${currentUsername.toLowerCase()}`) {
        return <span key={i} className="bg-yellow-400/20 text-yellow-400 px-1 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.2)] font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getGiftStyleConfig = (styleName: string) => {
    switch (styleName) {
      case "Royal":
        return {
          cardBg: "from-purple-900/60 to-indigo-950/80 border-purple-500/40",
          boxColor: "text-purple-400",
          boxBg: "bg-purple-900/30 border-purple-500/30",
          glow: "shadow-purple-500/10",
          ribbonColor: "bg-purple-500",
          accentEmoji: "🎁",
        };
      case "Neon":
        return {
          cardBg: "from-fuchsia-950/60 to-cyan-950/80 border-fuchsia-500/40 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
          boxColor: "text-cyan-400 animate-pulse",
          boxBg: "bg-cyan-900/30 border-cyan-500/30",
          glow: "shadow-cyan-500/20",
          ribbonColor: "bg-fuchsia-500",
          accentEmoji: "✨",
        };
      case "Candy":
        return {
          cardBg: "from-amber-950/60 to-red-950/80 border-amber-500/40",
          boxColor: "text-amber-400",
          boxBg: "bg-amber-900/30 border-amber-500/30",
          glow: "shadow-amber-500/10",
          ribbonColor: "bg-red-400",
          accentEmoji: "🍬",
        };
      case "Ice":
        return {
          cardBg: "from-sky-950/60 to-blue-950/80 border-sky-400/40",
          boxColor: "text-sky-300",
          boxBg: "bg-sky-900/30 border-sky-500/30",
          glow: "shadow-sky-400/10",
          ribbonColor: "bg-sky-400",
          accentEmoji: "❄️",
        };
      case "Dark":
        return {
          cardBg: "from-neutral-900/80 to-stone-950/90 border-stone-700/50",
          boxColor: "text-stone-400",
          boxBg: "bg-stone-900/30 border-stone-700/30",
          glow: "shadow-black/50",
          ribbonColor: "bg-stone-600",
          accentEmoji: "🕷️",
        };
      case "Gold":
        return {
          cardBg: "from-yellow-950/60 to-amber-950/80 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
          boxColor: "text-yellow-400 animate-bounce",
          boxBg: "bg-yellow-900/30 border-yellow-500/30",
          glow: "shadow-yellow-500/20",
          ribbonColor: "bg-yellow-500",
          accentEmoji: "🌟",
        };
      case "Love":
        return {
          cardBg: "from-red-950/60 to-pink-950/80 border-red-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
          boxColor: "text-rose-400",
          boxBg: "bg-rose-900/30 border-rose-500/30",
          glow: "shadow-rose-500/10",
          ribbonColor: "bg-rose-500",
          accentEmoji: "💖",
        };
      case "Classic":
      default:
        return {
          cardBg: "from-red-900/60 to-rose-950/80 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          boxColor: "text-red-400",
          boxBg: "bg-red-900/30 border-red-500/30",
          glow: "shadow-red-500/10",
          ribbonColor: "bg-red-500",
          accentEmoji: "🎁",
        };
    }
  };

  const renderPoll = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[POLL]:', '').trim();
      const poll = JSON.parse(jsonStr);
      
      const question = poll.question || "Untitled Poll";
      const options = poll.options || [];
      const mode = poll.mode || "Normal - show voters";
      const duration = poll.duration || "1 hour";
      const votes = poll.votes || {};
      
      let totalVotes = 0;
      options.forEach((_: any, idx: number) => {
        const optVotes = votes[idx] || [];
        totalVotes += optVotes.length;
      });
      
      let userVotedOptionIndex = -1;
      options.forEach((_: any, idx: number) => {
        const optVotes = votes[idx] || [];
        if (optVotes.includes(user.username)) {
          userVotedOptionIndex = idx;
        }
      });

      const handleVote = async (optionIdx: number) => {
        const updatedVotes = { ...votes };
        
        options.forEach((_: any, idx: number) => {
          if (updatedVotes[idx]) {
            updatedVotes[idx] = updatedVotes[idx].filter((u: string) => u !== user.username);
          } else {
            updatedVotes[idx] = [];
          }
        });
        
        if (userVotedOptionIndex !== optionIdx) {
          updatedVotes[optionIdx].push(user.username);
        }
        
        const updatedPoll = { ...poll, votes: updatedVotes };
        const updatedText = `[POLL]:${JSON.stringify(updatedPoll)}`;
        
        setMessages(prev => prev.map(m => {
          if (m.id === msg.id) {
            return { ...m, text: updatedText };
          }
          return m;
        }));
        
        await supabase
          .from('messages')
          .update({ text: updatedText })
          .eq('id', msg.id);
      };

      return (
        <div className="mt-2 bg-[#120f26]/90 border border-purple-500/30 rounded-2xl p-4 max-w-md w-full shadow-2xl space-y-3.5 text-white animate-in zoom-in-95 duration-150">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <Vote className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white leading-snug break-words tracking-wide">{question}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 tracking-wider">
                  {mode}
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-purple-400 tracking-wider">
                  ⏱️ {duration}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {options.map((opt: string, idx: number) => {
              const optVotes = votes[idx] || [];
              const count = optVotes.length;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const hasVotedThis = userVotedOptionIndex === idx;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVote(idx)}
                  className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    hasVotedThis
                      ? "border-purple-500 bg-purple-500/10 hover:bg-purple-500/20"
                      : "border-purple-900/20 bg-black/20 hover:border-purple-500/30 hover:bg-black/40 animate-none cursor-pointer"
                  }`}
                >
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-300 -z-10 ${
                      hasVotedThis ? "bg-purple-500/15" : "bg-purple-900/5"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  
                  <div className="flex justify-between items-center w-full z-10">
                    <span className={`text-xs font-bold leading-normal break-words pr-4 ${hasVotedThis ? "text-purple-300" : "text-white"}`}>
                      {opt}
                    </span>
                    <span className="text-xs font-black text-purple-400 shrink-0">
                      {pct}% <span className="text-[10px] text-purple-500 font-bold ml-1">({count})</span>
                    </span>
                  </div>
                  
                  {mode.toLowerCase().includes("show") && optVotes.length > 0 && (
                    <div className="text-[9px] text-purple-400/70 mt-1 font-semibold leading-normal break-words border-t border-purple-950/10 pt-1 w-full z-10">
                      Voters: {optVotes.join(", ")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-purple-400/60 font-bold border-t border-purple-950/20 pt-2.5">
            <span>Total votes: {totalVotes}</span>
            {userVotedOptionIndex !== -1 && (
              <span className="text-purple-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> You voted
              </span>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Poll parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Room Poll.</p>;
    }
  };

  const renderGift = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[GIFT]:', '').trim();
      const gift = JSON.parse(jsonStr);
      
      const hiddenMsg = gift.message || "";
      const boxStyle = gift.boxStyle || "Classic";
      const viewers = gift.viewers || [];
      
      const styleConf = getGiftStyleConfig(boxStyle);
      const isViewer = viewers.includes(user.username);
      const viewCount = viewers.length;

      const handleOpenGift = async () => {
        if (isViewer) return;
        
        const updatedViewers = [...viewers, user.username];
        const updatedGift = { ...gift, viewers: updatedViewers };
        const updatedText = `[GIFT]:${JSON.stringify(updatedGift)}`;
        
        playNotifySound();

        setMessages(prev => prev.map(m => {
          if (m.id === msg.id) {
            return { ...m, text: updatedText };
          }
          return m;
        }));
        
        await supabase
          .from('messages')
          .update({ text: updatedText })
          .eq('id', msg.id);
      };

      return (
        <div 
          onClick={handleOpenGift}
          className={`mt-2 bg-gradient-to-br ${styleConf.cardBg} border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${
            !isViewer ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
          } flex flex-col items-center gap-3.5 select-none text-white`}
        >
          {!isViewer ? (
            <div className="flex flex-col items-center py-4 space-y-3.5 w-full">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-white/5 rounded-full blur-xl animate-pulse" />
                <span className="text-5xl drop-shadow-lg transform hover:scale-115 transition-transform duration-200">
                  {styleConf.accentEmoji}
                </span>
              </div>
              
              <div className="text-center">
                <p className="text-xs font-black tracking-widest text-white uppercase">
                  {boxStyle} Gift Box
                </p>
                <p className="text-[10px] text-purple-200/80 font-bold mt-1">
                  Click to unwrap & read the hidden message!
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center py-2 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
                <span>🔓 Revealed Gift Box ({boxStyle})</span>
              </div>
              
              <div className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-center shadow-inner">
                <p className="text-xs sm:text-sm font-extrabold text-white break-words leading-relaxed animate-in fade-in duration-300">
                  {hiddenMsg}
                </p>
              </div>
            </div>
          )}
          
          <div className="w-full flex justify-between items-center text-[10px] text-purple-300/60 font-black border-t border-white/5 pt-2">
            <span className="flex items-center gap-1 uppercase tracking-wide">
              👁️ Seen by {viewCount} {viewCount === 1 ? "person" : "people"}
            </span>
            {viewCount > 0 && (
              <span className="text-[9px] font-semibold text-purple-400/50 hover:text-purple-300/80 transition-colors" title={viewers.join(", ")}>
                Who seen?
              </span>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Gift parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Gift Box.</p>;
    }
  };

  const renderDiceRoll = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[DICE_ROLL]:', '').trim();
      const rollData = JSON.parse(jsonStr);

      const isDice = rollData.type === "dice";
      
      if (isDice) {
        const { diceType, diceCount, results, total, critical } = rollData;
        
        let borderClass = "border-purple-500/30 bg-gradient-to-br from-[#120e24]/80 to-[#1e133d]/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]";
        let titleColor = "text-purple-300";
        let badgeBg = "bg-purple-500/20 text-purple-300 border-purple-500/20";
        let badgeText = `🎲 Dice Roll`;
        
        if (critical === "hit") {
          borderClass = "border-amber-500/50 bg-gradient-to-br from-amber-950/40 to-yellow-950/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse-border";
          titleColor = "text-amber-400";
          badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/30";
          badgeText = "✨ CRITICAL HIT!";
        } else if (critical === "fail") {
          borderClass = "border-rose-500/50 bg-gradient-to-br from-rose-950/40 to-red-950/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]";
          titleColor = "text-rose-400";
          badgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/30";
          badgeText = "💀 CRITICAL FAIL!";
        }

        return (
          <div className={`mt-2 border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${borderClass} text-white space-y-3`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeBg}`}>
                {badgeText}
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {diceCount}d{diceType}
              </span>
            </div>

            {/* Results Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 flex-wrap py-1">
                {results.map((val: number, idx: number) => {
                  let dieBg = "bg-purple-950/50 border-purple-500/30 text-white";
                  if (diceType === 20 && val === 20) {
                    dieBg = "bg-amber-500/25 border-amber-400 text-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-bounce";
                  } else if (diceType === 20 && val === 1) {
                    dieBg = "bg-rose-500/25 border-rose-500 text-rose-300";
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-base font-black shadow-inner font-mono transition-transform hover:scale-105 duration-200 ${dieBg}`}
                      title={`Die #${idx + 1}`}
                    >
                      <span>{val}</span>
                      <span className="text-[7px] text-white/40 -mt-1 font-sans">d{diceType}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total/Summary */}
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                <span className="font-extrabold text-purple-300 uppercase tracking-wide">
                  {diceCount > 1 ? "Dice Sum:" : "Result:"}
                </span>
                <div className={`flex items-center gap-1.5 font-black text-sm ${titleColor}`}>
                  {diceCount > 1 && (
                    <span className="text-xs text-purple-400 font-mono font-medium mr-1">
                      ({results.join(" + ")}) =
                    </span>
                  )}
                  <span className="font-mono text-base font-black">{total}</span>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Coin flip rendering
        const { coinResult } = rollData;
        const isHeads = coinResult === "Heads";
        
        const borderClass = isHeads 
          ? "border-amber-500/40 bg-gradient-to-br from-[#120e24]/80 to-[#271d10]/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          : "border-indigo-500/40 bg-gradient-to-br from-[#120e24]/80 to-[#101935]/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]";
          
        const badgeBg = isHeads
          ? "bg-amber-500/20 text-amber-300 border-amber-500/20"
          : "bg-indigo-500/20 text-indigo-300 border-indigo-500/20";
          
        return (
          <div className={`mt-2 border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${borderClass} text-white space-y-3`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeBg}`}>
                🪙 Coin Flip
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                1d2
              </span>
            </div>

            {/* Coin Details */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2 shadow-lg transition-transform hover:rotate-180 duration-500 shrink-0 ${
                  isHeads
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 border-yellow-300 text-amber-950"
                    : "bg-gradient-to-r from-indigo-500 to-cyan-600 border-cyan-300 text-indigo-950"
                }`}>
                  {isHeads ? "🪙" : "🛡️"}
                </div>
                <div>
                  <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Flipped Outcome</p>
                  <p className={`text-base font-black uppercase tracking-widest ${isHeads ? "text-amber-400" : "text-cyan-400"}`}>
                    {coinResult}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  isHeads ? "bg-amber-500/10 text-amber-400" : "bg-cyan-500/10 text-cyan-400"
                }`}>
                  {isHeads ? "Lucky Heads" : "Steady Tails"}
                </span>
              </div>
            </div>
          </div>
        );
      }
    } catch (err) {
      console.error("Dice roll render error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Dice Roll.</p>;
    }
  };

  const renderGamble = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[GAMBLE]:', '').trim();
      const gamble = JSON.parse(jsonStr);

      const command = gamble.command || "/allin";
      const currency = gamble.currency || "gold";
      const bet = gamble.bet || 0;
      const roll = gamble.roll;
      const won = gamble.won;
      const payout = gamble.payout || 0;
      const multiplier = gamble.multiplier || 0;

      const isGold = currency.toLowerCase() === "gold";
      const currencyIcon = isGold ? (
        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-pulse" />
      );

      const borderClass = won
        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-teal-950/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        : "border-rose-500/40 bg-gradient-to-br from-rose-950/40 to-red-950/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]";

      const titleColor = won ? "text-emerald-400" : "text-rose-400";
      const badgeBg = won ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300";

      return (
        <div className={`mt-2 border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${borderClass} text-white space-y-3`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-md text-purple-300 border border-purple-500/15">
              🎰 Casino Roll
            </span>
            <span className="text-xs font-mono font-bold text-purple-400/80">
              {command}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {/* Bet amount */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">BET:</span>
              <div className="flex items-center gap-1.5 font-black">
                <span className="font-mono">{bet.toLocaleString()}</span>
                {currencyIcon}
                <span className="text-[10px] text-purple-400 font-bold uppercase">({currency})</span>
              </div>
            </div>

            {/* Optional dice roll display */}
            {roll !== undefined && (
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-purple-300 uppercase tracking-wide">DICE ROLL:</span>
                <span className="font-black text-white font-mono text-sm bg-black/30 border border-white/5 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  🎲 {roll} {roll === 6 ? <span className="text-emerald-400 text-xs font-black">(Winner!)</span> : <span className="text-rose-400 text-xs font-black">(No Match)</span>}
                </span>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">WON/LOST:</span>
              <span className={`font-black uppercase text-xs px-2 py-0.5 rounded-md ${badgeBg}`}>
                {won ? "🎉 WON" : "💀 LOST"}
              </span>
            </div>

            {/* Amount won/lost */}
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">
                {won ? "WON:" : "LOST:"}
              </span>
              <div className={`flex items-center gap-1.5 font-black text-sm ${titleColor}`}>
                <span className="font-mono">
                  {won ? `+${(payout - bet).toLocaleString()}` : `-${bet.toLocaleString()}`}
                </span>
                {currencyIcon}
              </div>
            </div>

            {/* Multiplier */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">MULTIPLIER:</span>
              <span className={`font-black text-sm font-mono ${won ? "text-amber-300 animate-pulse" : "text-gray-500"}`}>
                {won ? `x${multiplier.toFixed(1)}` : "x0.0"}
              </span>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      console.error("Gamble parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Gambling receipt.</p>;
    }
  };

  const toggleHideMessage = (msgId: string) => {
    setHiddenMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
    setActiveMessageMenu(null);
  };

  const handleDeleteMessage = async (msgId: string) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setActiveMessageMenu(null);
  };

  const handleReplyMessage = (username: string) => {
    handleMention(username);
    setActiveMessageMenu(null);
    inputRef.current?.focus();
  };

  const computedUsers = useMemo(() => {
    // Determine the viewer's priority
    const viewerPriority = allRanksInfo[user.rank]?.priority ?? 14;
    const isViewerFounderOrAbove = viewerPriority <= 2;

    const list = onlineUsers
      .filter(u => {
        // If they are invisible
        if (u.custom_status === 'invisible') {
          // Only show to themselves and founder+
          return u.id === user.id || isViewerFounderOrAbove;
        }
        return true;
      })
      .map(u => {
        const isActive = onlineUserIds.has(u.id);
        const resolvedStatus = !isActive 
          ? 'offline' 
          : (u.custom_status === 'invisible' ? 'invisible' : (u.custom_status || 'online'));

        const baseUser = u.id === user.id ? { ...u, ...user } : u;
        return {
          ...baseUser,
          status: resolvedStatus as 'online' | 'offline' | 'away' | 'busy' | 'invisible'
        };
      });

    // Inject BOT_USER as always online
    if (!list.some(u => u.id === BOT_USER.id)) {
      list.push({
        ...BOT_USER,
        status: 'online'
      });
    }

    // Sort: Rank priority first, then username alphabetical
    return list.sort((a, b) => {
      const aPriority = allRanksInfo[a.rank]?.priority ?? 14;
      const bPriority = allRanksInfo[b.rank]?.priority ?? 14;
      const rankDiff = aPriority - bPriority;
      if (rankDiff !== 0) return rankDiff;
      return a.username.localeCompare(b.username);
    });
  }, [onlineUsers, onlineUserIds, allRanksInfo, user]);

  const staffRanksList = useMemo(() => {
    // Collect all ranks where isStaff is true, sorted by priority ascending
    const ranks: { key: string; name: string; icon: string; priority: number }[] = [];
    
    // Default staff ranks from RANKS_INFO
    for (const key in RANKS_INFO) {
      if (RANKS_INFO[key].isStaff) {
        ranks.push({
          key,
          name: RANKS_INFO[key].name,
          icon: RANKS_INFO[key].icon,
          priority: RANKS_INFO[key].priority
        });
      }
    }
    
    // Custom staff ranks
    customRanks.forEach(r => {
      if (r.is_staff && !ranks.some(x => x.key === r.rank_key)) {
        ranks.push({
          key: r.rank_key,
          name: r.name,
          icon: r.icon,
          priority: Number(r.priority)
        });
      }
    });
    
    return ranks.sort((a, b) => a.priority - b.priority);
  }, [customRanks]);

  const staffGrouped = useMemo(() => {
    return staffRanksList.map(rankInfo => {
      const usersInRank = computedUsers.filter(u => u.rank === rankInfo.key);
      const sortedUsers = [...usersInRank].sort((a, b) => {
        if (a.status !== 'offline' && b.status === 'offline') return -1;
        if (a.status === 'offline' && b.status !== 'offline') return 1;
        return a.username.localeCompare(b.username);
      });
      return {
        ...rankInfo,
        users: sortedUsers
      };
    }).filter(group => group.users.length > 0);
  }, [staffRanksList, computedUsers]);

  const renderStatusBadge = (status: string, className = "w-3 h-3") => {
    if (status === 'offline') {
      return (
        <span className={`${className} bg-zinc-600 rounded-full inline-block shrink-0`} />
      );
    }
    if (status === 'invisible') {
      return (
        <span className={`${className} bg-[#52525b] border border-zinc-700 rounded-full inline-block shrink-0`} />
      );
    }
    const iconUrl = status === 'away' 
      ? 'https://drawspace.online/default_images/status/away.svg'
      : status === 'busy'
        ? 'https://drawspace.online/default_images/status/busy.svg'
        : 'https://drawspace.online/default_images/status/online.svg';

    return (
      <img 
        src={iconUrl} 
        alt={status} 
        className={`${className} object-contain shrink-0`} 
        referrerPolicy="no-referrer" 
      />
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    onUpdateUser({ custom_status: newStatus });
    await supabase.from('profiles').update({ custom_status: newStatus }).eq('id', user.id);
  };

  const getMessageStyle = (msg: Message, type: 'username' | 'message') => {
    const liveUser = msg.profile_id === user.id ? user : computedUsers.find(u => u.id === msg.profile_id);
    if (liveUser) {
       return {
          color: type === 'username' ? liveUser.username_color : liveUser.message_color,
       };
    }
    return {
        color: type === 'username' ? msg.username_color : msg.message_color,
    };
  };

  const onlineList = computedUsers.filter(u => u.status !== 'offline');
  const offlineList = computedUsers.filter(u => u.status === 'offline');

  return (
    <div className="h-screen w-full bg-[#0b0f19] text-slate-100 flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* Top Header Bar */}
      <header className="h-14 bg-[#0f172a] border-b border-white/5 px-4 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <img
            src="/logo.png"
            alt="Purplewave Logo"
            className="h-11 sm:h-12 md:h-14 object-contain filter brightness-110 saturate-100 transition-all"
          />
        </div>

        {/* Right Corner Icons & Pfp */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Action icon triggers (Only Online Panel toggle remains) */}
          <div className="flex items-center gap-2">
            {/* Font Control Button */}
            <div className="relative">
              <button 
                onClick={() => setIsFontControlMenuOpen(!isFontControlMenuOpen)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer relative font-sans font-black text-sm flex items-center justify-center w-8 h-8 ${
                  isFontControlMenuOpen 
                    ? "bg-slate-800 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
                style={selectedIconStyle && selectedIconStyle.id !== 'default' ? {
                  color: (selectedIconStyle.type === 'gradient' || (selectedIconStyle.type === 'shimmer' && selectedIconStyle.value === 'gradient')) ? 'transparent' : selectedIconStyle.value,
                  backgroundImage: (selectedIconStyle.type === 'gradient' || (selectedIconStyle.type === 'shimmer' && selectedIconStyle.value === 'gradient')) ? `linear-gradient(135deg, ${selectedIconStyle.from}, ${selectedIconStyle.to})` : undefined,
                  WebkitBackgroundClip: (selectedIconStyle.type === 'gradient' || (selectedIconStyle.type === 'shimmer' && selectedIconStyle.value === 'gradient')) ? 'text' : undefined,
                  backgroundClip: (selectedIconStyle.type === 'gradient' || (selectedIconStyle.type === 'shimmer' && selectedIconStyle.value === 'gradient')) ? 'text' : undefined,
                  filter: selectedIconStyle.glowColor ? `drop-shadow(0 0 3px ${selectedIconStyle.glowColor})` : undefined,
                } : undefined}
                title="Font & Icon Customization (A)"
              >
                A
              </button>

              {isFontControlMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsFontControlMenuOpen(false)} />
                  
                  {/* Font control dropdown */}
                  <div className="absolute right-0 mt-2 w-72 bg-[#0a0f1d] border border-white/10 shadow-2xl z-50 rounded-xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <span className="font-black text-lg text-white">A</span>
                      <h4 className="text-xs uppercase font-black tracking-widest text-white">
                        Font control
                      </h4>
                    </div>

                    {/* Grid of buttons matching the layout in image 1 */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleZoomIn()}
                        className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        + Zoom in
                      </button>
                      <button 
                        onClick={() => handleZoomOut()}
                        className="py-2.5 px-3 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        — Zoom out
                      </button>
                      <button 
                        onClick={() => setShowFontFamilyModal(true)}
                        className="py-2.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        A Font family
                      </button>
                      <button 
                        onClick={() => setShowIconColorModal(true)}
                        className="py-2.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        ⭐ Icon colors
                      </button>
                      <button 
                        onClick={() => handleResetIcons()}
                        className="py-2.5 px-3 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        🔄 Reset icons
                      </button>
                      <button 
                        onClick={() => handleResetFont()}
                        className="py-2.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        🔄 Reset font
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <button 
                        onClick={() => handleResetAll()}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-center"
                      >
                        🔄 Reset all
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notification Button */}
            <button 
              onClick={() => {
                setShowNotificationsModal(true);
                setUnreadNotifications(false);
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                showNotificationsModal 
                  ? "text-white bg-slate-800" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-[#0f172a]" />
              )}
            </button>

            {/* Mail Button with Interactive Dropdown */}
            <div className="relative">
              <button 
                className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                  isMailMenuOpen 
                    ? "text-white bg-slate-800" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
                title="Private Messages"
                onClick={() => setIsMailMenuOpen(!isMailMenuOpen)}
              >
                <Mail className="w-5 h-5" />
                {totalUnreadPrivateCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border border-[#0f172a] animate-pulse">
                    {totalUnreadPrivateCount}
                  </span>
                )}
              </button>

              {isMailMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsMailMenuOpen(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-[#0a0f1d] border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] rounded-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left flex flex-col max-h-[350px] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-2 pb-2 select-none border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-300" />
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest font-sans">Private</span>
                      </div>
                      
                      {/* Trash Can Button */}
                      <button 
                        onClick={() => {
                          setShowClearConfirmModal(true);
                          setIsMailMenuOpen(false);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        title="Clear chat list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                      {pmConversations.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-[11px] italic">
                          No private messages
                        </div>
                      ) : (
                        pmConversations.map(convo => (
                          <div
                            key={convo.userId}
                            onClick={() => {
                              handleOpenPrivateChat(convo.userId);
                              setIsMailMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 p-2 hover:bg-white/5 rounded-xl cursor-pointer group transition-colors relative"
                          >
                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0">
                              <img src={convo.profile?.pfp || ''} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-violet-400 transition-colors">
                                {convo.profile?.username}
                              </p>
                              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                {convo.text}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {convo.unread > 0 && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">
                                  {convo.unread}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleDismissConversation(convo.userId, e)}
                                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                title="Remove from list"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Friend & Status Requests Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsRequestsMenuOpen(!isRequestsMenuOpen)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                  isRequestsMenuOpen 
                    ? "text-white bg-slate-800" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
                title="Friend & Status Requests"
              >
                <UserPlus className="w-5 h-5" />
                {totalRequestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white border border-[#0f172a] animate-pulse">
                    {totalRequestsCount}
                  </span>
                )}
              </button>

              {isRequestsMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsRequestsMenuOpen(false)} />
                  
                  {/* Dropdown container */}
                  <div className="absolute right-0 mt-2 w-72 bg-[#0a0f1d] border border-white/10 shadow-2xl z-50 rounded-xl flex flex-col max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-3.5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                        <UserPlus className="w-3.5 h-3.5 text-slate-400" /> Requests
                      </h4>
                      {totalRequestsCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-600 text-white uppercase font-bold">
                          {totalRequestsCount} pending
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-80 custom-scrollbar p-3 space-y-3">
                      {totalRequestsCount === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-[11px] italic">
                          No pending requests
                        </div>
                      ) : (
                        <>
                          {/* Friend Requests Section */}
                          {mappedFriendRequests.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider px-1">
                                Friend Requests ({mappedFriendRequests.length})
                              </p>
                              {mappedFriendRequests.map((req) => (
                                <div key={req.id} className="p-2.5 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 p-0.5 border border-white/10 overflow-hidden shrink-0">
                                      <img src={req.sender.pfp} alt={req.sender.username} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-bold text-white truncate leading-tight">
                                        {req.sender.username}
                                      </p>
                                      <p className="text-[9px] text-slate-400">Wants to add you as friend</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => acceptFriendRequest(req.id, req.sender_id)}
                                      className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => declineFriendRequest(req.id)}
                                      className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status Requests Section */}
                          {mappedStatusRequests.length > 0 && (
                            <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider px-1">
                                Status Requests ({mappedStatusRequests.length})
                              </p>
                              {mappedStatusRequests.map((req) => (
                                <div key={req.id} className="p-2.5 bg-white/5 border border-white/5 rounded-lg flex flex-col gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-slate-800 p-0.5 border border-white/10 overflow-hidden shrink-0">
                                      <img src={req.sender.pfp} alt={req.sender.username} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-bold text-white truncate leading-tight">
                                        {req.sender.username}
                                      </p>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`text-[8px] px-1 py-0.2 rounded font-black uppercase ${
                                          req.relationship_type === "Married" 
                                            ? "bg-amber-950/40 border border-yellow-500/20 text-yellow-400" 
                                            : req.relationship_type === "Couple"
                                            ? "bg-pink-950/40 border border-pink-500/20 text-pink-400"
                                            : req.relationship_type === "Best Friend"
                                            ? "bg-violet-950/40 border border-violet-500/20 text-violet-400"
                                            : "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400"
                                        }`}>
                                          {req.relationship_type === "Married" ? "💍 Married" : req.relationship_type === "Couple" ? "💖 Couple" : req.relationship_type === "Best Friend" ? "🌟 Best Friend" : "✨ Friend"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => acceptRelationshipRequest(req.id, req.sender_id, req.relationship_type)}
                                      className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => declineRelationshipRequest(req.id)}
                                      className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Admin Panel Button removed as per developer commands migration */}

          </div>

          {/* User profile with green online status dot */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white max-w-[100px] truncate">{user.username}</span>
              <span className="text-[10px] text-slate-400">Age: {user.age}</span>
            </div>
            
            <div className="relative cursor-pointer" title="Your Profile">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuView('default');
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="transition-transform duration-300 hover:scale-105"
              >
                <Avatar
                  src={user.pfp}
                  alt={user.username}
                  decoration={user.avatar_decoration}
                  size="custom"
                  containerClassName="w-9 h-9"
                  className="border border-white/10 p-0.5 bg-slate-800"
                />
              </div>
              <div className="absolute bottom-0 right-0">
                {renderStatusBadge(user.custom_status || 'online', "w-3 h-3 border-2 border-[#0b0f19] rounded-full shadow-lg")}
              </div>
              
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-[#13131b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden p-5 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                    {profileMenuView === 'default' && (
                      <>
                        {/* Header card area */}
                        <div className="flex items-center gap-4 border-b border-white/[0.08] pb-4 mb-4">
                          <div className="relative shrink-0">
                            <img
                              src={user.pfp || "https://musicvibe.io/default_images/pfp/default.png"}
                              alt={user.username}
                              className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-slate-800"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {RANKS_INFO[user.rank]?.icon && (
                                <img src={RANKS_INFO[user.rank].icon} alt="" className="w-4 h-4 object-contain shrink-0" />
                              )}
                              <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase truncate">
                                {RANKS_INFO[user.rank]?.name || user.rank}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white truncate leading-none">
                              {user.username}
                            </h4>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('status');
                            }}
                            className="shrink-0 hover:scale-105 active:scale-95 transition-all bg-[#1c1c28] hover:bg-[#252538] border border-white/5 p-2 rounded-xl flex items-center justify-center cursor-pointer"
                            title="Change Status"
                          >
                            {renderStatusBadge(user.custom_status || 'online', "w-6 h-6")}
                          </button>
                        </div>

                        {/* List Options */}
                        <div className="space-y-1.5">
                          {/* Chat Background */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              setChatBgError(null);
                              setShowChatBgModal(true);
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <Palette className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>Chat background</span>
                          </button>

                          {/* Level info */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('level');
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>Level info</span>
                          </button>

                          {/* Wallet */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('wallet');
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-all flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-sky-400 shrink-0" />
                              <span>Wallet</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </button>

                          {/* Edit profile */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              handleProfileClick(user, "edit");
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <User className="w-4 h-4 text-sky-400 shrink-0" />
                            <span>Edit profile</span>
                          </button>

                          {/* Logout */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              onLogout();
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/25 rounded-xl transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}

                    {profileMenuView === 'status' && (() => {
                      const viewerPriority = allRanksInfo[user.rank]?.priority ?? 14;
                      const isFounderAndAbove = viewerPriority <= 2;
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('default');
                            }}
                            className="w-full pb-3 mb-3 border-b border-white/[0.08] text-left text-xs font-black text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                            <span>Status</span>
                          </button>
                          
                          <div className="space-y-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus('online');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              <img src="https://drawspace.online/default_images/status/online.svg" className="w-5 h-5 object-contain shrink-0" alt="Online" referrerPolicy="no-referrer" />
                              <span className={user.custom_status === 'online' || !user.custom_status ? "text-white font-black" : ""}>Online</span>
                              {(user.custom_status === 'online' || !user.custom_status) && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus('away');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              <img src="https://drawspace.online/default_images/status/away.svg" className="w-5 h-5 object-contain shrink-0" alt="Away" referrerPolicy="no-referrer" />
                              <span className={user.custom_status === 'away' ? "text-white font-black" : ""}>Away</span>
                              {user.custom_status === 'away' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus('busy');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              <img src="https://drawspace.online/default_images/status/busy.svg" className="w-5 h-5 object-contain shrink-0" alt="Busy" referrerPolicy="no-referrer" />
                              <span className={user.custom_status === 'busy' ? "text-white font-black" : ""}>Busy</span>
                              {user.custom_status === 'busy' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                            </button>

                            {isFounderAndAbove && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus('invisible');
                                  setIsProfileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/[0.04] rounded-xl transition-colors flex items-center gap-3 cursor-pointer"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#52525b] border border-zinc-700 flex-shrink-0" />
                                <span className={user.custom_status === 'invisible' ? "text-white font-black" : ""}>Invisible</span>
                                {user.custom_status === 'invisible' && <Check className="w-4 h-4 ml-auto text-sky-400" />}
                              </button>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    {profileMenuView === 'level' && (() => {
                      const { level, xpInCurrentLevel, xpNeededForNextLevel, progress, remainingXp } = getLevelFromXp(user.total_xp || 0);
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('default');
                            }}
                            className="w-full pb-3 mb-3 border-b border-white/[0.08] text-left text-xs font-black text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                            <span>Level info</span>
                          </button>

                          <div className="space-y-4 px-1">
                            <div className="text-center py-2 bg-white/[0.02] border border-white/5 rounded-xl">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Current Level</span>
                              <h3 className="text-2xl font-black text-white mt-1">Level {level}</h3>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-slate-400">
                                <span>Progress</span>
                                <span className="font-bold text-white">{Math.round(progress)}%</span>
                              </div>
                              {/* Progress Bar */}
                              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full transition-all duration-300" 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="text-xs space-y-1.5 text-slate-400 border-t border-white/[0.04] pt-3">
                              <div className="flex justify-between">
                                <span>Current XP:</span>
                                <span className="font-bold text-slate-200">{xpInCurrentLevel} XP</span>
                              </div>
                              <div className="flex justify-between">
                                <span>XP for Level Up:</span>
                                <span className="font-bold text-slate-200">{xpNeededForNextLevel} XP</span>
                              </div>
                              <div className="flex justify-between">
                                <span>XP Remaining:</span>
                                <span className="font-bold text-sky-400">{remainingXp} XP</span>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {profileMenuView === 'wallet' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileMenuView('default');
                          }}
                          className="w-full pb-3 mb-3 border-b border-white/[0.08] text-left text-xs font-black text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-400" />
                          <span>Wallet</span>
                        </button>
                        
                        <div className="space-y-4">
                          {/* Ruby Box */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Ruby</span>
                            <div className="flex items-center gap-2.5 py-1">
                              <img src="https://drawspace.online/default_images/icons/ruby.svg" className="w-6 h-6 object-contain" alt="Ruby" referrerPolicy="no-referrer" />
                              <span className="text-2xl font-black text-white font-mono">
                                {(user.rubies ?? 10).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="border-b border-white/[0.06] my-2" />

                          {/* Gold Box */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Gold</span>
                            <div className="flex items-center gap-2.5 py-1">
                              <img src="https://drawspace.online/default_images/icons/gold.svg" className="w-6 h-6 object-contain" alt="Gold" referrerPolicy="no-referrer" />
                              <span className="text-2xl font-black text-white font-mono">
                                {(user.coins ?? 1000).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Exchange Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              setShowConvertModal(true);
                            }}
                            className="w-full mt-3 py-2.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                          >
                            🔄 Exchange Currency
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Menu Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative w-72 h-full bg-[#0a0f1d] border-r border-white/5 p-5 flex flex-col animate-in slide-in-from-left duration-250">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Purplewave Logo" className="h-12 object-contain filter brightness-110 saturate-100 transition-all" />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                <button
                  onClick={() => { setActiveTab("staff"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === "staff" ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`}
                >
                  <Crown className="w-5 h-5 shrink-0" />
                  <span>Staff</span>
                </button>
                <button
                  onClick={() => { setActiveTab("rules"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === "rules" ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`}
                >
                  <RulesIcon className="w-5 h-5 shrink-0" />
                  <span>Rules</span>
                </button>
                <button
                  onClick={() => { setIsNewsOpen(prev => !prev); setActiveTab("chat"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${isNewsOpen ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`}
                >
                  <Newspaper className="w-5 h-5 shrink-0" />
                  <span>News</span>
                </button>
                <button
                  onClick={() => { setShowSecretMessagesListModal(true); setIsSidebarOpen(false); }}
                  className="w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all text-slate-300 hover:bg-slate-800/50 hover:text-white"
                >
                  <Lock className="w-5 h-5 shrink-0" />
                  <span>Secret Message</span>
                </button>
                <button
                  onClick={() => { setShowProfileVisitorsModal(true); setIsSidebarOpen(false); }}
                  className="w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all text-slate-300 hover:bg-slate-800/50 hover:text-white"
                >
                  <Eye className="w-5 h-5 shrink-0" />
                  <span>Profile Visits</span>
                </button>
                <button
                  onClick={() => { setIsVitroModalOpen(true); setIsSidebarOpen(false); }}
                  className="w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all text-slate-300 hover:bg-slate-800/50 hover:text-white"
                >
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span>Vitro</span>
                </button>
                <button
                  onClick={() => { setShowSoundSettingsModal(true); setIsSidebarOpen(false); }}
                  className="w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all text-slate-300 hover:bg-slate-800/50 hover:text-white"
                >
                  <Volume2 className="w-5 h-5 shrink-0" />
                  <span>Sound Settings</span>
                </button>
                {activeTab !== "chat" && (
                  <button
                    onClick={() => { setActiveTab("chat"); setIsSidebarOpen(false); }}
                    className="w-full text-left py-3 px-4 rounded-xl font-bold text-slate-400 hover:bg-slate-800/30 hover:text-white flex items-center gap-3 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 shrink-0" />
                    <span>Back to Chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* News Sidebar */}
        {isNewsOpen && activeTab === "chat" && (
          <NewsSidebar 
            user={user}
            onClose={() => setIsNewsOpen(false)}
            allRanksInfo={allRanksInfo}
            computedUsers={computedUsers}
            handleProfileClick={handleProfileClick}
            playAudio={playAudio}
          />
        )}

        {/* Center Screen */}
        <div 
          className="flex-1 flex flex-col min-w-0 bg-[#020617] relative overflow-hidden"
          style={user.chat_background ? {
            backgroundImage: `url(${user.chat_background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : undefined}
        >
          {activeTab === "chat" ? (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar chat-messages-container">
                {/* Permanent Global Announcements */}
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-gradient-to-r from-purple-950/40 via-amber-950/40 to-purple-950/40 border-b border-amber-500/20 px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-black text-amber-200 tracking-wide text-center">{ann.text}</span>
                    </div>
                    {(user.email === 'dev@gmail.com' || user.email === 'haydensixseven@gmail.com' || user.email === 'haydensixsevennn@gmail.com' || user.email === 'test@gmail.com') && (
                      <button 
                        onClick={async () => {
                          await supabase.from('announcements').delete().eq('id', ann.id);
                        }}
                        className="text-purple-400 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {messages.map((msg, index) => {
                  if (hiddenMessages.has(msg.id)) return null;
                  
                  if (msg.text?.startsWith('[USERNAME_CHANGE] ')) {
                    const changeText = msg.text.replace('[USERNAME_CHANGE] ', '').trim();
                    return (
                      <div key={msg.id} className="group flex gap-3.5 px-4 py-3.5 border-b border-white/5 relative bg-transparent">
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-3 py-1 text-sm text-[#8c88a5] font-medium animate-in fade-in duration-200">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-md border border-white/10 bg-slate-800 flex items-center justify-center">
                              <img 
                                src="https://musicvibe.io/default_images/avatar/default_system.png" 
                                alt="System Bot" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as any).src = "https://api.dicebear.com/7.x/identicon/svg?seed=System";
                                }}
                              />
                            </div>
                            <span className="flex items-center gap-1.5 flex-wrap text-slate-300">
                              {(() => {
                                const match = changeText.match(/(.+) is now known as (.+)/);
                                if (match) {
                                  const oldName = match[1];
                                  const newName = match[2];
                                  return (
                                    <>
                                      <span 
                                        onClick={() => {
                                          const foundUser = computedUsers.find(u => u.username === oldName);
                                          if (foundUser) handleProfileClick(foundUser);
                                        }}
                                        className="text-white font-bold hover:underline cursor-pointer transition-colors"
                                      >
                                        {oldName}
                                      </span>
                                      <span>is now known as</span>
                                      <span 
                                        onClick={() => {
                                          const foundUser = computedUsers.find(u => u.username === newName);
                                          if (foundUser) handleProfileClick(foundUser);
                                        }}
                                        className="text-white font-bold hover:underline cursor-pointer transition-colors"
                                      >
                                        {newName}
                                      </span>
                                    </>
                                  );
                                }
                                return <span>{changeText}</span>;
                              })()}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium ml-1 shrink-0">{msg.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`group flex gap-3.5 px-4 py-3.5 border-b border-white/5 relative overflow-hidden ${msg.isSystem ? "bg-transparent" : index % 2 === 0 ? "bg-slate-900/15" : "bg-transparent"}`}
                    >
                      {msg.nameplate && !msg.isSystem && (
                        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                          <video
                            src={msg.nameplate}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/20" />
                        </div>
                      )}
                      {!msg.isSystem && (
                        <div 
                          className="cursor-pointer transition-transform hover:scale-105 relative z-10"
                          onClick={() => {
                            const foundUser = computedUsers.find(u => (msg.profile_id && u.id === msg.profile_id) || u.username === msg.username);
                            if (foundUser) handleProfileClick(foundUser);
                          }}
                        >
                          <Avatar
                            src={msg.pfp}
                            alt={msg.username}
                            decoration={msg.avatar_decoration || (msg.profile_id ? computedUsers.find(u => u.id === msg.profile_id)?.avatar_decoration : null)}
                            size="md"
                            className="border border-white/10 shadow-md bg-slate-800"
                          />
                        </div>
                      )}
                      <div className={`flex-1 min-w-0 flex flex-col justify-center relative z-10 ${(msg.isSystem && !(msg.text && (msg.text.includes("Chat cleared by") || msg.text.includes("cleared by")))) ? "items-center py-2" : ""}`}>
                        {msg.isSystem ? (
                          (msg.text && (msg.text.includes("Chat cleared by") || msg.text.includes("cleared by"))) ? (() => {
                            const clearedUsername = msg.text.replace(/^\[SYSTEM\]\s*Chat cleared by:?\s*/i, '').trim();
                            return (
                              <div className="flex items-center gap-3 py-1 text-sm text-[#8c88a5] font-medium animate-in fade-in duration-200">
                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-md border border-white/10 bg-slate-800 flex items-center justify-center">
                                  <img 
                                    src="https://musicvibe.io/default_images/avatar/default_system.png" 
                                    alt="System Bot" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      (e.target as any).src = "https://api.dicebear.com/7.x/identicon/svg?seed=System";
                                    }}
                                  />
                                </div>
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  This room has been cleared by{" "}
                                  <span 
                                    onClick={() => {
                                      const foundUser = computedUsers.find(u => u.username === clearedUsername);
                                      if (foundUser) handleProfileClick(foundUser);
                                    }}
                                    className="text-white font-bold hover:underline cursor-pointer transition-colors"
                                  >
                                    {clearedUsername}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium ml-1 shrink-0">{msg.time}</span>
                              </div>
                            );
                          })() : (
                            <div className="bg-[#0a0f1d] border border-white/10 px-5 py-3 rounded-xl shadow-xl max-w-xl w-full flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400 shrink-0 shadow-inner">
                                <Bell className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-0.5 font-sans">System Broadcast</p>
                                <p className="text-xs text-white leading-relaxed font-bold">{msg.text}</p>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{msg.time}</span>
                            </div>
                          )
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              {msg.rank && (
                                <img 
                                  src={allRanksInfo[msg.rank]?.icon || allRanksInfo['VIP'].icon} 
                                  alt={msg.rank} 
                                  className="h-3 w-auto object-contain shrink-0" 
                                  referrerPolicy="no-referrer"
                                  title={allRanksInfo[msg.rank]?.name || msg.rank}
                                />
                              )}
                              <span 
                                onClick={() => {
                                  const foundUser = computedUsers.find(u => (msg.profile_id && u.id === msg.profile_id) || u.username === msg.username);
                                  if (foundUser) handleProfileClick(foundUser);
                                }}
                                className={`text-sm font-bold hover:underline cursor-pointer transition-colors text-white `}
                                style={{ color: getMessageStyle(msg, 'username').color }}
                              >
                                {msg.username}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium ml-1 shrink-0">{msg.time}</span>
                            </div>
                            {msg.text?.startsWith('[POLL]:') ? (
                              renderPoll(msg)
                            ) : msg.text?.startsWith('[GIFT]:') ? (
                              renderGift(msg)
                            ) : msg.text?.startsWith('[GAMBLE]:') ? (
                              renderGamble(msg)
                            ) : msg.text?.startsWith('[DICE_ROLL]:') ? (
                              renderDiceRoll(msg)
                            ) : msg.text && (
                              <p 
                                className={`text-sm text-slate-100 whitespace-pre-wrap break-words leading-relaxed font-sans `}
                                style={{ color: getMessageStyle(msg, 'message').color }}
                              >
                                {renderMessageText(msg.text, user.username)}
                              </p>
                            )}
                            {msg.image_url && (
                              <img src={msg.image_url} alt="Shared content" className="mt-2 max-w-xs rounded-xl border border-white/10 shadow-lg" />
                            )}
                          </>
                        )}
                      </div>
                      
                      {!msg.isSystem && (
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="relative">
                            <button
                              onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)}
                              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {activeMessageMenu === msg.id && (
                              <div className="absolute right-0 top-8 w-32 bg-[#0a0f1d] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => handleReplyMessage(msg.username)}
                                  className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <Reply className="w-3.5 h-3.5" />
                                  <span className="font-bold">Quote</span>
                                </button>
                                <button
                                  onClick={() => toggleHideMessage(msg.id)}
                                  className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span className="font-bold">Hide</span>
                                </button>
                                {(msg.profile_id === user.id || user.rank === 'DEVELOPER') && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-white/5 hover:text-rose-300 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="font-bold">Delete</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Message Input Container */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0f1d] border-t border-white/5 shrink-0 relative flex items-center gap-2">
                {showPlusOptions && (
                  <div className="absolute bottom-full left-4 mb-3 p-2 bg-[#1e2124] border border-[#282b30] rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 z-50">
                    <button
                      type="button"
                      onClick={() => { setShowPaintModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500 hover:bg-violet-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Paint Canvas"
                    >
                      <Palette className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowGallerySettingsModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Photo Gallery"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPollModal(true); setShowPlusOptions(false); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white transition-all cursor-pointer shadow-sm"
                      title="Room Poll"
                    >
                      <Vote className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {isEmojiPickerOpen && (
                  <div className="absolute bottom-full left-4 mb-2 p-2 bg-[#0a0f1d] border border-white/10 rounded-xl shadow-2xl flex gap-2 flex-wrap max-w-xs animate-in zoom-in-95 duration-100 z-50">
                    {["😊", "😂", "🥰", "😎", "🤔", "🔥", "✨", "🙌", "💀", "😭", "👍", "❤️"].map(emoji => (
                      <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="text-xl hover:scale-125 transition-transform p-1 cursor-pointer">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {inputText.startsWith('/') && (() => {
                  const currentTypedWord = inputText.split(' ')[0].toLowerCase();
                  const knownCommandsList = [
                    { cmd: '/commands', desc: 'Show available commands list', badge: 'Help' },
                    { cmd: '/clear', desc: 'Clear all messages globally', badge: 'Founder+' },
                    { cmd: '/announcement set', desc: 'Set global announcement', badge: 'Dev' },
                    { cmd: '/announcement remove', desc: 'Remove global announcement', badge: 'Dev' },
                    { cmd: '/notify', desc: 'Send global notification', badge: 'Dev' }
                  ];
                  const matchingCommands = knownCommandsList.filter(c => c.cmd.startsWith(currentTypedWord));
                  if (matchingCommands.length === 0) return null;

                  return (
                    <div className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-[#0a0f1d] border border-white/10 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-150 z-50 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Command Suggestions</span>
                        <span className="text-[9px] text-slate-500 normal-case">Click to auto-fill</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5 animate-in fade-in duration-200">
                        {matchingCommands.map((c) => {
                          const userPriority = allRanksInfo[user.rank]?.priority ?? 14;
                          const isFounderOrAbove = userPriority <= 2;
                          const isDev = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(user.email || '');
                          const isDisabled = (c.cmd === '/clear' && !isFounderOrAbove) || 
                                             ((c.cmd.startsWith('/announcement') || c.cmd.startsWith('/notify')) && !isDev);
                          return (
                            <button
                              key={c.cmd}
                              type="button"
                              onClick={() => {
                                if (isDisabled) return;
                                setInputText(c.cmd + " ");
                                inputRef.current?.focus();
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                                isDisabled
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-slate-800 cursor-pointer active:scale-[0.99]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-200">{c.cmd}</span>
                                <span className="text-xs text-slate-400">{c.desc}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                c.cmd === '/clear'
                                  ? isFounderOrAbove
                                    ? "bg-amber-500/20 text-amber-300"
                                    : "bg-red-500/20 text-red-300"
                                  : c.badge === 'Dev'
                                    ? isDev
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/10"
                                      : "bg-red-500/25 text-red-400"
                                    : "bg-violet-500/20 text-violet-300"
                              }`}>
                                {c.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="w-full flex items-center bg-slate-950/60 border border-white/10 rounded-xl px-4 py-1.5 shadow-2xl focus-within:border-violet-600/60 transition-all duration-200">
                  <div className="flex items-center gap-1 sm:gap-2 text-slate-400 shrink-0 pr-2">
                    <button
                      type="button"
                      onClick={() => setShowPlusOptions(!showPlusOptions)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${showPlusOptions ? "bg-slate-800 text-white" : "hover:bg-slate-800/40 hover:text-white"}`}
                      title="Options"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isEmojiPickerOpen ? "bg-slate-800 text-white" : "hover:bg-slate-800/40 hover:text-white"}`}
                      title="Insert Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none px-2 min-w-0"
                  />
                  <div className="flex items-center gap-1 text-slate-400 shrink-0 pl-2">
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center ${inputText.trim() ? "bg-violet-600 hover:bg-violet-500 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-violet-900/40" : "text-slate-600/40 cursor-not-allowed"}`}
                      title="Send Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {!isOnlinePanelOpen && (
                  <button
                    type="button"
                    onClick={() => setIsOnlinePanelOpen(true)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-violet-500 text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center shrink-0"
                    title="Open Players Online"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </form>
            </>
          ) : activeTab === "staff" ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-white">Staff Members</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {computedUsers.filter(u => u.rank !== 'USER').map(staff => (
                                    <div 
                    key={staff.username}
                    onClick={() => handleProfileClick(staff)}
                    className="p-4 bg-[#0a0f1d] border border-white/5 rounded-xl flex items-center gap-3 cursor-pointer hover:border-violet-500/50 hover:bg-[#111827] transition-all relative overflow-hidden"
                  >
                    {staff.nameplate && (
                      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                        <video
                          src={staff.nameplate}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 relative z-10 w-full">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img src={staff.pfp} className="w-full h-full object-cover" alt={staff.username} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-1">
                          {staff.username}
                        </h3>
                      <p className={`text-xs font-semibold ${staff.rank === 'DEVELOPER' ? 'text-rose-500' : 'text-violet-400'}`}>{staff.rank}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{staff.status === 'online' ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("chat")} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer">Return to Chatroom</button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <RulesIcon className="w-6 h-6 text-rose-500" />
                <h2 className="text-xl font-bold text-white">Community Rules</h2>
              </div>
              <div className="bg-[#0a0f1d] border border-white/5 rounded-xl p-6 max-w-2xl space-y-4 shadow-xl">
                <div className="space-y-1"><h3 className="text-sm font-bold text-violet-300">1. Respect all chat members</h3><p className="text-xs text-slate-400 leading-relaxed">Treat others with courtesy and respect. Personal attacks, harassment, and discrimination of any kind are strictly forbidden.</p></div>
                <div className="space-y-1 pt-3 border-t border-white/5"><h3 className="text-sm font-bold text-violet-300">2. No Spamming or Flooding</h3><p className="text-xs text-slate-400 leading-relaxed">Avoid posting the same message repeatedly, using excessive capital letters, or posting random text patterns that disturb the readability of the screen.</p></div>
                <div className="space-y-1 pt-3 border-t border-white/5"><h3 className="text-sm font-bold text-violet-300">3. Underage Safety Policy</h3><p className="text-xs text-slate-400 leading-relaxed">Users of all permitted ages are present here. Ensure all conversation remains strictly appropriate, polite, and safe for minor members of our platform.</p></div>
                <div className="space-y-1 pt-3 border-t border-white/5"><h3 className="text-sm font-bold text-violet-300">4. Free Customization Update</h3><p className="text-xs text-slate-400 leading-relaxed">All profile borders and visual effects have been made completely free for all users! Enjoy designing your unique profile without currency limits.</p></div>
              </div>
              <button onClick={() => setActiveTab("chat")} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer">Accept and Close Rules</button>
            </div>
          )}
        </div>

        {/* Right Side Panel */}
        {isOnlinePanelOpen && (
          <>
            <div className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-xs z-10" onClick={() => setIsOnlinePanelOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 md:relative w-72 bg-[#1a1b26] border-l border-white/5 flex flex-col shrink-0 z-20 animate-in slide-in-from-right duration-200 shadow-2xl md:shadow-none">
              
              {/* Four switch buttons: X, Online, Friends, Staff, Search */}
              <div className="flex items-center p-2 bg-[#1f2335] border-b border-white/5 gap-2 shrink-0">
                <button onClick={() => setIsOnlinePanelOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-1 flex bg-black/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setRightPanelTab("online")}
                    className={`flex-1 py-2 flex items-center justify-center transition-all cursor-pointer ${
                      rightPanelTab === "online"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab("friends")}
                    className={`flex-1 py-2 flex items-center justify-center transition-all cursor-pointer ${
                      rightPanelTab === "friends"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab("staff")}
                    className={`flex-1 py-2 flex items-center justify-center transition-all cursor-pointer ${
                      rightPanelTab === "staff"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRightPanelTab("search")}
                    className={`flex-1 py-2 flex items-center justify-center transition-all cursor-pointer ${
                      rightPanelTab === "search"
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search Bar (Only shown in Search tab) */}
              {rightPanelTab === "search" && (
                <div className="p-4 shrink-0">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Genders Online filter selector (Only shown in Online tab) */}
              {rightPanelTab === "online" && (
                <div className="pt-6 pb-2 flex justify-center items-center gap-3 shrink-0">
                  <button
                    onClick={() => setGenderFilter("ALL")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      genderFilter === "ALL"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        : "bg-violet-600/20 text-[#0ea5e9] hover:bg-violet-600/30"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGenderFilter("MALE")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      genderFilter === "MALE"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        : "bg-violet-600/20 text-[#0ea5e9] hover:bg-violet-600/30"
                    }`}
                  >
                    <span className="text-xl font-bold">♂</span>
                  </button>
                  <button
                    onClick={() => setGenderFilter("FEMALE")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      genderFilter === "FEMALE"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        : "bg-violet-600/20 text-[#0ea5e9] hover:bg-violet-600/30"
                    }`}
                  >
                    <span className="text-xl font-bold">♀</span>
                  </button>
                  <button
                    onClick={() => setGenderFilter("OTHER")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      genderFilter === "OTHER"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        : "bg-violet-600/20 text-[#0ea5e9] hover:bg-violet-600/30"
                    }`}
                  >
                    <span className="text-lg font-bold">O</span>
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {rightPanelTab === "online" ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[14px] text-white font-extrabold font-display tracking-tight">Players Online</span>
                          <span className="bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{onlineList.length}</span>
                        </div>

                      {onlineList
                        .filter(u => genderFilter === 'ALL' || (u.gender && u.gender.toUpperCase() === genderFilter))
                        .map((u) => {
                          const cardGlow = getUserCardStyle(u);
                          const hasCustomBorder = u.border && u.border !== 'none';
                          const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                          const hasCustomStyle = isGlowActive || hasCustomBorder;
                          
                          let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                          if (u.nameplate) {
                            if (u.isCurrentUser) {
                              cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                            } else {
                              cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                            }
                            if (hasCustomStyle) {
                              cardClasses += " " + cardGlow.className;
                            }
                          } else {
                            cardClasses += "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10 hover:shadow-md ";
                          }

                          return (
                            <div
                              key={u.id}
                              onClick={() => handleProfileClick(u)}
                              className={cardClasses}
                              style={hasCustomStyle ? cardGlow.style : undefined}
                            >
                              {u.nameplate && (
                                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                                  <video
                                    src={u.nameplate}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between w-full relative z-10">
                                <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                  {activeStories[u.id] ? (
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProfileClick(u, "view", true);
                                      }}
                                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                    >
                                      <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                        <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full" />
                                      </div>
                                    </div>
                                  ) : (
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850" />
                                  )}
                                  <div className="absolute bottom-0 right-0">
                                    {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                    {u.username}
                                    
                                    {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block" style={u.cardGlowType === 'terminal' ? { color: '#00ff00' } : undefined}>{u.mood || "No mood set"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {u.cardGlowType === 'terminal' ? (
                                  <span className="text-[8px] border border-[#00ff00] text-[#00ff00] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                    {u.rank}
                                  </span>
                                ) : (
                                  <img 
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon} 
                                    alt={u.rank} 
                                    className="h-3 w-auto object-contain" 
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[14px] text-white font-extrabold font-display tracking-tight">Offline</span>
                        </div>

                      {offlineList
                        .filter(u => genderFilter === 'ALL' || (u.gender && u.gender.toUpperCase() === genderFilter))
                        .map((u) => {
                          const cardGlow = getUserCardStyle(u);
                          const hasCustomBorder = u.border && u.border !== 'none';
                          const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                          const hasCustomStyle = isGlowActive || hasCustomBorder;
                          
                          let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                          if (u.nameplate) {
                            if (u.isCurrentUser) {
                              cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                            } else {
                              cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                            }
                            if (hasCustomStyle) {
                              cardClasses += " " + cardGlow.className;
                            }
                          } else {
                            cardClasses += "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10 hover:shadow-md ";
                          }
                          // Add offline grayscale & dim styling
                          cardClasses += " opacity-45 grayscale hover:opacity-100 hover:grayscale-0 ";

                          return (
                            <div
                              key={u.id}
                              onClick={() => handleProfileClick(u)}
                              className={cardClasses}
                              style={hasCustomStyle ? cardGlow.style : undefined}
                            >
                              {u.nameplate && (
                                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                                  <video
                                    src={u.nameplate}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex items-center justify-between w-full relative z-10">
                                <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                  {activeStories[u.id] ? (
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleProfileClick(u, "view", true);
                                      }}
                                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                    >
                                      <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                        <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full" />
                                      </div>
                                    </div>
                                  ) : (
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850" />
                                  )}
                                  <div className="absolute bottom-0 right-0">
                                    {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                    {u.username}
                                    
                                    {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block" style={u.cardGlowType === 'terminal' ? { color: '#00ff00' } : undefined}>{u.mood || "No mood set"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0">
                                {u.cardGlowType === 'terminal' ? (
                                  <span className="text-[8px] border border-[#00ff00] text-[#00ff00] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                    {u.rank}
                                  </span>
                                ) : (
                                  <img 
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon} 
                                    alt={u.rank} 
                                    className="h-3 w-auto object-contain" 
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : rightPanelTab === "staff" ? (
                  <>
                    <div className="space-y-6">
                      {(Object.entries(allRanksInfo) as [string, any][])
                        .filter(([_, info]) => info.isStaff || info.priority <= 5)
                        .sort((a, b) => a[1].priority - b[1].priority)
                        .map(([rankKey, info]) => {
                          const onlineStaff = computedUsers.filter(u => u.status !== 'offline' && u.rank === rankKey);
                          const offlineStaff = computedUsers.filter(u => u.status === 'offline' && u.rank === rankKey);
                          if (onlineStaff.length === 0 && offlineStaff.length === 0) return null;
                          return (
                            <div key={rankKey} className="space-y-3">
                              <div className="flex items-center gap-2 px-2">
                                <img src={info.icon} alt={info.name} className="w-4 h-4 object-contain" />
                                <span className="text-[14px] text-white font-extrabold font-display tracking-tight uppercase">{info.name}</span>
                              </div>
                              
                              {onlineStaff.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 px-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Online</span>
                                    <span className="bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0 rounded-full">{onlineStaff.length}</span>
                                  </div>
                                  {onlineStaff.map((u) => {
                                    const cardGlow = getUserCardStyle(u);
                                    const hasCustomBorder = u.border && u.border !== 'none';
                                    const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                                    const hasCustomStyle = isGlowActive || hasCustomBorder;
                                    
                                    let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                                    if (u.nameplate) {
                                      if (u.isCurrentUser) {
                                        cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                                      } else {
                                        cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                                      }
                                      if (hasCustomStyle) {
                                        cardClasses += " " + cardGlow.className;
                                      }
                                    } else {
                                      cardClasses += "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10 hover:shadow-md ";
                                    }
                                    return (
                                      <div
                                        key={u.id}
                                        onClick={() => handleProfileClick(u)}
                                        className={cardClasses}
                                        style={hasCustomStyle ? cardGlow.style : undefined}
                                      >
                                        {u.nameplate && (
                                          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                                            <video
                                              src={u.nameplate}
                                              autoPlay
                                              loop
                                              muted
                                              playsInline
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between w-full relative z-10">
                                          <div className="flex items-center gap-3 min-w-0">
                                          <div className="relative">
                                            {activeStories[u.id] ? (
                                              <div 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleProfileClick(u, "view", true);
                                                }}
                                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                              >
                                                <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                                  <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full" />
                                                </div>
                                              </div>
                                            ) : (
                                              <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850" />
                                            )}
                                            <div className="absolute bottom-0 right-0">
                                              {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                            </div>
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                              {u.username}
                                              
                                              {u.is_muted && <Hand className="w-3 h-3 text-red-500 inline" title="Muted" />}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block" style={u.cardGlowType === 'terminal' ? { color: '#00ff00' } : undefined}>{u.mood || "No mood set"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="shrink-0">
                                          {u.cardGlowType === 'terminal' ? (
                                            <span className="text-[8px] border border-[#00ff00] text-[#00ff00] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                              {u.rank}
                                            </span>
                                          ) : (
                                            <img
                                              src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                              alt={u.rank}
                                              className="h-3 w-auto object-contain"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                  })}
                                </div>
                              )}

                              {offlineStaff.length > 0 && (
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center gap-2 px-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Offline</span>
                                  </div>
                                  {offlineStaff.map((u) => {
                                    const cardGlow = getUserCardStyle(u);
                                    const hasCustomBorder = u.border && u.border !== 'none';
                                    const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                                    const hasCustomStyle = isGlowActive || hasCustomBorder;
                                    
                                    let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                                    if (u.nameplate) {
                                      if (u.isCurrentUser) {
                                        cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                                      } else {
                                        cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                                      }
                                      if (hasCustomStyle) {
                                        cardClasses += " " + cardGlow.className;
                                      }
                                    } else {
                                      cardClasses += "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10 hover:shadow-md ";
                                    }
                                    // Add offline grayscale & dim styling
                                    cardClasses += " opacity-45 grayscale hover:opacity-100 hover:grayscale-0 ";
                                    return (
                                      <div
                                        key={u.id}
                                        onClick={() => handleProfileClick(u)}
                                        className={cardClasses}
                                        style={hasCustomStyle ? cardGlow.style : undefined}
                                      >
                                        {u.nameplate && (
                                          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                                            <video
                                              src={u.nameplate}
                                              autoPlay
                                              loop
                                              muted
                                              playsInline
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between w-full relative z-10">
                                          <div className="flex items-center gap-3 min-w-0 opacity-60">
                                          <div className="relative">
                                            {activeStories[u.id] ? (
                                              <div 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleProfileClick(u, "view", true);
                                                }}
                                                className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-pink-500 p-[2px] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                              >
                                                <div className="w-full h-full rounded-full border border-[#0a0f1d]">
                                                  <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-full h-full" className="rounded-full grayscale" />
                                                </div>
                                              </div>
                                            ) : (
                                              <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className="border border-white/10 bg-slate-850 grayscale" />
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={hasCustomStyle ? { color: cardGlow.style?.color } : { color: u.username_color }}>
                                              {u.username}
                                              
                                              {u.is_muted && <Hand className="w-3 h-3 text-red-500 inline" title="Muted" />}
                                            </span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="shrink-0 opacity-60">
                                          <img
                                            src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                            alt={u.rank}
                                            className="h-3 w-auto object-contain grayscale"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : rightPanelTab === "search" ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest px-2">Search Results</p>
                      {searchQuery.trim() === "" ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          <Search className="w-5 h-5 text-slate-600 mb-2" />
                          <p className="text-xs text-slate-400 font-bold">Type to search</p>
                        </div>
                      ) : (
                        computedUsers
                          .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((u) => {
                            const cardGlow = getUserCardStyle(u);
                            const hasCustomBorder = u.border && u.border !== 'none';
                            const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                            const hasCustomStyle = isGlowActive || hasCustomBorder;
                            
                            let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                            if (u.isCurrentUser) {
                               cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                            } else {
                               cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                            }
                            if (hasCustomStyle) {
                               cardClasses += " " + cardGlow.className;
                            }
                            return (
                              <div
                                key={u.id}
                                onClick={() => handleProfileClick(u)}
                                className={cardClasses}
                                style={hasCustomStyle ? cardGlow.style : undefined}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative">
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className={`border border-white/10 bg-slate-850 ${u.status === 'offline' ? 'grayscale' : ''}`} />
                                    <div className="absolute bottom-0 right-0">
                                      {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={{ color: u.username_color }}>
                                      {u.username}
                                      
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  <img
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                    alt={u.rank}
                                    className={`h-3 w-auto object-contain ${u.status === 'offline' ? 'grayscale' : ''}`}
                                  />
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2">
                          <span className="text-[14px] text-white font-extrabold font-display tracking-tight">Friends</span>
                        </div>
                      {friendsProfiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                          <Heart className="w-5 h-5 text-slate-600 mb-2" />
                          <p className="text-xs text-slate-400 font-bold">No friends added</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[180px]">Add friends from their profile to see them here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {friendsProfiles.map((u) => {
                            const isOnline = onlineUserIds.has(u.id);
                            const displayStatus = isOnline ? (u.custom_status === 'invisible' ? 'offline' : (u.custom_status || 'online')) : 'offline';
                            
                            const cardGlow = getUserCardStyle(u);
                            const hasCustomBorder = u.border && u.border !== 'none';
                            const isGlowActive = u.cardGlowType && u.cardGlowType !== 'none';
                            const hasCustomStyle = isGlowActive || hasCustomBorder;
                            
                            let cardClasses = "p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer border relative overflow-hidden group ";
                            if (u.isCurrentUser) {
                               cardClasses += "bg-white/[0.04] border-white/10 shadow-lg shadow-black/15 ";
                            } else {
                               cardClasses += "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03] ";
                            }
                            if (hasCustomStyle) {
                               cardClasses += " " + cardGlow.className;
                            }
                            return (
                              <div
                                key={u.id}
                                onClick={() => handleProfileClick(u)}
                                className={cardClasses}
                                style={hasCustomStyle ? cardGlow.style : undefined}
                              >
                                <div className={`flex items-center gap-3 min-w-0 ${displayStatus === 'offline' ? 'opacity-60' : ''}`}>
                                  <div className="relative">
                                    <Avatar src={u.pfp} alt={u.username} decoration={u.avatar_decoration} size="custom" containerClassName="w-9 h-9" className={`border border-white/10 bg-slate-850 ${displayStatus === 'offline' ? 'grayscale' : ''}`} />
                                    <div className="absolute bottom-0 right-0">
                                      {renderStatusBadge(displayStatus, "w-2.5 h-2.5 border-2 border-[#0a0f1d] rounded-full")}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[13px] font-bold truncate text-white leading-tight flex items-center gap-1" style={{ color: u.username_color }}>
                                      {u.username}
                                      
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-slate-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`shrink-0 ${displayStatus === 'offline' ? 'opacity-60' : ''}`}>
                                  <img
                                    src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon}
                                    alt={u.rank}
                                    className={`h-3 w-auto object-contain ${displayStatus === 'offline' ? 'grayscale' : ''}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Private Message Windows */}
      <PrivateMessageSystem
        user={user}
        activeChats={activeChats}
        onCloseChat={handleClosePrivateChat}
        onOpenChat={handleOpenPrivateChat}
        allProfiles={computedUsers}
        isOnlinePanelOpen={isOnlinePanelOpen}
        messages={privateMessages}
        onClearThread={async (otherId) => {
          const messagesToClear = privateMessages.filter(m => 
            (m.sender_id === user.id && m.recipient_id === otherId) || 
            (m.sender_id === otherId && m.recipient_id === user.id)
          );
          for (const msg of messagesToClear) {
            try {
              await deleteDoc(doc(firestore, "private_messages", msg.id));
            } catch (e) {
              console.error(e);
            }
          }
        }}
      />

      {/* Profile Modal */}
      {profileTarget && (
        <ProfileModal
          targetUser={profileTarget}
          currentUser={user}
          mode={profileMode}
          onClose={() => setProfileTarget(null)}
          onEdit={() => setProfileMode("edit")}
          onView={() => setProfileMode("view")}
          onMention={handleMention}
          onOpenPrivateChat={handleOpenPrivateChat}
          onUpdate={onUpdateUser}
          ranksInfo={allRanksInfo}
          soundsEnabled={soundsEnabled}
          initialShowStoryViewer={profileStoryView}
        />
      )}

      {/* Paint Modal */}
      {showPaintModal && (
        <PaintModal
          onClose={() => setShowPaintModal(false)}
          onSend={async (imageUrl) => {
            if (activeChats.length > 0) {
              const recipientId = activeChats[activeChats.length - 1];
              await addDoc(collection(firestore, "private_messages"), {
                sender_id: user.id,
                sender_username: user.username,
                sender_pfp: user.pfp || "",
                recipient_id: recipientId,
                image_url: imageUrl,
                created_at: new Date().toISOString(),
                is_read: false,
                type: 'paint'
              });
            } else {
              await addDoc(collection(firestore, "messages"), {
                profile_id: user.id,
                username: user.username,
                pfp: user.pfp || "",
                text: "🎨 Draw: Send a drawing",
                time: new Date().toISOString(),
                image_url: imageUrl,
                rank: user.rank,
                username_color: user.username_color || "#ffffff",
                message_color: user.message_color || "#e2e8f0",
                avatar_decoration: user.avatar_decoration || "",
                nameplate: user.nameplate || ""
              });
            }
            setShowPaintModal(false);
          }}
        />
      )}

      {/* Style Modal */}
      {showStyleModal && (
        <StyleModal
          user={user}
          onClose={() => setShowStyleModal(false)}
          onUpdate={onUpdateUser}
        />
      )}

      {/* Sound Settings Modal */}
      {showSoundSettingsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Sounds</h3>
              </div>
              <button 
                onClick={() => setShowSoundSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Master Mute Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-white block">Global Sounds</span>
                  <span className="text-[10px] text-slate-400">Enable or disable all sounds on the platform</span>
                </div>
                <button
                  onClick={() => {
                    const next = !soundsEnabled;
                    setSoundsEnabled(next);
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Chat Sounds */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Chat sounds</span>
                  <span className="text-[10px] text-slate-400">Play sound when someone types in chat</span>
                </div>
                <button
                  disabled={!soundsEnabled}
                  onClick={() => {
                    const next = !chatSoundsEnabled;
                    setChatSoundsEnabled(next);
                    localStorage.setItem("chatSoundsEnabled", String(next));
                    if (next && soundsEnabled) playAudio('/message.mp3');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${!soundsEnabled ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'cursor-pointer'} ${chatSoundsEnabled && soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${chatSoundsEnabled && soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Private Sounds */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Private sounds</span>
                  <span className="text-[10px] text-slate-400">Play sound when you get a private message</span>
                </div>
                <button
                  disabled={!soundsEnabled}
                  onClick={() => {
                    const next = !privateSoundsEnabled;
                    setPrivateSoundsEnabled(next);
                    localStorage.setItem("privateSoundsEnabled", String(next));
                    if (next && soundsEnabled) playAudio('/private.mp3');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${!soundsEnabled ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'cursor-pointer'} ${privateSoundsEnabled && soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${privateSoundsEnabled && soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Notification Sounds */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Notification sounds</span>
                  <span className="text-[10px] text-slate-400">Play sound when a notification or news is received</span>
                </div>
                <button
                  disabled={!soundsEnabled}
                  onClick={() => {
                    const next = !notificationSoundsEnabled;
                    setNotificationSoundsEnabled(next);
                    localStorage.setItem("notificationSoundsEnabled", String(next));
                    if (next && soundsEnabled) playAudio('/notify.mp3');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${!soundsEnabled ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'cursor-pointer'} ${notificationSoundsEnabled && soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${notificationSoundsEnabled && soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Username Tag Sounds */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Username sounds</span>
                  <span className="text-[10px] text-slate-400">Play sound when you get tagged by someone</span>
                </div>
                <button
                  disabled={!soundsEnabled}
                  onClick={() => {
                    const next = !tagSoundsEnabled;
                    setTagSoundsEnabled(next);
                    localStorage.setItem("tagSoundsEnabled", String(next));
                    if (next && soundsEnabled) playAudio('/username.mp3');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${!soundsEnabled ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'cursor-pointer'} ${tagSoundsEnabled && soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${tagSoundsEnabled && soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Call Sounds / Action Sounds */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/20 border border-white/5">
                <div>
                  <span className="text-sm font-bold text-slate-200 block">Call sounds</span>
                  <span className="text-[10px] text-slate-400">Play action sound on mutes, kicks, bans, or clears</span>
                </div>
                <button
                  disabled={!soundsEnabled}
                  onClick={() => {
                    const next = !callSoundsEnabled;
                    setCallSoundsEnabled(next);
                    localStorage.setItem("callSoundsEnabled", String(next));
                    if (next && soundsEnabled) playAudio('/action.mp3');
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${!soundsEnabled ? 'opacity-40 cursor-not-allowed bg-slate-800' : 'cursor-pointer'} ${callSoundsEnabled && soundsEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${callSoundsEnabled && soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowSoundSettingsModal(false)}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] transition-all text-white font-bold text-sm rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <ConvertModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowConvertModal(false)}
        />
      )}

      {/* Secret Message Modal */}
      {showSecretMessageModal && (
        <SecretMessageModal
          user={user}
          onClose={() => setShowSecretMessageModal(false)}
        />
      )}

      {/* Gallery Settings Modal */}
      {showGallerySettingsModal && (
        <GallerySettingsModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowGallerySettingsModal(false)}
        />
      )}

      {/* Secret Messages List Modal */}
      {showSecretMessagesListModal && (
        <SecretMessagesListModal
          user={user}
          onClose={() => setShowSecretMessagesListModal(false)}
        />
      )}

      {/* Profile Visitors Modal */}
      {showProfileVisitorsModal && (
        <ProfileVisitorsModal
          user={user}
          onClose={() => setShowProfileVisitorsModal(false)}
          allRanksInfo={allRanksInfo}
          computedUsers={computedUsers}
          handleProfileClick={handleProfileClick}
          onUserUpdate={onUpdateUser}
        />
      )}

      {/* Reveal Decision Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          user={user}
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onClearAll={() => setNotifications([])}
          onOpenDecision={(notif) => setActiveDecisionNotif(notif)}
        />
      )}

      {activeDecisionNotif && (
        <RevealDecisionModal
          user={user}
          notification={activeDecisionNotif}
          onClose={() => setActiveDecisionNotif(null)}
          onSuccess={() => {
            setActiveDecisionNotif(null);
          }}
        />
      )}

      {/* Poll Modal */}
      {showPollModal && (
        <PollModal
          user={user}
          onClose={() => setShowPollModal(false)}
          onSend={(pollData) => {
            addDoc(collection(firestore, "polls"), {
              question: pollData.question,
              options: pollData.options.reduce((acc, opt) => {
                if (opt.trim()) acc[opt] = [];
                return acc;
              }, {} as Record<string, string[]>),
              mode: pollData.mode,
              duration: pollData.duration,
              created_by: user.id,
              created_at: new Date().toISOString()
            });
            setShowPollModal(false);
          }}
        />
      )}

      {/* Vitro Modal */}
      {isVitroModalOpen && (
        <VitroModal
          isOpen={isVitroModalOpen}
          onClose={() => setIsVitroModalOpen(false)}
          user={user}
          onUpdateUser={onUpdateUser}
        />
      )}

      {/* Gift Modal */}
      {showGiftModal && (
        <GiftModal
          user={user}
          onClose={() => setShowGiftModal(false)}
          onSend={async (giftMessage, style) => {
            await addDoc(collection(firestore, "messages"), {
              profile_id: user.id,
              username: user.username,
              pfp: user.pfp || "",
              text: `🎁 Send a ${style} Gift Box:\n"${giftMessage}"`,
              time: new Date().toISOString(),
              rank: user.rank,
              username_color: user.username_color || "#ffffff",
              message_color: user.message_color || "#e2e8f0",
              avatar_decoration: user.avatar_decoration || "",
              nameplate: user.nameplate || ""
            });
            setShowGiftModal(false);
          }}
        />
      )}

      {/* Dice Modal */}
      {showDiceModal && (
        <DiceModal
          user={user}
          onClose={() => setShowDiceModal(false)}
          onSendRoll={async (messageText) => {
            await addDoc(collection(firestore, "messages"), {
              profile_id: user.id,
              username: user.username,
              pfp: user.pfp || "",
              text: messageText,
              time: new Date().toISOString(),
              rank: user.rank,
              username_color: user.username_color || "#ffffff",
              message_color: user.message_color || "#e2e8f0",
              avatar_decoration: user.avatar_decoration || "",
              nameplate: user.nameplate || ""
            });
            setShowDiceModal(false);
          }}
        />
      )}

    </div>
  );
}