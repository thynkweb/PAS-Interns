import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Crown } from 'lucide-react';

interface RewardTier {
  name: string;
  range: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ReactNode;
  benefits: string[];
}

const rewardTiers: RewardTier[] = [
  {
    name: 'STAR',
    range: '₹1,000 - ₹5,000',
    color: 'from-gray-700 to-gray-900',
    gradientFrom: '#2d3748',
    gradientTo: '#1a202c',
    icon: <Star className="w-6 h-6" />,
    benefits: [
      '20% Stipend',
      'Certificate of completion'
    ]
  },
  {
    name: 'NINJA',
    range: '₹5,000 - ₹15,000',
    color: 'from-red-600 to-red-900',
    gradientFrom: '#dc2626',
    gradientTo: '#7f1d1d',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 2L2 8.5L12 15L22 8.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 15.5L12 22L22 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    benefits: [
      '20% Stipend',
      'Certificate of completion',
      'LinkedIn recommendation from our President',
      'Certificate for Crowdfunding course'
    ]
  },
  {
    name: 'WIZARD',
    range: '₹15,000 - ₹30,000',
    color: 'from-purple-600 to-purple-900',
    gradientFrom: '#7c3aed',
    gradientTo: '#4c1d95',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 2L15 8L22 9L17 14L18 21L12 17.5L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    benefits: [
      '20% Stipend',
      'Certificate of completion',
      'LinkedIn recommendation from our President',
      'Certificate for Crowdfunding course',
      'Social Media Shoutout',
      'Internship Opportunity (As per intern\'s qualifications and vacancy)'
    ]
  },
  {
    name: 'LEGEND',
    range: '₹30,000+',
    color: 'from-orange-500 to-orange-800',
    gradientFrom: '#f97316',
    gradientTo: '#9a3412',
    icon: <Crown className="w-6 h-6" />,
    benefits: [
      '20% Stipend',
      'Certificate of completion',
      'LinkedIn recommendation from our President',
      'Certificate for Crowdfunding course',
      'Social Media Shoutout',
      'Internship Opportunity (As per intern\'s qualifications and vacancy)',
      'Letter of Recommendation from President of Muskurahat'
    ]
  }
];

export default function RewardsCarousel() {
  const [currentTier, setCurrentTier] = useState(0);

  const nextTier = () => {
    setCurrentTier((prev) => (prev + 1) % rewardTiers.length);
  };

  const prevTier = () => {
    setCurrentTier((prev) => (prev - 1 + rewardTiers.length) % rewardTiers.length);
  };

  const currentReward = rewardTiers[currentTier];

  return (
    <div 
      className={`rounded-3xl p-8 text-white relative overflow-hidden transition-all duration-500`}
      style={{
        background: `linear-gradient(135deg, ${currentReward.gradientFrom}, ${currentReward.gradientTo})`
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={prevTier}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold tracking-wider">REWARDS</h2>
          <button 
            onClick={nextTier}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              {currentReward.icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-wide">{currentReward.name}</h3>
              <p className="text-white/80 font-medium">{currentReward.range}</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentReward.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-2 h-2 bg-white rounded-full group-hover:scale-125 transition-transform"></div>
                <p className="text-sm font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2">
          {rewardTiers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTier(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentTier ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-16 translate-y-16"></div>
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl transform -translate-x-12 -translate-y-12"></div>
      </div>
    </div>
  );
}