import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import homeIcon from '@/assets/icons/home.png';
import calendarIcon from '@/assets/icons/calendar-heart.png';
import speechIcon from '@/assets/icons/speech-bubble.png';
import featherIcon from '@/assets/icons/feather.png';
import compassIcon from '@/assets/icons/compass.png';

const navItems = [
  { path: '/home', icon: homeIcon, label: 'Home' },
  { path: '/routine', icon: calendarIcon, label: 'Routine' },
  { path: '/ubi', icon: speechIcon, label: 'Ubi', isCenter: true },
  { path: '/alignment', icon: featherIcon, label: 'Reflect' },
  { path: '/wander', icon: compassIcon, label: 'Wander' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

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
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-background bg-primary"
                >
                  <img src={item.icon} alt={item.label} className="w-7 h-7 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
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
                className="relative"
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-6 h-6 object-contain transition-opacity ${isActive ? 'opacity-100 clay-icon' : 'opacity-50'}`}
                  style={!isActive ? { filter: 'grayscale(0.5)' } : undefined}
                />
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
