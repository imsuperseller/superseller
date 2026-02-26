import { useState, useEffect } from 'react';
// import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  BarChart3,
  Workflow,
  Settings,
  Shield,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';
import { NoiseTexture } from '@/components/ui/premium/NoiseTexture';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Projects', href: '/admin/projects', icon: FolderOpen },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Workflows', href: '/admin/workflows', icon: Workflow },
  { name: 'Fulfillment Queue', href: '/admin/fulfillment', icon: ClipboardList },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'System', href: '/admin/system', icon: Shield },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const session = { user: { name: 'Admin User', email: 'shai@superseller.agency' } };
  const pathname = usePathname();
  const signOut = () => console.log('Sign out clicked');

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--superseller-bg-primary)' }}>
      <AnimatedGridBackground className="opacity-40" />
      <NoiseTexture opacity={0.02} />

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'
          }`}
      >
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-2xl border-r border-white/10 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/superseller-logo.webp"
                  alt="SuperSeller AI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                SuperSeller AI
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all group ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-grow bg-black/40 backdrop-blur-2xl border-r border-white/5">
          <div className="flex h-16 items-center px-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="/superseller-logo.webp"
                  alt="SuperSeller AI"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                SuperSeller AI
              </h1>
            </div>
          </div>
          <nav className="mt-6 px-4 flex-1 space-y-1">
            {navigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all group ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="text-sm font-black uppercase tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/5">
          <div className="flex h-16 items-center justify-between px-6 sm:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-lg font-black uppercase tracking-widest text-white/90">
                  {navigation.find(item => item.href === pathname)?.name ||
                    'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm text-white placeholder:text-slate-600 transition-all w-64"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-[#f47920] rounded-full shadow-[0_0_10px_rgba(244,121,32,0.5)]"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-xs font-black uppercase tracking-widest">
                    {session.user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#152236] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-2xl ring-1 ring-black/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs font-black uppercase tracking-widest text-white">
                        {session.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2.5 text-left hover:bg-[#f47920]/10 text-slate-400 hover:text-[#f47920] text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
