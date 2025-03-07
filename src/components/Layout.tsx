import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PieChart, Heart, Compass, Users, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import LoginButton from './LoginButton';
import { getUserData, UserData } from '../lib/api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  
  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const data = await getUserData(user.id);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchUserData();
  }, [user]);
  
  const copyReferralCode = () => {
    if (userData?.referral_code) {
      navigator.clipboard.writeText(userData.referral_code);
      alert('Referral code copied to clipboard!');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const displayName = userData?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="min-h-screen max-w-[700px] mx-auto bg-gray-50 flex flex-col">
      {/* <header className="p-4 flex items-center justify-between bg-red-400 text-white">
        <div className="flex items-center gap-3">
          {!loading && userData && (
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white text-red-600 flex items-center justify-center text-xl font-bold">
                {userData.days_left}
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-white text-red-600 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                DAYS LEFT
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!loading && userData && (
            <button 
              onClick={copyReferralCode}
              className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full hover:bg-red-400 transition-colors"
            >
              <span className="font-medium">{userData.referral_code}</span>
            </button>
          )}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1"
              >
                <span className="font-medium">{displayName}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20">
                  <img 
                    src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </header> */}
      
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-[700px] mx-auto">
          <div className="flex justify-between px-6 py-2">
            <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-red-500' : 'text-gray-600'}`}>
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/insights" className={`flex flex-col items-center ${location.pathname === '/insights' ? 'text-red-500' : 'text-gray-600'}`}>
              <PieChart size={24} />
              <span className="text-xs mt-1">Insights</span>
            </Link>
            <Link to="/donations" className={`flex flex-col items-center ${location.pathname === '/donations' ? 'text-red-500' : 'text-gray-600'}`}>
              <Heart size={24} />
              <span className="text-xs mt-1">Donations</span>
            </Link>
            <Link to="/explore" className={`flex flex-col items-center ${location.pathname === '/explore' ? 'text-red-500' : 'text-gray-600'}`}>
              <Compass size={24} />
              <span className="text-xs mt-1">Explore</span>
            </Link>
            <Link to="/community" className={`flex flex-col items-center ${location.pathname === '/community' ? 'text-red-500' : 'text-gray-600'}`}>
              <Users size={24} />
              <span className="text-xs mt-1">Community</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}