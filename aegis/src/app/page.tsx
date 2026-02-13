"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Shield,
  User,
  MessageSquare,
  Map,
  Trophy,
  FileText,
  Search,
  Bell,
  ArrowUpRight,
  ChevronDown,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Users,
  Sun,
  Moon,
  Heart,
  Share2,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  X,
  Grid,
  Bookmark,
  Award,
  ZapOff,
  Flame,
  Camera,
  Image as ImageIcon,
  Lock,
  LogOut
} from 'lucide-react';

import ProfileTab from '../components/tabs/ProfileTab';
import ChatTab from '../components/tabs/ChatTab';

// --- Antigravity Physics Component ---

const AntigravityInner = ({
  count = 280,
  magnetRadius = 6,
  ringRadius = 7,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.0,
  lerpSpeed = 0.05,
  color = "#5227FF",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const temp = [];
    const width = viewport.width || 100;
    const height = viewport.height || 100;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;
      const randomRadiusOffset = (Math.random() - 0.5) * 2;

      temp.push({ t, factor, speed, mx: x, my: y, mz: z, cx: x, cy: y, cz: z, vx: 0, vy: 0, vz: 0, randomRadiusOffset });
    }
    return temp;
  }, [count, viewport.width, viewport.height]);

  useFrame(state => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v, pointer: m } = state;
    const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));

    if (mouseDist > 0.001) {
      lastMouseMoveTime.current = Date.now();
      lastMousePos.current = { x: m.x, y: m.y };
    }

    let destX = (m.x * v.width) / 2;
    let destY = (m.y * v.height) / 2;

    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (v.width / 4);
      destY = Math.cos(time * 0.5 * 2) * (v.height / 4);
    }

    const smoothFactor = 0.05;
    virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    particles.forEach((particle, i) => {
      let { t, speed, mx, my, mz, cz, randomRadiusOffset } = particle;
      t = particle.t += speed / 2;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetPos = { x: mx, y: my, z: mz * depthFactor };

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));
        const currentRingRadius = ringRadius + wave + deviation;

        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor);
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2));
      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      let scaleFactor = 1 - distFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;
      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </instancedMesh>
  );
};

const Antigravity = (props) => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
      <AntigravityInner {...props} />
    </Canvas>
  </div>
);

// --- Data ---

const INITIAL_ROADMAPS = [
  { id: 'fs', title: 'Full-Stack Engineering', field: 'Development', color: 'blue', steps: ['React/Next.js', 'Node.js Systems', 'PostgreSQL Mastery', 'Cloud Deployment'] },
  { id: 'ai', title: 'AI & Machine Learning', field: 'Intelligence', color: 'purple', steps: ['Linear Algebra', 'PyTorch Foundations', 'Transformer Models', 'LLM Fine-tuning'] },
  { id: 'cy', title: 'Cybersecurity Architect', field: 'Security', color: 'emerald', steps: ['Network Security', 'Penetration Testing', 'Cryptography', 'Cloud Compliance'] },
  { id: 'ds', title: 'Data Science Specialist', field: 'Analysis', color: 'amber', steps: ['Stat Analysis', 'R/Python Viz', 'Big Data Systems', 'Predictive Modeling'] },
];

const QUIZZES = [
  { id: 1, title: 'Data Structures & Algorithms', time: '15:00', difficulty: 'Hard', active: true },
  { id: 2, title: 'Quantum Computing Basics', time: '18:30', difficulty: 'Expert', active: false },
  { id: 3, title: 'UI/UX Design Systems', time: '21:00', difficulty: 'Medium', active: false },
];

const INITIAL_USERS = [
  { id: 1, name: 'Jaimil Patel', role: 'Lead Software Architect', avatar: 'JP', following: true, achievements: 18, online: true },
  { id: 2, name: 'Prajwal Anandgaonkar', role: 'AI Engineering @ Stanford', avatar: 'PA', following: false, achievements: 12, online: false },
  { id: 3, name: 'Bhavesh Gadekar', role: 'Theoretical Physics @ Princeton', avatar: 'BG', following: true, achievements: 15, online: true },
  { id: 4, name: 'Sahil Shigwan', role: 'Distributed Systems Analyst', avatar: 'SS', following: true, achievements: 21, online: true },
];

const TEST_FEED = [
  {
    id: 1,
    user: 'Jaimil Patel',
    handle: '@jaimil_p',
    time: '2h',
    content: 'Just finished my research paper on "Zero-Knowledge Proofs in Decentralized Finance". AEGIS Guard logic really helped maintain a toxic-free discussion during peer review! 🛡️',
    likes: 42,
    comments: 8,
    type: 'research',
    image: true
  },
  {
    id: 2,
    user: 'Prajwal Anandgaonkar',
    handle: '@prajwal_a',
    time: '5h',
    content: 'Completed the AI Engineer roadmap! The project sections were intense but incredibly rewarding. On to the Deep Learning specialization. 🚀',
    likes: 128,
    comments: 24,
    type: 'achievement',
    image: true
  },
  {
    id: 3,
    user: 'Sahil Shigwan',
    handle: '@sahil_s',
    time: '8h',
    content: 'New Distributed Systems tutorial is live in the Roadmap section. Covering consensus algorithms and fault tolerance. Check it out!',
    likes: 56,
    comments: 12,
    type: 'education',
    image: false
  }
];

// --- UI Components ---

const AegisLogo = ({ isDark }) => (
  <div className="flex items-center gap-3 cursor-pointer group">
    <div className={`relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-[360deg]`}>
      <div className={`absolute inset-0 rounded-xl border-2 rotate-45 transition-colors ${isDark ? 'border-white/20 group-hover:border-white' : 'border-black/10 group-hover:border-black'}`} />
      <div className={`absolute inset-1 rounded-lg border transition-colors ${isDark ? 'border-indigo-500/50 group-hover:border-indigo-400' : 'border-indigo-500/30'}`} />
      <Shield className={`w-4 h-4 md:w-5 md:h-5 relative z-10 transition-colors ${isDark ? 'text-white' : 'text-black'}`} />
    </div>
    <div className="hidden sm:flex flex-col -space-y-1">
      <span className={`text-xl md:text-2xl font-black tracking-tighter uppercase italic transition-colors ${isDark ? 'text-white' : 'text-black'}`}>Aegis</span>
      <span className="text-[7px] md:text-[8px] tracking-[0.4em] font-bold text-indigo-500 uppercase">Intelligent Systems</span>
    </div>
  </div>
);

const SlidingNavbar = ({ activeTab, setActiveTab, isDark }) => {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Feed' },
    { id: 'network', label: 'Network' },
    { id: 'chat', label: 'Chat' },
    { id: 'roadmaps', label: 'Roadmaps' },
    { id: 'quiz', label: 'Quiz' },
  ];

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className={`fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[70] px-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
      <div className={`relative flex items-center p-1.5 backdrop-blur-3xl border rounded-full transition-all duration-500 ${isDark ? 'bg-black/80 border-white/20 shadow-2xl shadow-white/10' : 'bg-white/90 border-black/20 shadow-2xl shadow-black/10'
        }`}>
        <div
          className={`absolute h-[calc(100%-8px)] rounded-full transition-all duration-500 ease-in-out z-0 ${isDark ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
            }`}
          style={{
            width: `calc(100% / ${tabs.length} - 4px)`,
            left: `calc(${activeIndex} * (100% / ${tabs.length}) + 2px)`,
            opacity: activeIndex === -1 ? 0 : 1
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-2 py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase transition-colors duration-300 w-16 md:w-24 text-center truncate ${activeTab === tab.id
              ? (isDark ? 'text-black' : 'text-white')
              : `text-gray-500 hover:${isDark ? 'text-white' : 'text-black'}`
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const FeedItem = ({ post, isDark }) => (
  <div className={`p-6 border-b transition-all duration-500 group ${isDark ? 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]' : 'border-black/5 bg-black/[0.01] hover:bg-black/[0.03]'}`}>
    <div className="flex gap-4">
      <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-lg relative ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
        {post.user[0]}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-inherit flex items-center justify-center">
          <CheckCircle2 className="w-2 h-2 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{post.user}</span>
            <span className="text-gray-500 text-xs">{post.handle} • {post.time}</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
        <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {post.content}
        </p>

        {post.image && (
          <div className={`w-full aspect-video rounded-3xl mb-4 overflow-hidden border border-white/10 bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.01] ${isDark ? 'from-zinc-900 via-indigo-900/10 to-zinc-900' : 'from-zinc-100 via-indigo-50 to-zinc-100'
            } flex flex-col items-center justify-center gap-3 relative`}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
            <ImageIcon className="w-8 h-8 opacity-20 relative z-10" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 relative z-10">Research Proof Data</span>
          </div>
        )}

        <div className="flex items-center gap-8 text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" /> <span className="text-xs font-bold">{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
            <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors ml-auto">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
);



// --- Network Section (Instagram Style List) ---

// NetworkTab definition
const NetworkTab = ({ isDark, users, toggleFollow }) => (
  <div className="pt-32 pb-24 px-6 md:px-10 max-w-3xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
      <div className="space-y-2 text-center md:text-left w-full">
        <h2 className={`text-4xl md:text-5xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Academic Circle</h2>
        <p className="text-gray-500 text-base font-medium">Verified researchers in your proximity.</p>
      </div>
    </div>

    <div className={`mb-10 flex items-center gap-4 border p-4 rounded-2xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50' : 'bg-white border-black/10 shadow-sm'}`}>
      <Search className="w-5 h-5 text-gray-400 ml-2" />
      <input type="text" placeholder="Search network..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
    </div>

    <div className={`rounded-[2.5rem] border overflow-hidden backdrop-blur-xl transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/10 shadow-2xl' : 'bg-white border-black/10 shadow-xl'}`}>
      {users.map(user => (
        <div key={user.id} className={`flex items-center justify-between p-6 border-b last:border-0 transition-all duration-300 ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-black/5 hover:bg-gray-50'
          }`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl transition-all duration-500 ${isDark ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-indigo-50 text-indigo-600 shadow-sm'
              }`}>
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`text-base font-bold transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</h3>
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">{user.role}</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1.5 opacity-80">{user.achievements} Badges • 1.2k Scholars</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleFollow(user.id)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform active:scale-95 shadow-md ${user.following
                ? (isDark ? 'bg-white/10 text-white border border-white/10 hover:bg-white hover:text-black' : 'bg-gray-100 text-black hover:bg-black hover:text-white')
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
                }`}
            >
              {user.following ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Profile Section (Jaimil Patel) ---

// ProfileView has been moved to src/components/tabs/ProfileTab.tsx

// --- App Root ---

export default function App() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS);

  useEffect(() => {
    setIsLoaded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const toggleTheme = () => setIsDark(!isDark);

  const toggleFollow = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, following: !u.following } : u));
  };

  const handleLogout = () => {
    setActiveTab('home');
    router.push('/login');
  };

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen selection:bg-indigo-500/30 overflow-x-hidden transition-all duration-700 ease-in-out ${isDark ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'
      }`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark ? 'bg-indigo-600/15 opacity-100' : 'bg-indigo-400/10 opacity-60'
          }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] blur-[200px] rounded-full transition-all duration-1000 ${isDark ? 'bg-emerald-600/10 opacity-100' : 'bg-emerald-400/5 opacity-40'
          }`} />
        <div className={`absolute top-0 right-[-5%] w-[50%] h-full transition-all duration-1000 z-0 ${isDark ? 'bg-gradient-to-l from-white/10 to-transparent' : 'bg-gradient-to-l from-white/30 to-transparent'
          }`} />
      </div>

      <header className={`fixed top-0 left-0 w-full z-[80] px-6 md:px-10 py-6 flex justify-between items-center transition-all duration-500 pointer-events-none ${isDark ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-gradient-to-b from-white/80 to-transparent'
        }`}>
        <div onClick={() => setActiveTab('home')} className="pointer-events-auto">
          <AegisLogo isDark={isDark} />
        </div>

        <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
              }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative cursor-pointer group">
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-inherit" />
            </div>
            <div
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${activeTab === 'profile'
                ? (isDark ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-black border-black')
                : (isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5 shadow-sm')
                }`}>
              <User className={`w-5 h-5 md:w-6 md:h-6 ${activeTab === 'profile' ? 'text-white' : ''}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Sliding Navbar - Always visible, but Profile is managed via User Icon */}
      <SlidingNavbar activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />

      <main className="relative z-10">
        <div
          key={activeTab}
          className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out"
        >
          {activeTab === 'home' && (
            <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24 md:pt-0">
              <Antigravity
                count={300}
                magnetRadius={5}
                ringRadius={5}
                waveSpeed={0.3}
                waveAmplitude={0.8}
                particleSize={0.6}
                color={isDark ? "#ffffff" : "#5227FF"}
                autoAnimate
              />

              <div className="max-w-5xl z-20">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-10 backdrop-blur-sm group cursor-pointer transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
                  }`}>
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Unlock Your Assets Spark!</span>
                </div>

                <h1 className={`text-4xl md:text-[7.5rem] font-medium tracking-tighter mb-8 leading-[0.9] transition-colors duration-700 ${isDark ? 'text-white' : 'text-black'}`}>
                  One-click for <br />
                  <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white via-white/80 to-white/40' : 'from-black via-black/80 to-black/40'}`}>
                    Asset Defense
                  </span>
                </h1>

                <p className={`text-sm md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Dive into the art assets, where innovative blockchain technology meets financial expertise.
                  AEGIS ensures your academic footprint is guarded by intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('feed')}
                    className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-xl active:scale-95 transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200 shadow-white/5' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                      }`}
                  >
                    Open Platform
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmaps')}
                    className={`w-full sm:w-auto px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[11px] border active:scale-95 transition-all ${isDark ? 'bg-transparent border-white/20 text-white hover:bg-white/10' : 'bg-transparent border-black/20 text-black hover:bg-black/5'
                      }`}
                  >
                    Discover More
                  </button>
                </div>
              </div>

              <div className="absolute bottom-10 left-0 w-full px-6 md:px-16 flex justify-between items-center opacity-40 z-20">
                <div className="flex gap-8 md:gap-16 items-center grayscale hover:grayscale-0 transition-all duration-500 font-bold text-[10px] md:text-xs tracking-widest uppercase">
                  <div>VERCEL</div>
                  <div>LOOM</div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-[10px] tracking-[0.4em] uppercase font-black">
                  <span className={`h-[1px] w-12 ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></span>
                  Academic DeFi
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && <ProfileTab isDark={isDark} onLogout={handleLogout} />}

          {activeTab === 'feed' && (
            <div className="max-w-3xl mx-auto pt-32 pb-24 px-4">
              <div className="flex justify-between items-center mb-12 px-4">
                <h2 className="text-4xl font-black tracking-tight transition-colors">Activity Feed</h2>
                <button className={`p-5 rounded-[1.5rem] shadow-2xl transition-all active:scale-95 ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-black hover:bg-gray-800 shadow-black/20'} text-white`}>
                  <Plus className="w-7 h-7" />
                </button>
              </div>
              <div className={`rounded-[3.5rem] border overflow-hidden backdrop-blur-3xl transition-all duration-500 ${isDark ? 'border-white/10 shadow-2xl bg-white/[0.02]' : 'border-black/10 shadow-xl bg-white'}`}>
                {TEST_FEED.map(post => (
                  <FeedItem key={post.id} post={post} isDark={isDark} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'network' && <NetworkTab isDark={isDark} users={users} toggleFollow={toggleFollow} />}

          {activeTab === 'chat' && <ChatTab isDark={isDark} users={users} />}

          {(activeTab === 'roadmaps' || activeTab === 'quiz') && (
            <div className="pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
                <h2 className="text-5xl font-black tracking-tight transition-colors italic uppercase">{activeTab}</h2>
                <div className={`flex items-center gap-4 px-5 py-3 border rounded-full w-full md:w-auto transition-all ${isDark ? 'bg-white/5 border-white/10 focus-within:border-indigo-500/50 shadow-lg' : 'bg-white border-black/10 shadow-sm'}`}>
                  <Search className="w-4 h-4 opacity-50" />
                  <input type="text" placeholder={`Filter ${activeTab}...`} className="bg-transparent border-none focus:ring-0 text-xs w-full md:w-56 font-bold uppercase tracking-widest" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {activeTab === 'roadmaps' && INITIAL_ROADMAPS.map(r => (
                  <div key={r.id} className={`p-12 rounded-[4rem] border transition-all duration-500 group relative ${isDark ? 'bg-white/[0.02] border-white/10 hover:border-indigo-500/50 shadow-2xl' : 'bg-white border-black/10 shadow-xl hover:shadow-2xl'}`}>
                    <div className={`w-16 h-16 rounded-[1.5rem] mb-10 flex items-center justify-center bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/5`}>
                      <Map className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 transition-colors tracking-tight">{r.title}</h3>
                    <p className="text-[11px] text-indigo-500 uppercase font-black mb-10 tracking-[0.4em]">{r.field}</p>
                    <div className="space-y-5">
                      {r.steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-5 text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" /> {s}
                        </div>
                      ))}
                    </div>
                    <button className={`w-full mt-12 py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] border transition-all active:scale-[0.98] ${isDark ? 'bg-white/5 border-white/10 hover:bg-white hover:text-black shadow-lg shadow-white/5' : 'bg-gray-50 border-black/5 hover:bg-black hover:text-white shadow-sm'
                      }`}>
                      Analyze Mastery
                    </button>
                  </div>
                ))}
                {activeTab === 'quiz' && QUIZZES.map(q => (
                  <div key={q.id} className={`p-12 rounded-[4rem] border transition-all duration-500 group ${isDark ? 'bg-white/[0.02] border-white/10 hover:border-amber-500/50 shadow-2xl' : 'bg-white border-black/10 shadow-xl hover:shadow-2xl'}`}>
                    <div className="flex justify-between items-start mb-12">
                      <Trophy className="w-14 h-14 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg' : 'bg-amber-50 border-amber-500/20 text-amber-600 shadow-sm'
                        }`}>{q.difficulty}</span>
                    </div>
                    <h3 className="text-2xl font-black mb-5 leading-tight transition-colors tracking-tight">{q.title}</h3>
                    <p className="text-sm opacity-60 mb-12 font-bold transition-opacity tracking-tight">
                      {q.active ? `Live session concluding in ${q.time}` : `Guarded start: ${q.time}`}
                    </p>
                    <button className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-[0.98] ${q.active
                      ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-xl shadow-amber-500/30'
                      : (isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border border-black/10 text-black hover:bg-gray-100 shadow-sm')
                      }`}>
                      {q.active ? 'Join Secure Hall' : 'Request Reminder'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className={`fixed bottom-10 left-10 z-50 hidden sm:flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-2xl transition-all duration-500 hover:scale-105 ${isDark ? 'bg-black/40 border-white/10 shadow-2xl shadow-indigo-500/20' : 'bg-white/80 border-black/10 shadow-xl'
        }`}>
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
          <div className="absolute inset-[-4px] rounded-full bg-emerald-500/20 animate-ping" />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] leading-none mb-1">Aegis Guard Core</span>
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest transition-opacity opacity-60">Protocol 15.0 Active</span>
        </div>
      </div>
    </div>
  );
}