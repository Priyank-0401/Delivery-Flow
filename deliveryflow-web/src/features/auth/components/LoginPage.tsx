import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/api/apiClient';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GitBranch, 
  Shield, 
  Sun, 
  Moon,
  Activity,
  Server,
  KeyRound,
  Package,
  CreditCard,
  FileBarChart,
  Bell
} from 'lucide-react';

// --- Service Node Component ---
function ServiceNode({ name, status, icon: Icon, className }: { 
  name: string; 
  status: 'Healthy' | 'Warning' | 'At Risk'; 
  icon: React.ElementType;
  className?: string;
}) {
  const colors = {
    'Healthy': { border: 'border-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
    'Warning': { border: 'border-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
    'At Risk': { border: 'border-red-500/40', text: 'text-red-400', bg: 'bg-red-500/10', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
  };
  const c = colors[status];

  return (
    <div className={`absolute flex items-center gap-3 ${className}`}>
      <div className={`w-10 h-10 rounded-xl border ${c.border} ${c.bg} ${c.glow} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <div className="text-white text-sm font-semibold leading-tight">{name}</div>
        <div className={`text-xs font-medium ${c.text}`}>{status}</div>
      </div>
    </div>
  );
}

// --- Connection Lines SVG ---
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="greenLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
          <stop offset="50%" stopColor="rgba(16,185,129,0.15)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0.4)" />
        </linearGradient>
        <linearGradient id="redLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.4)" />
          <stop offset="50%" stopColor="rgba(239,68,68,0.15)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0.4)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Healthy connections */}
      <path d="M 180,190 Q 260,250 300,310" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 145,260 Q 220,300 290,340" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 310,320 Q 350,380 300,430" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 180,390 Q 240,420 290,450" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 145,530 Q 220,500 260,470" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 110,625 Q 200,590 240,530" stroke="url(#greenLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      {/* At-risk connections */}
      <path d="M 350,660 Q 310,580 270,520" stroke="url(#redLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      <path d="M 350,660 Q 250,640 160,620" stroke="url(#redLine)" strokeWidth="1.5" fill="none" filter="url(#glow)" />
      {/* Scatter dots along connections */}
      <circle cx="260" cy="275" r="2.5" fill="#10b981" opacity="0.6" />
      <circle cx="230" cy="355" r="2" fill="#10b981" opacity="0.5" />
      <circle cx="300" cy="400" r="3" fill="#10b981" opacity="0.4" />
      <circle cx="200" cy="480" r="2" fill="#10b981" opacity="0.5" />
      <circle cx="310" cy="590" r="2.5" fill="#ef4444" opacity="0.5" />
      <circle cx="250" cy="640" r="2" fill="#ef4444" opacity="0.4" />
      {/* Extra ambient dots */}
      <circle cx="380" cy="300" r="1.5" fill="#10b981" opacity="0.3" />
      <circle cx="150" cy="450" r="1.5" fill="#10b981" opacity="0.25" />
      <circle cx="320" cy="500" r="1.5" fill="#10b981" opacity="0.2" />
      <circle cx="400" cy="420" r="2" fill="#10b981" opacity="0.15" />
    </svg>
  );
}

// --- Delivery Health Widget ---
function DeliveryHealthWidget() {
  return (
    <div className="bg-[#0D1119]/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 w-72 shadow-xl">
      <div className="flex gap-0">
        {/* Health Gauge */}
        <div className="flex-1 flex flex-col items-center pr-3 border-r border-zinc-800/50">
          <div className="text-xs text-zinc-400 mb-2 font-medium">Delivery Health</div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" stroke="#1f2937" strokeWidth="5" fill="none" />
              <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="5" fill="none" 
                strokeDasharray={`${0.78 * 2 * Math.PI * 28} ${2 * Math.PI * 28}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-lg font-bold">78%</span>
            </div>
          </div>
          <span className="text-emerald-400 text-xs font-semibold mt-1">Good</span>
        </div>
        {/* At Risk */}
        <div className="flex-1 flex flex-col items-center px-3 border-r border-zinc-800/50">
          <div className="text-xs text-zinc-400 mb-2 font-medium">At Risk</div>
          <span className="text-amber-400 text-3xl font-bold">7</span>
          <span className="text-zinc-500 text-xs mt-1">Items</span>
        </div>
        {/* Blocked */}
        <div className="flex-1 flex flex-col items-center pl-3">
          <div className="text-xs text-zinc-400 mb-2 font-medium">Blocked</div>
          <span className="text-red-400 text-3xl font-bold">14</span>
          <span className="text-zinc-500 text-xs mt-1">Tasks</span>
        </div>
      </div>
    </div>
  );
}

// --- Team Capacity Widget ---
function TeamCapacityWidget() {
  return (
    <div className="bg-[#0D1119]/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 w-72 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-300 font-medium">Team Capacity</span>
        <span className="text-sm text-zinc-300 font-semibold">72%</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: '72%' }} />
      </div>
    </div>
  );
}

// --- Notifications Widget ---
function NotificationsWidget() {
  return (
    <div className="bg-[#0D1119]/80 backdrop-blur-md border border-zinc-800/50 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
        <Bell className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <div className="text-sm text-zinc-200 font-medium">Notifications</div>
        <div className="text-xs text-emerald-400 font-medium">Healthy</div>
      </div>
    </div>
  );
}

// ==================== MAIN LOGIN PAGE ====================
export function LoginPage() {
  const [email, setEmail] = useState('demo@deliveryflow.io');
  const [password, setPassword] = useState('Demo@12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      const data = response.data;
      login(data.accessToken, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Authentication failed. Please verify your credentials and ensure the backend is running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0E17] text-zinc-300 flex flex-col overflow-hidden relative font-sans">
      
      {/* ===== BACKGROUND LAYER ===== */}
      {/* Dot grid pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* Green ambient glow - top left */}
      <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none" />
      {/* Golden particle globe - bottom right */}
      <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/5 via-yellow-500/8 to-transparent blur-[60px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(251,191,36,0.4), transparent),
            radial-gradient(1.5px 1.5px at 40% 50%, rgba(251,191,36,0.3), transparent),
            radial-gradient(1px 1px at 60% 20%, rgba(251,191,36,0.5), transparent),
            radial-gradient(1.5px 1.5px at 80% 60%, rgba(245,158,11,0.3), transparent),
            radial-gradient(1px 1px at 30% 70%, rgba(251,191,36,0.4), transparent),
            radial-gradient(2px 2px at 70% 40%, rgba(245,158,11,0.2), transparent),
            radial-gradient(1px 1px at 50% 80%, rgba(251,191,36,0.3), transparent),
            radial-gradient(1.5px 1.5px at 10% 60%, rgba(245,158,11,0.25), transparent),
            radial-gradient(1px 1px at 90% 30%, rgba(251,191,36,0.35), transparent),
            radial-gradient(1px 1px at 25% 90%, rgba(251,191,36,0.2), transparent),
            radial-gradient(1.5px 1.5px at 55% 10%, rgba(245,158,11,0.3), transparent),
            radial-gradient(1px 1px at 75% 85%, rgba(251,191,36,0.25), transparent),
            radial-gradient(2px 2px at 45% 45%, rgba(245,158,11,0.15), transparent),
            radial-gradient(1px 1px at 85% 75%, rgba(251,191,36,0.3), transparent),
            radial-gradient(1.5px 1.5px at 15% 15%, rgba(245,158,11,0.2), transparent)
          `
        }} />
      </div>

      {/* ===== TOP BAR ===== */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          {/* DF Logo */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8 L18 8 Q28 8 28 18 L28 20 L20 20 L20 16 L16 16 L16 28 L8 28 Z" fill="#10b981" />
            <path d="M20 20 L28 20 L28 28 L20 28 Z" fill="#10b981" opacity="0.6" />
          </svg>
          <span className="text-white text-xl font-bold tracking-tight">DeliveryFlow</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800/40 rounded-full p-1 border border-zinc-700/30">
          <button className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors">
            <Sun className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-full bg-zinc-700/50 text-white transition-colors">
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 relative z-10 flex items-center justify-center">

        {/* --- Left: Service Nodes + Connection Lines --- */}
        <div className="absolute left-0 top-0 w-[480px] h-full hidden xl:block">
          <ConnectionLines />
          <ServiceNode name="User Service" status="Healthy" icon={Server} className="top-[18%] left-[200px]" />
          <ServiceNode name="API Gateway" status="Healthy" icon={Activity} className="top-[28%] left-[60px]" />
          <ServiceNode name="Auth Service" status="Healthy" icon={KeyRound} className="top-[42%] left-[40px]" />
          <ServiceNode name="Inventory" status="Warning" icon={Package} className="top-[58%] left-[100px]" />
          <ServiceNode name="Payment" status="Healthy" icon={CreditCard} className="top-[72%] left-[40px]" />
          <ServiceNode name="Reporting" status="At Risk" icon={FileBarChart} className="top-[76%] left-[250px]" />
        </div>

        {/* --- Center: Login Card --- */}
        <div className="w-full max-w-[420px] mx-auto relative z-20">
          <div className="bg-[#0D1119]/85 backdrop-blur-xl border border-emerald-500/15 rounded-2xl p-8 shadow-2xl shadow-black/30">
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8 L18 8 Q28 8 28 18 L28 20 L20 20 L20 16 L16 16 L16 28 L8 28 Z" fill="#10b981" />
                <path d="M20 20 L28 20 L28 28 L20 28 Z" fill="#10b981" opacity="0.6" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-white text-center mb-1">Welcome back</h2>
            <p className="text-sm text-zinc-400 text-center mb-8">Sign in to your DeliveryFlow workspace</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-semibold text-center mb-4 leading-normal">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  id="email" 
                  type="email" 
                  className="bg-[#111827] border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 pl-11 rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
                  placeholder="Email address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required 
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  className="bg-[#111827] border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 pl-11 pr-11 rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      rememberMe 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-zinc-600 bg-transparent'
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-zinc-400">Remember me</span>
                </label>
                <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0D1119] px-4 text-zinc-500">or</span>
              </div>
            </div>

            {/* GitHub Button */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-transparent border-zinc-700/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-white h-11 rounded-lg flex items-center justify-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Continue with GitHub
            </Button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-zinc-500">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure</span>
              <span>•</span>
              <span>Encrypted</span>
              <span>•</span>
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>

        {/* --- Right: Dashboard Widgets --- */}
        <div className="absolute right-8 top-[10%] hidden xl:flex flex-col gap-4 items-end">
          <DeliveryHealthWidget />
          <TeamCapacityWidget />
          <div className="mt-16">
            <NotificationsWidget />
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <footer className="relative z-20 flex items-center justify-between px-8 py-5 text-xs text-zinc-500">
        <span>© 2024 DeliveryFlow</span>
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 text-lg leading-none">"</span>
          <span className="italic text-zinc-400">Great delivery is engineered, not guessed.</span>
          <span className="text-zinc-600 text-lg leading-none">"</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
