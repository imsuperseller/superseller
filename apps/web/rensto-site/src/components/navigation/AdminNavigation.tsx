'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  User,
  Package,
  Workflow,
  Activity,
  Key,
  CreditCard,
  FileText,
  Settings,
  Shield,
  Heart,
  ChevronRight,
} from 'lucide-react';

const adminNavigation = [
  { 
    name: 'Overview', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'System-wide KPIs and monitoring'
  },
  { 
    name: 'Tenants', 
    href: '/admin/tenants', 
    icon: Users,
    description: 'Manage customer organizations'
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: User,
    description: 'User management and permissions'
  },
  { 
    name: 'Catalog', 
    href: '/admin/catalog', 
    icon: Package,
    description: 'Agent definitions and versions'
  },
  { 
    name: 'Agents', 
    href: '/admin/agents', 
    icon: Workflow,
    description: 'Global agent instances'
  },
  { 
    name: 'Runs', 
    href: '/admin/runs', 
    icon: Activity,
    description: 'Execution history and monitoring'
  },
  { 
    name: 'Credentials', 
    href: '/admin/credentials', 
    icon: Key,
    description: 'Secure credential management'
  },
  { 
    name: 'Billing', 
    href: '/admin/billing', 
    icon: CreditCard,
    description: 'Plans, pricing, and billing'
  },
  { 
    name: 'Reports', 
    href: '/admin/reports', 
    icon: FileText,
    description: 'Generated reports and analytics'
  },
  { 
    name: 'Integrations', 
    href: '/admin/integrations', 
    icon: Settings,
    description: 'External service connections'
  },
  { 
    name: 'Audit', 
    href: '/admin/audit', 
    icon: Shield,
    description: 'Security and activity logs'
  },
  { 
    name: 'Health', 
    href: '/admin/health', 
    icon: Heart,
    description: 'System health monitoring'
  },
];

interface AdminNavigationProps {
  className?: string;
  collapsed?: boolean;
}

export function AdminNavigation({ className, collapsed = false }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)}>
      {adminNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'hover:bg-slate-100 hover:text-slate-900',
              isActive
                ? 'bg-slate-100 text-slate-900 border-r-2 border-orange-500'
                : 'text-slate-600',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.description : undefined}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-500',
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

export function AdminNavigationMobile() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-2">
      {adminNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors',
              'hover:bg-slate-100 hover:text-slate-900',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600'
            )}
          >
            <item.icon
              className={cn(
                'mr-4 h-6 w-6 flex-shrink-0',
                isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-500'
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
