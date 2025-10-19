import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, ListTodo, Trophy, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
interface LayoutProps {
  children: ReactNode;
}
const navItems = [{
  path: '/',
  label: 'Dashboard',
  icon: Home
}, {
  path: '/members',
  label: 'Members',
  icon: Users
}, {
  path: '/tasks',
  label: 'Tasks',
  icon: ListTodo
}, {
  path: '/leaderboard',
  label: 'Leaderboard',
  icon: Trophy
}, {
  path: '/archive',
  label: 'Archive',
  icon: Archive
}];
export const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-primary/10 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={cn('flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all duration-200', 'hover:bg-primary/10', isActive ? 'bg-primary/20 text-primary-foreground font-medium border-b-2 border-primary' : 'text-muted-foreground')}>
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>;
          })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>;
};