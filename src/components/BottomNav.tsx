import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, Target, Image, User } from 'lucide-react';

const navItems = [
{ path: '/home', icon: null, label: 'Home', isLogo: true },
{ path: '/alignment', icon: Compass, label: 'Align', isLogo: false },
{ path: '/routine', icon: Calendar, label: 'Routine', isLogo: false },
{ path: '/goals', icon: Target, label: 'Goals', isLogo: false },
{ path: '/moodboard', icon: Image, label: 'Dream', isLogo: false },
{ path: '/profile', icon: User, label: 'Profile', isLogo: false }];


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
                <img alt="Home" className="h-[35px] w-[35px] object-contain" src="/lovable-uploads/74df1548-966b-4649-a7f6-0cd4b50572cf.png" /> :

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