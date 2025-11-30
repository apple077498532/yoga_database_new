import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import { BookOpen, UserCog } from 'lucide-react';

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        isActive ? 'text-yoga-accent font-bold' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`p-2 rounded-full ${isActive ? 'bg-indigo-50' : ''}`}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  );
}

const Navigation = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-around items-center z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
            <NavLink to="/" icon={<BookOpen size={24} />} label="知識庫" />
            <NavLink to="/admin" icon={<UserCog size={24} />} label="老師後台" />
        </nav>
    );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-yoga-bg text-yoga-text selection:bg-yoga-accent selection:text-white pb-24">
         <header className="pt-8 pb-4 px-6 text-center">
             <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yoga-accent to-yoga-blue tracking-tight">
                 Yoga AI <span className="text-yoga-text font-light text-xl">Assistant</span>
             </h1>
         </header>

        <main className="px-4">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
};

export default App;