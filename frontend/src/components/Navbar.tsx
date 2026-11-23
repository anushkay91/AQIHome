import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wind, Shield, Activity, CheckSquare, Settings, LogOut, Menu, X, Sparkles, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { OutdoorAqiContext } from '../types';

export const Navbar: React.FC = () => {
  const { user, household, isGuestDemo, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [outdoorAqi, setOutdoorAqi] = useState<OutdoorAqiContext | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCityAqi = async () => {
      if (household?.city) {
        try {
          const aqi = await api.getOutdoorAqi(household.city);
          if (isMounted) setOutdoorAqi(aqi);
        } catch {
          // Ignore background fetch error
        }
      }
    };
    fetchCityAqi();
    return () => { isMounted = false; };
  }, [household?.city]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Pollution Detective', path: '/detective', icon: Activity },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Impact Tracker', path: '/tracker', icon: CheckSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getAqiBadgeColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'good': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'satisfactory': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'very poor': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-rose-900 text-white border-rose-950'; // Severe
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group focus-ring rounded-lg p-1">
              <div className="w-10 h-10 rounded-xl bg-clean-600 text-white flex items-center justify-center shadow-sm group-hover:bg-clean-700 transition">
                <Shield className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                  GharKaGod <span className="text-clean-600 text-xs font-normal">घर का गॉड</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Indoor Clean Air SaaS
                </span>
              </div>
            </Link>

            {/* Outdoor AQI Pill */}
            {outdoorAqi && (
              <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50">
                <Wind className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span className="text-slate-600 font-semibold">{outdoorAqi.city}:</span>
                <span className={`px-1.5 py-0.5 rounded-full border text-[11px] ${getAqiBadgeColor(outdoorAqi.aqi_category)}`}>
                  AQI {outdoorAqi.aqi} • {outdoorAqi.aqi_category}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition focus-ring ${
                      isActive
                        ? 'bg-clean-50 text-clean-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-clean-600' : 'text-slate-400'}`} aria-hidden="true" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition focus-ring rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-4 py-2 text-sm font-medium text-white bg-clean-600 hover:bg-clean-700 rounded-lg shadow-sm transition focus-ring"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* User / Guest Status & Logout */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              {isGuestDemo && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full border border-amber-300">
                  Guest Demo Mode
                </span>
              )}
              <div className="text-right">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">
                  {household?.name || user.full_name || 'My Home'}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {household?.city || 'India'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out of application"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition focus-ring"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isGuestDemo && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-semibold rounded-full">
                Demo
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus-ring"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {outdoorAqi && (
            <div className="py-2 border-b border-slate-100 text-xs flex items-center justify-between">
              <span className="text-slate-600 font-medium">{outdoorAqi.city} Outdoor Air:</span>
              <span className={`px-2 py-0.5 rounded-full border ${getAqiBadgeColor(outdoorAqi.aqi_category)}`}>
                AQI {outdoorAqi.aqi} • {outdoorAqi.aqi_category}
              </span>
            </div>
          )}

          {user ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-clean-50 text-clean-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {household?.name || user.email}
                </span>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:underline font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-medium text-white bg-clean-600 rounded-lg shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
