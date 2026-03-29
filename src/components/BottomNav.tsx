import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, Search, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ubloomLogo from '@/assets/ubloom-flower.png';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/routine', icon: Calendar, label: 'Routine' },
  { path: '/ubi', icon: Heart, label: 'Ubi', isCenter: true },
  { path: '/alignment', icon: Compass, label: 'Reflect' },
  { path: '/wander', icon: Search, label: 'Wander' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 -mt-5 relative"
              >
                <motion.div
                  initial={false}
                  animate={isActive ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/80 text-primary-foreground'
                  }`}
                >
                  <Icon size={24} strokeWidth={2.2} />
                </motion.div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <motion.div
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {Icon && <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />}
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}