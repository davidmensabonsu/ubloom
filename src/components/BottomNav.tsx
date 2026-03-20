import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, Target, Image, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ubloomLogo from '@/assets/ubloom-flower.png';
const navItems = [
{ path: '/home', icon: Home, label: 'Home', isLogo: false },
{ path: '/alignment', icon: Compass, label: 'Align', isLogo: false },
{ path: '/routine', icon: Calendar, label: 'Routine', isLogo: false },
{ path: '/goals', icon: Target, label: 'Goals', isLogo: false },
{ path: '/moodboard', icon: Image, label: 'Dream', isLogo: false }];


export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}>
              
              <motion.div
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                
                {item.isLogo ?
                <img alt="Home" className="h-[35px] w-[35px] object-contain clay-icon" src={ubloomLogo} /> :

                Icon && <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                }
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive &&
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />

              }
            </NavLink>);

        })}
      </div>
    </nav>);

}