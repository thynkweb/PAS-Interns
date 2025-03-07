import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';

interface ImpactCalculatorProps {
  currentAmount: number;
  targetAmount: number;
}

const ImpactCalculator: React.FC<ImpactCalculatorProps> = ({ currentAmount, targetAmount: initialTarget }) => {
  const [targetAmount, setTargetAmount] = useState(initialTarget);
  const [showAdjust, setShowAdjust] = useState(false);
  const progress = Math.min((currentAmount / targetAmount) * 180, 180); // Max 180 degrees for semi-circle
  const children = Math.floor((currentAmount / 35000) * 2);

  const minAmount = 5000;
  const maxAmount = 120000;

  return (
    <div className="bg-red-500 rounded-3xl p-6 text-white">
      <div className="text-center mb-4 relative">
        <button 
          onClick={() => setShowAdjust(!showAdjust)}
          className="absolute right-0 top-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <Settings2 size={20} />
        </button>
        <h2 className="text-2xl font-bold">IMPACT</h2>
        <h3 className="text-xl font-bold">CALCULATOR</h3>
        <p className="text-white/80 text-sm mt-2">See how your goals can create impact</p>
      </div>

      <div className="relative pt-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[250px] h-[125px] overflow-hidden">
            {/* Pencil and Needle Representation */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-20 bg-yellow-400 rounded-t-full"></div> {/* Pencil */}
              <div className="w-1 h-24 bg-gray-300 mt-2"></div> {/* Needle */}
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
        
        <p className="text-center text-sm mt-4">
          *Will help us fund the education of {children} children for an entire year.
        </p>
      </div>
    </div>
  );
};

export default ImpactCalculator;