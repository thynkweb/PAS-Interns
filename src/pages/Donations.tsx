import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronRight, Settings2, Award, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDonations, getBatchStats, getWeeklyStats, Donation, BatchStats, WeeklyStats, TopDonor, getTopDonors } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import needleImage from '../../public/assets/needle.svg'
import pencilImage from '../../public/assets/pencil.png'
import pencilImage2 from '../../public/assets/pencil_border.svg'
export default function Donations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [batchStats, setBatchStats] = useState<BatchStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState(30000);
  const [activeTab, setActiveTab] = useState('donors'); // 'donors' or 'donations'
  const [showAdjust, setShowAdjust] = useState(false);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);

  
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch user's donations
        const userDonations = await getDonations(user.id);
        setDonations(userDonations);
        
        // Fetch batch statistics (last 30 days)
        const stats = await getBatchStats();
        setBatchStats(stats);
        
        // Fetch weekly statistics based on user's creation date
        const weekly = await getWeeklyStats(user.id);
        setWeeklyStats(weekly);
      } catch (err) {
        setError('Failed to load donations data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Calculate user-specific stats
  const userDonations = donations.filter(d => d.user_id === user?.id);
  const totalDonation = userDonations.reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate user's unique donors
  const userDonorIds = new Set(userDonations.map(d => d.id));
  const numberOfDonors = userDonorIds.size;
  
  // Calculate user's average donation
  const averageDonation = numberOfDonors > 0 ? totalDonation / numberOfDonors : 0;
  
  // Calculate progress percentage for gauge
  const donationProgress = Math.min(totalDonation / targetAmount, 1);
  const currentAmount = totalDonation;
  const progress = Math.min((currentAmount / 150000) * 180, 180);
  
  const minAmount = 0;
  const maxAmount = 150000;
  
  // Get user's donors (people who donated to the current user)
  const userDonors = userDonations.map(d => ({
    id: d.donor_id,
    name: d.display_name,
    role: 'Social Change Leader',
    amount: d.amount
  }));
  
  // Get top donors from batch stats
  // const topDonors = batchStats?.topDonors || [];
  // console.log("top donors",topDonors);
  useEffect(() => {
    async function fetchTopDonors() {
      try {
        setLoading(true);
        const donors = await getTopDonors();
        setTopDonors(donors);
      } catch (err) {
        console.error('Failed to fetch top donors:', err);
        setError('Unable to load leaderboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchTopDonors();
  }, []);
  console.log("top donors",topDonors);
  // Get weekly data from weekly stats
  const weeklyDonations = weeklyStats?.weeklyDonations || [
    { week: 'Week 1', value: 0 },
    { week: 'Week 2', value: 0 },
    { week: 'Week 3', value: 0 },
    { week: 'Week 4', value: 0 },
  ];
  
  const weeklyDonors = weeklyStats?.weeklyDonors || [
    { week: 'Week 1', value: 0 },
    { week: 'Week 2', value: 0 },
    { week: 'Week 3', value: 0 },
    { week: 'Week 4', value: 0 },
  ];
  
  // Calculate max values for charts for proper scaling
  let maxDonationValue = Math.max(...weeklyDonations.map(item => item.value), 1); // Use 1 as minimum to avoid division by zero
  let maxDonorValue = Math.max(...weeklyDonors.map(item => item.value), 1); // Use 1 as minimum to avoid division by zero

  if (loading) {
    return (
      <div className="min-h-screen bg-[#69b0ee] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#69b0ee] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-blue-400 px-4 py-2 rounded-full font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
   maxDonorValue = Math.max(...weeklyDonors.map(d => d.value), 1);
   maxDonationValue = Math.max(...weeklyDonations.map(d => d.value), 1);
  return (
    <div className="min-h-screen bg-[#69b0ee]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white">
        <Link to="/" className="p-2">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">DONATIONS</h1>
        <div className="w-10 h-10"></div>
      </div>

      {/* Your Donation Card */}
      <div className="mx-4 rounded-2xl overflow-hidden">
        <div className="p-3 bg-[#fed166] text-center !shadow-lg relative z-50">
          <h2 className="text-2xl font-bold text-[#6f5822]">YOUR DONATION</h2>
        </div>
        
        <div className="relative bg-[#d8edff] pt-8 flex items-center justify-center">
          <div className="flex flex-col bg-white w-min items-center justify-center p-4 rounded-3xl border-0 !shadow-2xl border-[#4a6fa5]">
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
                  backgroundImage: `url(${pencilImage2})`,
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
                  backgroundImage:`url(${needleImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "80%",
                }}
              ></div>
            </div>
            <div className="text-center mt-4">
              <p className="text-2xl text-[#4a6fa5] font-bold">₹{currentAmount.toLocaleString('en-IN')}</p>
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
                  className="w-full h-2 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>₹{minAmount.toLocaleString('en-IN')}</span>
                  <span>₹{targetAmount.toLocaleString('en-IN')}</span>
                  <span>₹{maxAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Your Donors Horizontal Scroll */}
        <div className="px-3 pb-3 bg-[#d8edff] rounded-b-2xl p-3">
          <div className='flex justify-center items-center'>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Your Donors</h3>
          </div>
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {userDonors.length > 0 ? (
              userDonors.map((donor, index) => (
                <div 
                  key={donor.id} 
                  className={`flex-shrink-0 w-auto border-0 border-[#4a6fa5] rounded-2xl p-2 ${
                    index % 2 === 0 ? "bg-[#69b0ee]" : "bg-[#92c5ef]"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <img 
                      src={`https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop`}
                      alt={donor.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-white">{donor.name}</p>
                      <p className="text-white">{donor.role}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center w-full text-gray-500 text-sm py-4">
                No donors yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights Card */}
      <div className="mx-4 mt-4 bg-[#fed166] rounded-t-2xl overflow-hidden">
        <div className="p-3 text-center !shadow-lg relative z-50">
          <h2 className="text-2xl font-bold text-[#6f5822]">INSIGHTS</h2>
          <div className="text-sm mt-1 text-[#6f5822]/80">Last 30 Days</div>
        </div>
        
        {/* Leaderboard */}
        <div className="bg-[#d8edff] px-3 pb-3 p-3">
          <h3 className="text-base font-semibold text-[#4a6fa5] mb-3">Leaderboard</h3>
          <div className="space-y-2">
            {topDonors.map((donor, index) => (
              <div 
                key={donor.id} 
                className={`flex items-center !text-white justify-between p-2 rounded-2xl ${
                  index === 0 ? 'bg-[#69b0ee] text-white' : 
                  index === 1 ? 'bg-[#92c5ef] text-white' : 
                  index === 2 ? 'bg-[#69b0ee] text-white':
                  index === 3 ? 'bg-[#92c5ef] text-white' : 
                  index === 4 ? 'bg-[#69b0ee]' : 'text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white text-gray-800 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <img 
                    src={`https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop`}
                    alt={donor.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-xs">
                    <p className="font-semibold">{donor.name}</p>
                    <p className={`${index < 5 ? 'text-white/80' : 'text-gray-500'}`}>{donor.role}</p>
                  </div>
                </div>
                <div className="text-xs font-bold">{donor.amount.toLocaleString()}+ Points</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Donation Stats */}
      <div className="mx-4 bg-[#D7ECFF] rounded-b-2xl p-4">
        <h3 className="text-base font-semibold text-[#4a6fa5] mb-3">Total Donation</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">You</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl ">{totalDonation.toLocaleString()}₹</p>
          </div>
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">Batch Average</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl">
              {batchStats ? batchStats.totalAmount.toLocaleString() : '0'}₹
            </p>
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-[#4a6fa5] mb-3">Number Of Donors</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">You</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl">{numberOfDonors}</p>
          </div>
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">Batch Average</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl">
              {batchStats ? batchStats.totalDonors : '0'}
            </p>
          </div>
        </div>
        
        <h3 className="text-base font-semibold text-[#4a6fa5] mb-3">Average Donation</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">You</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl">{averageDonation.toLocaleString()}₹</p>
          </div>
          <div className="bg-[#69b0ee] rounded-2xl p-3">
            <p className="text-lg font-bold text-[#4a6fa5] mb-0">Batch Average</p>
            <p className="text-2xl font-bold text-[#ee6969] p-1 bg-white rounded-xl !shadow-inner-xl relative z-100">
              {batchStats ? batchStats.averageDonation.toLocaleString() : '0'}₹
            </p>
          </div>
        </div>
      </div>
      
      {/* Weekly Charts */}
      <div className="mx-4 mt-4">
    <div className="bg-[#fed166] rounded-xl overflow-hidden">
      <div className="p-3 text-center">
        <h2 className="text-lg font-bold text-gray-800">NUMBER OF DONORS</h2>
        <div className="text-sm mt-1 text-gray-700">First 4 weeks since you joined</div>
      </div>

      <div className="bg-white mx-3 mb-3 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyDonors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#007bff" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>

  <div className="mx-4 mt-4 mb-8 pb-4">
    <div className="bg-[#fed166] rounded-xl overflow-hidden">
      <div className="p-3 text-center">
        <h2 className="text-lg font-bold text-gray-800">DONATIONS</h2>
        <div className="text-sm mt-1 text-gray-700">First 4 weeks since you joined</div>
      </div>

      <div className="bg-white mx-3 mb-3 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyDonations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#28a745" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
    </div>
  );
}