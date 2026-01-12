'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Workflow,
  CheckCircle,
  Activity,
  Key,
  FileText,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  Signal,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const clientNavigation = [
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and KPIs'
  },
  {
    name: 'Agents',
    href: '/app/agents',
    icon: Workflow,
    description: 'Manage your AI agents'
  },
  {
    name: 'Approvals',
    href: '/app/approvals',
    icon: CheckCircle,
    description: 'Review and approve content'
  },
  {
    name: 'Runs',
    href: '/app/runs',
    icon: Activity,
    description: 'Execution history'
  },
  {
    name: 'Credentials',
    href: '/app/credentials',
    icon: Key,
    description: 'Manage integrations'
  },
  {
    name: 'Reports',
    href: '/app/reports',
    icon: FileText,
    description: 'Analytics and reports'
  },
  {
    name: 'Billing',
    href: '/app/billing',
    icon: CreditCard,
    description: 'Usage and payments'
  },
  {
    name: 'Settings',
    href: '/app/settings',
    icon: Settings,
    description: 'Account preferences'
  },
  {
    name: 'Support',
    href: '/app/support',
    icon: HelpCircle,
    description: 'Get help and support'
  },
  {
    name: 'Status',
    href: '/app/status',
    icon: Signal,
    description: 'System status and uptime'
  },
];

interface ClientNavigationProps {
  className?: string;
  collapsed?: boolean;
}

export function ClientNavigation({ className, collapsed = false }: ClientNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)}>
      {clientNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:bg-white/5 hover:text-white',
              isActive
                ? 'bg-white/10 text-white border-r-2 border-rensto-cyan'
                : 'text-gray-400',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.description : undefined}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-rensto-cyan' : 'text-gray-500 group-hover:text-gray-300',
                collapsed && 'mr-0'
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function ClientNavigationMobile() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-2">
      {clientNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors',
              'hover:bg-white/5 hover:text-white',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400'
            )}
          >
            <item.icon
              className={cn(
                'mr-4 h-6 w-6 flex-shrink-0',
                isActive ? 'text-rensto-cyan' : 'text-gray-500 group-hover:text-gray-300'
              )}
            />
            <span className="flex-1">{item.name}</span>
            {isActive && (
              <ChevronRight className="h-5 w-5 text-slate-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
