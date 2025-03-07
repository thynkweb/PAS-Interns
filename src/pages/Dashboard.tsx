import React, { useState, useEffect } from 'react';
import { Copy, Share2, ArrowRight, LogOut, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getFundraisingAmount, FundraisingAmount, getUserData, UserData, getDonationStats, getDonations, getChildren, Child } from '../lib/api';
import LoginButton from '../components/LoginButton';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fundraisingData, setFundraisingData] = useState<FundraisingAmount | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [targetAmount, setTargetAmount] = useState(30000);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          const [fundData, uData, stats, donations, childrenData] = await Promise.all([
            getFundraisingAmount(user.id),
            getUserData(user.id),
            getDonationStats(),
            getDonations(user.id),
            getChildren()
          ]);

          // Calculate total amount from user's donations
          const totalAmount = donations
            .filter(d => d.user_id === user.id)
            .reduce((sum, d) => sum + d.amount, 0);

          setFundraisingData({
            id: fundData?.id || '',
            user_id: user.id,
            current_amount: totalAmount,
            target_amount: fundData?.target_amount || 35000,
            created_at: fundData?.created_at || new Date().toISOString(),
            updated_at: fundData?.updated_at || new Date().toISOString()
          });
          
          setUserData(uData);
          setDonationStats(stats);
          setChildren(childrenData);
          console.log("user data", userData);
          
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [user]);

  const donateUrl = `https://www.muskurahat.org.in/donate?r=${userData?.referral_code || ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(donateUrl);
    alert('Donation link copied to clipboard!');
  };

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(`Support our cause! Donate here: ${donateUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate user rank based on fundraising amount
  const currentAmount = 62050;
  let rankTitle = "Beginner";
  let rankLevel = "LEVEL 1 (0/10k)";
  
  if (currentAmount >= 25000) {
    rankTitle = "Social Change Leader";
    rankLevel = "LEVEL 3 (18.6k/25k)";
  } else if (currentAmount >= 10000) {
    rankTitle = "Community Champion";
    rankLevel = "LEVEL 2 (10k/25k)";
  }

  // Calculate number of children supported
  const childrenSupported = Math.max(1, Math.floor((currentAmount / 35000) * 2));
  const displayName = userData?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  
  const progress = Math.min((currentAmount / 100000) * 180, 180); // Max 180 degrees for semi-circle
  const minAmount = 5000;
  const maxAmount = 120000;

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="bg-red-400 rounded-3xl p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full px-3 py-2 text-gray-700 text-sm font-medium">
              Days left <span className="text-indigo-600 font-bold ml-1">{userData?.days_left || 30}</span>
            </div>
          </div>
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
        <h1 className="text-2xl font-bold text-center mt-4">My Dashboard</h1>
      </div>

      {/* Impact Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            <span className="text-red-500">YOUR</span> <span className="text-indigo-600">IMPACT</span>
          </h2>
          <p className="text-gray-500 text-sm">See how your goals can create impact</p>
        </div>

        <div className="relative pt-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[250px] h-[125px] overflow-hidden">
              {/* Amount labels */}
              <div className="absolute -top-8 left-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">₹0</div>
              <div className="absolute -top-8 right-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">
                ₹{targetAmount.toLocaleString('en-IN')}
              </div>
              
              {/* Pencil design */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/dist/assets/pencil_border.svg')",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "100%",
                }}
              ></div>


              
              <div
                className="absolute inset-0 origin-bottom transition-transform duration-1000"
                style={{
                  transform: `rotate(${progress - 90}deg)`, // Rotate left by 90 degrees
                  display: progress > 0 ? 'block' : 'none',
                  backgroundImage: "url('/dist/assets/needle.svg')",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "100%",
                  
                }}
              ></div>



              
              {/* Needle/Pointer */}
              {/* <div 
                className="absolute top-0 left-1/2 w-2 h-[125px] bg-red-500 origin-bottom transition-transform duration-1000"
                style={{ transform: `translateX(-50%) rotate(${progress}deg)` }}
              >
                <div className="absolute -top-2 -left-1 w-4 h-4 bg-yellow-300 rounded-full"></div>
              </div> */}
            </div>
            <div className="text-center mt-4">
              <h2 className="text-lg font-medium mb-1">Amount Raised</h2>
              <p className="text-4xl font-bold">₹{currentAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {showAdjust && (
            <div className="mt-6">
              <label htmlFor="targetAmount" className="block text-sm font-medium mb-2">
                Adjust Target Amount
              </label>
              <div className="relative">
                <input
                  type="range"
                  id="targetAmount"
                  min={minAmount}
                  max={maxAmount}
                  step="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>₹{minAmount.toLocaleString('en-IN')}</span>
                  <span>₹{targetAmount.toLocaleString('en-IN')}</span>
                  <span>₹{maxAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* <button 
            onClick={() => setShowAdjust(!showAdjust)}
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Settings2 size={20} />
          </button> */}
          
          <p className="text-center text-sm mt-4 text-red-500">
            *Will help us fund the education of {childrenSupported} {childrenSupported === 1 ? 'child' : 'children'} for an entire year.
          </p>
        </div>

        {/* Rank Card */}
        <div className="bg-red-100 rounded-xl p-4 mb-6">
          <p className="text-gray-600 text-sm mb-1">Your Rank</p>
          <h3 className="text-xl font-bold text-red-800">{rankTitle}</h3>
          <p className="text-red-500 text-sm">{rankLevel}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={copyReferralLink}
            className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-600 py-3 px-4 rounded-xl hover:bg-indigo-200 transition-colors"
          >
            <span className="font-medium">Copy Link For Referral</span>
            <Copy size={20} />
          </button>
          <button 
            onClick={shareOnWhatsapp}
            className="flex items-center justify-center gap-2 bg-green-100 text-green-600 py-3 px-4 rounded-xl hover:bg-green-200 transition-colors"
          >
            <span className="font-medium">Direct Whatsapp Message Link</span>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Who We Are Working For */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            <span className="text-red-500">WHO WE ARE</span> <span className="text-indigo-600">WORKING FOR</span>
          </h2>
          <button 
            onClick={() => navigate('/children')}
            className="text-indigo-600 flex items-center gap-1 text-sm font-medium"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {children.slice(0, 4).map(child => (
            <div 
              key={child.id}
              onClick={() => navigate(`/children/${child.id}`)}
              className="bg-amber-100 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img 
                  src={child.image_url} 
                  alt={child.name}
                  className="w-full h-32 object-cover"
                />
                {child.priority === 'High' && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    High Priority
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-lg font-bold text-indigo-600">{child.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <div className="flex items-center">
                    <span className="mr-1">🗓️</span>
                    <span>{child.age} Years</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📍</span>
                    <span>{child.location}</span>
                  </div>
                </div>
                <div className="flex mt-2 gap-2">
                  <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    Assignment
                  </button>
                  <button className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                    See More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crowdfunding Hacks */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-indigo-700">CROWDFUNDING HACKS</h3>
          <span className="text-xl">💡</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/hacks/capturing-attention')}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500">💡</span>
              </div>
              <h4 className="font-semibold">CAPTURING ATTENTION</h4>
            </div>
            <p className="text-sm text-gray-600">FOR YOUR CAUSE</p>
          </div>
          <div 
            onClick={() => navigate('/hacks/building-connections')}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500">💡</span>
              </div>
              <h4 className="font-semibold">BUILDING</h4>
            </div>
            <p className="text-sm text-gray-600">CONNECTIONS WITH ANYONE</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/donations')}
          className="w-full text-red-500 font-semibold mt-4 text-center hover:text-red-600 transition-colors"
        >
          Check all your donations →
        </button>
      </div>
    </div>
  );
}