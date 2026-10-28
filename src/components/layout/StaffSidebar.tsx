import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  CopyCheck,
  RotateCcw,
  Clock,
  BarChart3,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/api';

export const StaffSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingDuplicatesCount, setPendingDuplicatesCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const [dupRes, issRes] = await Promise.all([
          api.getDuplicates('pending'),
          api.getManagedIssues(),
        ]);
        setPendingDuplicatesCount(dupRes.duplicates?.length || 0);
        setOverdueCount(issRes.issues?.filter((i) => i.isOverdueResolution).length || 0);
      } catch (e) {
        // ignore
      }
    };
    fetchCounters();
  }, []);

  const navItems = [
    { to: '/staff', label: 'Operations Command', icon: LayoutDashboard, exact: true },
    { to: '/staff/issues', label: 'All Managed Issues', icon: Layers },
    {
      to: '/staff/duplicates',
      label: 'Duplicate Review Queue',
      icon: CopyCheck,
      badge: pendingDuplicatesCount > 0 ? pendingDuplicatesCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { to: '/staff/recurring', label: 'Recurring Problem Hotspots', icon: RotateCcw },
    {
      to: '/staff/sla',
      label: 'SLA & Overdue Tracking',
      icon: Clock,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-red-100 text-red-800 font-bold',
    },
    { to: '/staff/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { to: '/staff/audit', label: 'Audit Trail & History', icon: ScrollText },
    { to: '/staff/settings', label: 'SLA & Priority Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            Municipal Operations
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mx-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="p-2 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-blue-600" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Overdue alert notice */}
      {!collapsed && overdueCount > 0 && (
        <div className="m-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>{overdueCount} Overdue Issue{overdueCount > 1 ? 's' : ''}</span>
          </div>
          <p className="text-[11px] text-red-700">
            SLA resolution target deadline breached. Immediate dispatch recommended.
          </p>
        </div>
      )}
    </aside>
  );
};
