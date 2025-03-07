import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface Strategy {
  title: string;
  description: string;
  sections: {
    strategy: string;
    why: string;
    tip: string;
  }[];
}

const hackStrategies: Record<string, Strategy> = {
  'capturing-attention': {
    title: 'CAPTURING ATTENTION',
    description: 'Getting people\'s attention for your cause is a vital step in successful fundraising. To make a meaningful impact, you need to engage and inspire individuals to support your mission. Here are effective strategies to help you capture and hold people\'s attention for your cause.',
    sections: [
      {
        strategy: 'Craft an effective pitch by making your initial message a compelling introduction to your cause. Share an attention-grabbing statistic or a powerful story to capture their interest.',
        why: "An engaging initial message is more likely to capture the recipient's interest and can lead to better engagement, as it showcases the importance of your cause right from the start.",
        tip: 'A well-crafted initial message can significantly improve engagement on personal chat.'
      },
      {
        strategy: 'Follow up promptly when someone expresses interest but says they\'ll "look into it later". Suggest a specific date or time for your next message to maintain their engagement.',
        why: 'Prompt follow-ups show that you\'re serious about your cause and care about their interest; making it more likely they will engage.',
        tip: 'Timely follow-ups can increase the likelihood of a response and keep the conversation going.'
      },
      {
        strategy: 'Address common concerns by preparing responses for typical excuses or objections potential donors might have. These prepared answers will help you navigate objections and keep the conversation flowing.',
        why: 'Prepared responses demonstrate professionalism and indicate that you\'ve considered and are ready to address their concerns, increasing your credibility.',
        tip: 'Handling objections with prepared responses can boost your confidence and maintain the conversation\'s momentum.'
      }
    ]
  },
  'building-connections': {
    title: 'STAYING MOTIVATED',
    description: 'Working as an intern in our fundraising department is a journey filled with both rewarding moments and challenges. At times, you may face rejection or feel stuck, but it\'s essential to maintain your motivation and continue your growth. Here are strategies to help you stay motivated when facing hurdles.',
    sections: [
      {
        strategy: 'Accept rejection as part of the process and a catalyst for your personal growth.',
        why: 'The more rejections you encounter, the faster you\'ll evolve, expand your comfort zone, and develop crucial skills.',
        tip: 'Use rejections as stepping stones to success and keep pushing forward.'
      },
      {
        strategy: 'Remember that you may receive many \'no\' responses, but all it takes is that one \'yes\'. For newcomers, follow-ups might feel intrusive.',
        why: 'The one \'yes\' can make all the difference and change the trajectory of your efforts.',
        tip: 'Keep your focus on the positive outcome you\'re working towards.'
      },
      {
        strategy: 'When you feel stuck, see it as an opportunity to challenge yourself and move to the next level.',
        why: 'Overcoming these moments of stagnation is how you develop essential people skills and resilience.',
        tip: 'Seek guidance and reflect on the lessons learned during these challenging times.'
      }
    ]
  }
};

export default function CrowdfundingHacks() {
  const { type } = useParams<{ type: string }>();
  const [currentSection, setCurrentSection] = useState(0);
  
  if (!type || !hackStrategies[type]) {
    return null;
  }

  const strategy = hackStrategies[type];
  const totalSections = strategy.sections.length;

  const goToNextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-orange-400 to-red-500 text-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-white">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">CROWDFUNDING</h1>
            <p className="text-lg font-medium">HACKS FOR YOU</p>
          </div>
        </div>

        <div className="bg-orange-300 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">{strategy.title}</h2>
          <p className="text-sm opacity-90">{strategy.description}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <h3 className="text-red-500 font-bold mb-2">Strategy -</h3>
              <p className="text-gray-800">{strategy.sections[currentSection].strategy}</p>
            </div>
            <div>
              <h3 className="text-red-500 font-bold mb-2">Why -</h3>
              <p className="text-gray-800">{strategy.sections[currentSection].why}</p>
            </div>
            <div>
              <h3 className="text-red-500 font-bold mb-2">Tip -</h3>
              <p className="text-gray-800">{strategy.sections[currentSection].tip}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goToPrevSection}
            className={`px-6 py-2 rounded-full font-medium ${
              currentSection === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            disabled={currentSection === 0}
          >
            BACK
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSections }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSection ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNextSection}
            className={`px-6 py-2 rounded-full font-medium ${
              currentSection === totalSections - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            disabled={currentSection === totalSections - 1}
          >
            NEXT HACK
          </button>
        </div>
      </div>
    </div>
  );
}