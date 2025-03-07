import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, LightbulbIcon, X, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDonations, Donation } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

interface DonationRange {
  range: string;
  count: number;
}

const donationRanges: DonationRange[] = [
  { range: '₹0-3000', count: 0 },
  { range: '₹3000-4500', count: 0 },
  { range: '₹4500-9000', count: 0 },
  { range: '₹9000-18000', count: 0 },
  { range: '₹18000+', count: 0 }
];

type TipType = 'donations' | 'network' | null;

export default function Donations() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [activeTip, setActiveTip] = useState<TipType>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdjust, setShowAdjust] = useState(false);
  const [targetAmount, setTargetAmount] = useState(100000);
  
  const minAmount = 5000;
  const maxAmount = 120000;
  
  useEffect(() => {
    async function fetchDonations() {
      if (!user) return;
      
      try {
        const data = await getDonations(user.id);
        setDonations(data);
        
        // Update donation ranges
        data.forEach(donation => {
          if (donation.amount <= 3000) donationRanges[0].count++;
          else if (donation.amount <= 4500) donationRanges[1].count++;
          else if (donation.amount <= 9000) donationRanges[2].count++;
          else if (donation.amount <= 18000) donationRanges[3].count++;
          else donationRanges[4].count++;
        });
      } catch (err) {
        setError('Failed to load donations');
        console.error('Error loading donations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDonations();
  }, [user]);
  
  // Calculate total raised amount from actual donations
  const totalRaised = donations.reduce((sum, donation) => 
    donation.user_id === user?.id ? sum + donation.amount : sum, 0
  );
  const progress = Math.min((totalRaised / targetAmount) * 180, 180); // Max 180 degrees for semi-circle

  // Filter donations based on search
  const filteredDonations = donations.filter(donation => 
    donation.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (donation.message?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-red-500 px-4 py-2 rounded-full font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-500">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white">
        <Link to="/" className="p-2">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">DONATIONS</h1>
        <button 
          onClick={() => setShowAdjust(!showAdjust)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Settings2 size={20} className="text-white" />
        </button>
      </div>

      {/* Semi-circular Progress */}
      <div className="relative h-[300px] flex flex-col items-center justify-center text-white">
        <div className="relative w-[250px] h-[125px] overflow-hidden">
          {/* Amount labels */}
          <div className="absolute -top-8 left-0 text-base font-medium bg-white/10 px-2 py-1 rounded">₹0</div>
          <div className="absolute -top-8 right-0 text-base font-medium bg-white/10 px-2 py-1 rounded">
            ₹{targetAmount.toLocaleString('en-IN')}
          </div>
          
          <div className="absolute inset-0 border-[20px] border-indigo-700/30 rounded-t-full"></div>
          <div 
            className="absolute inset-0 border-[20px] border-white rounded-t-full origin-bottom transition-transform duration-1000"
            style={{ 
              transform: `rotate(${progress}deg)`,
              display: progress > 0 ? 'block' : 'none'
            }}
          ></div>
        </div>
        <div className="text-center mt-4">
          <h2 className="text-lg font-medium mb-1">Amount Raised</h2>
          <p className="text-4xl font-bold">₹{totalRaised.toLocaleString('en-IN')}</p>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 bg-white/10 rounded-lg p-2"
          >
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"
              alt="Down arrow"
              className={`w-6 h-6 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Target Amount Adjustment */}
      {showAdjust && (
        <div className="px-6 py-4 text-white">
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
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-sm mt-2">
              <span>₹{minAmount.toLocaleString('en-IN')}</span>
              <span>₹{targetAmount.toLocaleString('en-IN')}</span>
              <span>₹{maxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Donation Statistics */}
      {showDetails && (
        <div className="px-6 py-4 text-white">
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            <h3 className="text-lg font-semibold underline">Amount Range</h3>
            <h3 className="text-lg font-semibold text-right underline">Number of Donations</h3>
            {donationRanges.map((range, index) => (
              <React.Fragment key={index}>
                <span className="text-sm">{range.range}</span>
                <span className="text-sm text-right">{range.count}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tips Cards */}
      <div className="px-6 py-4 grid grid-cols-1 gap-4">
        <button 
          className="bg-white rounded-xl p-4 text-left relative"
          onClick={() => setActiveTip(activeTip === 'donations' ? null : 'donations')}
        >
          <div className="flex items-center gap-2">
            <h4 className="font-bold">HOW TO CRACK <span className="text-red-500">BIGGER DONATIONS</span></h4>
            <LightbulbIcon size={20} />
          </div>
          {activeTip === 'donations' && (
            <div className="mt-4 text-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-lg">Key Strategies:</h5>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTip(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">1.</span>
                  <p>Build compelling stories that emotionally connect with potential donors</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">2.</span>
                  <p>Create personalized outreach campaigns for high-net-worth individuals</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">3.</span>
                  <p>Demonstrate clear impact and transparency in fund utilization</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">4.</span>
                  <p>Leverage matching gift opportunities and corporate partnerships</p>
                </li>
              </ul>
            </div>
          )}
        </button>

        <button 
          className="bg-white rounded-xl p-4 text-left relative"
          onClick={() => setActiveTip(activeTip === 'network' ? null : 'network')}
        >
          <div className="flex items-center gap-2">
            <h4 className="font-bold">HOW TO <span className="text-red-500">OPTIMISE YOUR NETWORK</span></h4>
            <LightbulbIcon size={20} />
          </div>
          {activeTip === 'network' && (
            <div className="mt-4 text-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-semibold text-lg">Network Optimization Tips:</h5>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTip(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">1.</span>
                  <p>Identify and engage with key influencers in your network</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">2.</span>
                  <p>Use social media strategically to amplify your cause</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">3.</span>
                  <p>Host virtual or in-person networking events for potential donors</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[24px]">4.</span>
                  <p>Create a referral program to incentivize network growth</p>
                </li>
              </ul>
            </div>
          )}
        </button>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-t-[2.5rem] min-h-[400px] p-6 mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-900">ALL DONATIONS</h2>
          <input
            type="text"
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        {filteredDonations.length > 0 ? (
          <div className="space-y-4">
            {filteredDonations.map(donation => (
              <div key={donation.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <img 
                    src={donation.is_anonymous 
                      ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"
                      : `https://images.unsplash.com/photo-${donation.donor_id ? '1599566150163-29194dcaad36' : '1494790108377-be9c29b29330'}?w=50&h=50&fit=crop`
                    }
                    alt={donation.display_name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{donation.display_name}</h3>
                      <span className="text-indigo-600 font-bold">₹{donation.amount.toLocaleString('en-IN')}</span>
                    </div>
                    {donation.message && (
                      <p className="text-gray-600 text-sm mt-1">{donation.message}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(donation.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {donation.user_id !== user?.id && (
                      <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mt-2">
                        Donation you made
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nothing here</p>
            <p className="text-sm mt-2">No donations have been made yet</p>
          </div>
        )}
      </div>
    </div>
  );
}