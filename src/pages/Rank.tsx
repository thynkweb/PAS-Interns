import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFundraisingAmount, getDonations } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import needleImage1 from "../../public/assets/needle.svg";
import pencilImage2 from "../../public/assets/pencil_border.svg";
const RankDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentAmount, setCurrentAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedRank, setExpandedRank] = useState(null);
  const [targetAmount, setTargetAmount] = useState(null);
  // Define all ranks
  const allRanks = [
    {
      id: 0,
      title: " Emerging Advocate",
      level: "LEVEL 1 (0/5k)",
      range: "Rs. 0 - Rs. 5000",
      icon: "🏔️",
      minAmount: 0,
      maxAmount: 5000,
      heading: [
        "You’ve taken the first powerful step—turning compassion into action.",
        "You’ve helped someone eat today. That matters.",
        "You're just beginning your impact journey, but already you're making a meaningful difference in someone's life.",
      ],
      perks: ["20% Stipend", "Certificate of Internship", "Exclusive updates"],
      footer: "You’re not just learning. You’re already changing lives.",
    },
    {
      id: 1,
      title: " Impact Builder",
      level: "LEVEL 2 (5k/10k)",
      range: "Rs. 5000 - Rs. 10000",
      icon: "🌱",
      minAmount: 5000,
      maxAmount: 10000,
      heading: [
        "You’re building a bridge between hope and help.",
        "Every conversation, every share, every effort—it's rippling out.",
        "You’re now empowering entire families with food and dignity, while growing into a voice for change.",
      ],
      perks: [
        "20% Stipend",
        "Certificate of Internship",
        "LinkedIn Recommendation from Your Manager",
        "Crowdfunding Course Certificate",
      ],
      footer: "You’ve built trust. You’re inspiring others to care too.",
    },
    {
      id: 2,
      title: "Social Change Leader",
      level: "LEVEL 3 (10k/25k)",
      range: "Rs. 20000 - Rs. 50000",
      icon: "🌳",
      minAmount: 10000,
      maxAmount: 25000,
      heading: [
        "You’ve moved from contribution to leadership.",
        "You're not just part of the movement—you’re guiding it forward.",
        "Families are thriving because of you. Your voice has become a beacon of empathy and action.",
      ],
      perks: [
        "20% Stipend",
        "Certificate of Internship",
        "LinkedIn Recommendation from Your Manager",
        "Crowdfunding Course Certificate",
        "Social Media Shoutout",
        "Public Relations Course Certificate",
        "Opportunity to Work On Ground (if available)",
      ],
      footer: "You’re leading with heart and showing others how to follow.",
    },
    {
      id: 3,
      title: "Visionary",
      level: "LEVEL 4 (25k+)",
      range: "Rs. 50000+",
      icon: "🏆",
      minAmount: 25000,
      maxAmount: Infinity,
      heading: [
        "You’ve become a light for change—and a force for the future.",
        "You’ve transformed communities, uplifted voices, and led with purpose.",
        "Your journey has been one of generosity, storytelling, and belief in a better tomorrow.",
      ],
      perks: [
        "20% Stipend",
        "Certificate of Internship",
        "LinkedIn Recommendation from Your Manager",
        "Crowdfunding Course Certificate",
        "Social Media Shoutout",
        "Public Relations Course Certificate",
        "Opportunity to Work On Ground (if available)",
        "Personalized Recommendation Letter from the Founder (for jobs or higher education)",
      ],
      footer: "You’re not just interning. You’re inspiring a movement.",
    },
  ];

  // Get current rank based on amount
  const getCurrentRank = (amount: any) => {
    for (let i = allRanks.length - 1; i >= 0; i--) {
      if (amount >= allRanks[i].minAmount) {
        const rank = { ...allRanks[i] };
        rank.current = true;
        rank.amount = amount;
        if (i < allRanks.length - 1 && amount < allRanks[i].maxAmount) {
          rank.nextMilestone = allRanks[i].maxAmount;
        } else if (i === allRanks.length - 1) {
          rank.nextMilestone = rank.maxAmount;
        }
        return rank;
      }
    }
    return allRanks[0];
  };

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          setLoading(true);

          // Try to get amount from location state first (passed from dashboard)
          if (location.state && location.state.currentAmount) {
            setCurrentAmount(location.state.currentAmount);
          } else {
            // Otherwise fetch it
            const [fundData, donations] = await Promise.all([
              getFundraisingAmount(user.id),
              getDonations(user.id),
            ]);

            // Calculate total amount from user's donations
            const totalAmount = donations
              .filter((d) => d.user_id === user.id)
              .reduce((sum, d) => sum + d.amount, 0);

            setCurrentAmount(totalAmount); // Use 25000 as shown in the image
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          // Use 25000 as fallback to match the image
          setCurrentAmount(0);
        } finally {
          setLoading(false);
        }
      } else {
        // Use 25000 as fallback to match the image
        setCurrentAmount(0);
        setLoading(false);
      }
    }

    fetchData();
  }, [user, location]);
  const currentRank = getCurrentRank(currentAmount);
  const displayMinAmount = 0;
  const displayMaxAmount = 150000;
  const progressPercentage = Math.min(
    100,
    (currentAmount / displayMaxAmount) * 100
  );

  const toggleRank = (id: any) => {
    setExpandedRank(expandedRank === id ? null : id);
  };
  console.log("current", allRanks);

  // Current rank based on amount

  // Update rank completion status
  const ranksWithStatus = allRanks.map((rank) => ({
    ...rank,
    completed: currentAmount >= rank.maxAmount,
    current: rank.id === currentRank.id,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#69b0ee] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  let amountOutOf = 30000;
  // Dynamically increase amountOutOf if currentAmount exceeds it
  while (currentAmount > amountOutOf) {
    amountOutOf *= 2;
  }

  const progress = Math.min((currentAmount / amountOutOf) * 180, 180);
  const Needle = ({ rotation }) => (
    <div
      className="absolute inset-0 origin-bottom transition-transform duration-1000"
      style={{
        transform: `rotate(${rotation}deg)`,
        display: rotation ? "block" : "none",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        width: "100%",
        height: "90%",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 18 145"
        preserveAspectRatio="xMidYMin meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_54_5075)">
          <path
            d="M8.99847 0L2.47192 135.397H15.525L8.99847 0Z"
            fill="#EE6969"
          />
          <path
            d="M8.99849 144.997C13.9682 144.997 17.997 140.699 17.997 135.397C17.997 130.096 13.9682 125.798 8.99849 125.798C4.02876 125.798 0 130.096 0 135.397C0 140.699 4.02876 144.997 8.99849 144.997Z"
            fill="#FFD166"
          />
        </g>
        <defs>
          <clipPath id="clip0_54_5075">
            <rect width="18" height="145" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
  return (
    <div className="bg-[#69b0ee] min-h-screen pb-10">
      {/* Header */}
      <div className="p-6 text-white">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1 mr-8">
            Your Rank
          </h1>
        </div>
        <div className="relative pt-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[250px] h-[125px] overflow-hidden">
              {/* Amount labels */}
              <div className="absolute -top-8 left-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">
                ₹0
              </div>
              <div className="absolute -top-8 right-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">
                ₹{currentAmount.toLocaleString("en-IN")}
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
                  display: progress > 0 ? "block" : "none",
                  width: "100%",
                  height: "90%",
                }}
              >
                <Needle rotation={progress - 90} />
              </div>

              {/* Needle/Pointer */}
              {/* <div 
                className="absolute top-0 left-1/2 w-2 h-[125px] bg-[#F87171] origin-bottom transition-transform duration-1000"
                style={{ transform: `translateX(-50%) rotate(${progress}deg)` }}
              >
                <div className="absolute -top-2 -left-1 w-4 h-4 bg-yellow-300 rounded-full"></div>
              </div> */}
            </div>
            <div className="flex justify-between items-center gap-36">
              <div className="text-sm text-white ">₹0</div>
              <div className="text-sm text-white ">₹{amountOutOf}</div>
            </div>
            {/* <div className="text-center mt-4">
              <p className="text-xl text-white font-bold">
                ₹{currentAmount.toLocaleString("en-IN")}
              </p>
            </div> */}
          </div>
        </div>

        {/* Current Rank */}
        <h2 className="text-center text-3xl font-bold mt-6">
          {currentRank.title}
        </h2>
        <p className="text-center text-white/80 mt-2">
          You've raised ₹{currentAmount.toLocaleString("en-IN")} of your journey
        </p>
      </div>

      {/* Rewards Section */}
      <div className="bg-white rounded-3xl mt-4 mx-4 p-6 flex-1">
        <div className="flex justify-center items-center">
          <h3 className="text-2xl font-bold text-[#4a6fa5] mb-4">Rewards</h3>
        </div>
        <div className="space-y-4">
          {allRanks.map((rank) => (
            <div
              key={rank.id}
              className={`rounded-2xl p-4 transition-all duration-300 ${
                rank.current
                  ? "bg-[#fed166] text-[#4a6fa5]"
                  : "bg-[#69b0ee] text-white"
              }`}
            >
              <div
                className="flex items-center justify-between"
                onClick={() => toggleRank(rank.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                    <span className="text-lg">{rank.icon}</span>
                  </div>
                  <div>
                    <h4
                      className={`font-bold ${
                        rank.current ? "text-[#69b0ee]" : "text-white"
                      }`}
                    >
                      {rank.title}
                    </h4>
                    <p
                      className={`text-sm ${
                        rank.current ? "text-[#69b0ee]" : "text-white"
                      }`}
                    >
                      {rank.level} ({rank.range})
                    </p>
                  </div>
                </div>
                {expandedRank === rank.id ? (
                  <ChevronUp size={24} className="text-blue-600" />
                ) : (
                  <ChevronDown size={24} className="text-blue-300" />
                )}
              </div>
              {expandedRank === rank.id && (
                <div>
                  <ul className="mt-3 text-white text-sm list-disc pl-6">
                    {rank.heading.map((perk, index) => (
                      <li key={index}>{perk}</li>
                    ))}
                  </ul>
                  <h3 className="mt-5 px-4 text-xl font-bold">Perks</h3>
                  <ul className="mt-3 text-white text-sm list-disc pl-6">
                    {rank.perks.map((perk, index) => (
                      <li key={index}>{perk}</li>
                    ))}
                  </ul>
                  <h3 className="mt-5 px-4 text-lg font-bold italic">
                    {rank.footer}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankDetailPage;
