import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar navbar-dark shadow-lg" style={{background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)', borderBottom: '3px solid #4a7c7c'}}>
      <div className="container-fluid px-2 px-md-3">
        <div className="d-flex align-items-center flex-grow-1" style={{minWidth: 0}}>
          <img
            src="https://media-jnb2-1.cdn.whatsapp.net/v/t61.24694-24/531816244_1267185695145803_3816874698378382952_n.jpg?ccb=11-4&oh=01_Q5Aa2gE6eCgVsJ7VS5mA4tUUzfCHqn50KfOgB46uc6VedXqULA&oe=68F0F796&_nc_sid=5e03e0&_nc_cat=111"
            alt="Group"
            style={{width: 'clamp(35px, 8vw, 50px)', height: 'clamp(35px, 8vw, 50px)', borderRadius: '50%', marginRight: 'clamp(8px, 2vw, 15px)', objectFit: 'cover', border: '2px solid #4a7c7c', flexShrink: 0}}
          />
          <div style={{minWidth: 0, overflow: 'hidden'}}>
            <span className="navbar-brand mb-0 text-white d-block text-truncate" style={{fontWeight: '700', letterSpacing: '1px', fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)', fontFamily: "'Russo One', sans-serif"}}>
              THE NARROW TRAIL
            </span>
            <small className="text-white-50 d-none d-md-inline" style={{fontSize: '0.75rem', fontStyle: 'italic'}}>
              "Small is the gate and narrow the road that leads to life" - Matthew 7:14
            </small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2" style={{flexShrink: 0}}>
          <span className="d-none d-lg-inline me-2 small text-white-50 text-truncate" style={{maxWidth: '200px'}}>
            {currentUser.email} ({currentUser.role})
          </span>
          <button className="btn btn-sm" style={{background: 'linear-gradient(90deg, #4a7c7c 0%, #2d5a7c 100%)', color: 'white', border: 'none', fontWeight: '600', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)'}} onClick={logout}>
            <LogOut size={16} className="me-1" />
            <span className="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
