import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getUserRank, getDonationStats, getTopDonors, getUserDonationHistory } from '../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Insights() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    biggestDonation: 0,
    totalDonors: 0,
    averageDonation: 0,
    currentAmount: 0,
    perInternAverage: 0
  });
  const [donationHistory, setDonationHistory] = useState<{ amount: number; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const [rankData, statsData, historyData] = await Promise.all([
          getUserRank(user.id),
          getDonationStats(),
          getUserDonationHistory(user.id)
        ]);

        if (rankData && statsData) {
          setStats({
            biggestDonation: rankData.total_amount,
            totalDonors: rankData.total_donors,
            averageDonation: rankData.avg_donation,
            currentAmount: rankData.total_amount,
            perInternAverage: statsData.avg_donation
          });
        }

        setDonationHistory(historyData);
      } catch (error) {
        console.error('Error fetching insights data:', error);
        setError('Failed to load insights data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const amountRaisedData = {
    labels: donationHistory.map(d => new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Amount Raised',
        data: donationHistory.map(d => d.amount),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4
      }
    ]
  };

  const donorsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Number of Donors',
        data: [4, 6, 8, 5],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8
      }
    ]
  };

  const biggestDonationData = {
    labels: ['₹5k-10k', '₹10k-15k', '₹15k-20k', '₹20k+'],
    datasets: [
      {
        data: [30, 40, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const averageDonationData = {
    labels: donationHistory.map(d => new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Average Donation',
        data: donationHistory.map(d => d.amount),
        fill: false,
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    cutout: '70%'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex items-center gap-4">
        <Link to="/" className="text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">INSIGHTS</h1>
      </div>

      {/* Top Performers */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">TOP PERFORMERS</h2>
        <div className="flex justify-between items-end h-[280px] mb-8 mt-120">
          {/* Second Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-red-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Aditri"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
            </div>
            <div className="w-20 h-32 bg-red-500 mt-4 rounded-t-lg"></div>
            <p className="mt-2 font-medium">Aditri</p>
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-yellow-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  alt="Anna"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                1
              </div>
            </div>
            <div className="w-24 h-40 bg-yellow-500 mt-4 rounded-t-lg"></div>
            <p className="mt-2 font-medium">Anna</p>
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                  alt="Aahana"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
            </div>
            <div className="w-20 h-28 bg-indigo-500 mt-4 rounded-t-lg"></div>
            <p className="mt-2 font-medium">Aahana</p>
          </div>
        </div>

        {/* Current User Stats */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-gray-500">Your current rank</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Biggest donation</p>
              <p className="font-bold text-red-500">₹{stats.biggestDonation.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-gray-600">Total donors</p>
              <p className="font-bold">{stats.totalDonors}</p>
            </div>
            <div>
              <p className="text-gray-600">Average donation</p>
              <p className="font-bold text-red-500">₹{Math.round(stats.averageDonation).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">AMOUNT RAISED</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Line data={amountRaisedData} options={chartOptions} className="h-[200px]" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-4">NUMBER OF DONORS</h3>
            <Bar data={donorsData} options={chartOptions} className="h-[150px]" />
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-bold text-orange-400 mb-4">BIGGEST DONATION</h3>
            <Doughnut data={biggestDonationData} options={doughnutOptions} className="h-[150px]" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-indigo-700 mb-4">AVERAGE DONATION</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Line data={averageDonationData} options={chartOptions} className="h-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}