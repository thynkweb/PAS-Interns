import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import LoginButton from '../components/LoginButton';
import { ArrowLeft } from 'lucide-react';

type OnboardingStep = 'splash' | 'intro' | 'login' | 'loading' | 'name' | 'whatsapp' | 'avatar';

const avatars = [
  { id: 1, url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
  { id: 2, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 3, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 4, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
  { id: 5, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 6, url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
  { id: 7, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 8, url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop' },
  { id: 9, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }
];

export default function Login() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('splash');
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    avatar: ''
  });

  React.useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('intro');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleNext = () => {
    switch (step) {
      case 'name':
        if (formData.name) setStep('whatsapp');
        break;
      case 'whatsapp':
        if (formData.whatsapp) setStep('avatar');
        break;
      case 'avatar':
        if (formData.avatar) {
          // Handle form submission
          console.log('Form data:', formData);
        }
        break;
    }
  };

  const renderStep = () => {
    const containerClass = "min-h-screen max-w-[700px] mx-auto bg-white";
    
    switch (step) {
      case 'splash':
        return (
          <div className={`${containerClass} flex flex-col items-center justify-center`} style={{backgroundImage:"url('src/assets/splashBG.svg')"}}>
            <div className="w-96 h-auto mb-12">
              <img 
                src="src/assets/pledgeLogo.webp"
                alt="Logo"
                className="w-full h-full "
              />
            </div>
            {/* <h1 className="text-2xl font-bold text-gray-800">PLEDGE A SMILE</h1>
            <p className="text-gray-600">FOUNDATION</p> */}
          </div>
          
        );
      case 'intro':
        return (
          <div className={`${containerClass} flex flex-col items-center justify-center p-6`} style={{backgroundImage:"url('src/assets/splashBG.svg')"}}>
            <img 
              src="src/assets/teaching.svg"
              alt="Onboarding"
              className="w-96 h-auto object-cover rounded-2xl mb-8"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Be a change-maker!</h1>
            <p className="text-gray-600 text-center mb-8 max-w-md text-xl">
              Gain real-world experience while creating meaningful change. Join our internship program and be part of something bigger.
            </p>
            <button
              onClick={() => setStep('login')}
              className="w-full max-w-md bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition-colors text-xl"
            >
              Get Started
            </button>
          </div>
        );

      case 'login':
        return (
          <div className={`${containerClass} flex flex-col items-center justify-center p-6`} style={{backgroundImage:"url('src/assets/splashBG.svg')"}}>
            <div className="w-96 h-auto mb-12">
              <img 
                src="src/assets/pledgeLogo.webp"
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="w-full max-w-md text-xl">
            <LoginButton onSuccess={() => {
              setStep('loading');
              setTimeout(() => setStep('name'), 2000); // Show loading for 2 seconds
            }} />
            </div>
          </div>
        );
      case 'loading':
        return (
          <div className={`${containerClass} flex flex-col items-center justify-center p-6`} style={{backgroundImage:"url('src/assets/splashBG.svg')"}}>
            <div className="w-96 h-auto mb-12">
              <img 
                src="src/assets/pledgeLogo.webp"
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please wait..
                  </label>
                </div>
              </div>
          </div>
        );
      case 'name':
        return (
          <div className={`${containerClass} flex flex-col p-6`} style={{backgroundImage:"url('src/assets/splashBG.svg')"}}>
            <button 
              onClick={() => setStep('login')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              <h1 className="text-3xl font-bold text-red-500 mb-2">WELCOME</h1>
              <p className="text-gray-600 mb-8">Let's get to know you better!</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!formData.name}
                  className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className={`${containerClass} flex flex-col p-6`}>
            <button 
              onClick={() => setStep('name')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              <h1 className="text-3xl font-bold text-red-500 mb-2">WELCOME</h1>
              <p className="text-gray-600 mb-8">Stay connected with us!</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's your WhatsApp number?
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your WhatsApp number"
                  />
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!formData.whatsapp}
                  className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className={`${containerClass} flex flex-col p-6`}>
            <button 
              onClick={() => setStep('whatsapp')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              <h1 className="text-xl font-bold mb-2">Select an <span className="text-red-500">AVATAR</span> that</h1>
              <p className="text-gray-600 mb-8">best describes you</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setFormData({ ...formData, avatar: avatar.url })}
                    className={`relative rounded-xl overflow-hidden aspect-square ${
                      formData.avatar === avatar.url ? 'ring-4 ring-red-500' : ''
                    }`}
                  >
                    <img 
                      src={avatar.url}
                      alt={`Avatar ${avatar.id}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNext}
                disabled={!formData.avatar}
                className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        );
    }
  };

  return renderStep();
}