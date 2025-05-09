import React, { useState, useEffect } from "react";
import { Copy, Share2, ArrowRight, LogOut, Settings2, X } from "lucide-react";
import { redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  getFundraisingAmount,
  FundraisingAmount,
  getUserData,
  UserData,
  getDonationStats,
  getDonations,
  getChildren,
  Child,
} from "../lib/api";
import LoginButton from "../components/LoginButton";
import needleImage1 from "../../public/assets/needle.svg";
import pencilImage2 from "../../public/assets/pencil_border.svg";
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fundraisingData, setFundraisingData] =
    useState<FundraisingAmount | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [targetAmount, setTargetAmount] = useState(30000);
  const [showModal, setShowModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        try {
          console.log("user ID", user);
          if (user.whatsapp_number == null) {
          }
          const [fundData, uData, stats, donations, childrenData] =
            await Promise.all([
              getFundraisingAmount(user.id),
              getUserData(user.id),
              getDonationStats(),
              getDonations(user.id),
              getChildren(),
            ]);

          // Calculate total amount from user's donations
          const totalAmount = donations
            .filter((d) => d.user_id === user.id)
            .reduce((sum, d) => sum + d.amount, 0);

          setFundraisingData({
            id: fundData?.id || "",
            user_id: user.id,
            current_amount: totalAmount,
            target_amount: fundData?.target_amount || 35000,
            created_at: fundData?.created_at || new Date().toISOString(),
            updated_at: fundData?.updated_at || new Date().toISOString(),
          });

          setUserData(uData);
          setDonationStats(stats);
          setChildren(childrenData);
          console.log("childrens", childrenData);

          console.log("user data", userData);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [user]);

  const donateUrl = `https://dev.pledgeasmile.com/donate?r=${
    userData?.referral_code || "Invalid_code"
  }`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(donateUrl);
    alert("Donation link copied to clipboard!");
  };

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(
      `Support our cause! Donate here: ${donateUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a6fa5]"></div>
      </div>
    );
  }

  // Calculate user rank based on fundraising amount
  let currentAmount = 0;
  const getRankDetails = (status: number) => {
    switch (status) {
      case 0:
        return { title: "Emerging Advocate", level: "LEVEL 1 (1k/5k)" };
      case 1:
        return { title: "Impact Builder", level: "LEVEL 2 (5k/10k)" };
      case 2:
        return { title: "Social Change Leader", level: "LEVEL 3 (10k/25k)" };
      case 3:
        return { title: "Visionary", level: "LEVEL 4 (25k+)" };
      default:
        return { title: "Beginner", level: "LEVEL 0" };
    }
  };
  // Assuming `userStatus` comes from an API response or state

  // Calculate number of children supported
  const childrenSupported = Math.max(
    1,
    Math.floor((currentAmount / 35000) * 2)
  );
  console.log("user data2", userData);
  // currentAmount = userData?.donations;
  const displayName =
    userData?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  let amountOutOf = 30000;
  currentAmount = userData?.donations || 0;

  // Dynamically increase amountOutOf if currentAmount exceeds it
  while (currentAmount > amountOutOf) {
    amountOutOf *= 2;
  }

  const progress = Math.min((currentAmount / amountOutOf) * 180, 180);
  const { title: rankTitle, level: rankLevel } = getRankDetails(
    userData?.social_status ?? 0
  );
  console.log("Rank Title:", rankTitle);
  console.log("Rank Level:", rankLevel);
  const getAdjustedDaysLeft = (days: number) => {
    const nextMultipleOf10 = Math.ceil((days + 1) / 10) * 10;
    return nextMultipleOf10 - days;
  };

  const getAddedDays = (days: number) => {
    return Math.floor((days - 30) / 10 + 1) * 10;
  };
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
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="bg-red-400 rounded-3xl p-6 text-white mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full px-3 py-2 text-gray-700 text-sm font-medium">
              Days left{" "}
              {typeof userData?.days_left === "number" ? (
                <span className="text-[#4a6fa5] font-bold ml-1">
                  {getAdjustedDaysLeft(userData.days_left)}
                  {userData.days_left > 30 && (
                    <span className="text-xs text-gray-500 ml-1 align-top">
                      +{getAddedDays(userData.days_left)}
                    </span>
                  )}
                </span>
              ) : (
                "Invalid"
              )}
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
                    src={
                      user?.user_metadata?.avatar_url ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop"
                    }
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
            <span className="text-[#F87171]">YOUR</span>{" "}
            <span className="text-[#4a6fa5]">IMPACT</span>
          </h2>
          <p className="text-gray-500 text-sm">
            See how your goals can create impact
          </p>
        </div>

        <div className="relative pt-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[250px] h-[125px] overflow-hidden">
              {/* Amount labels */}
              <div className="absolute -top-8 left-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">
                ₹0
              </div>
              <div className="absolute -top-8 right-0 text-base font-medium bg-gray-100 px-2 py-1 rounded">
                ₹{targetAmount.toLocaleString("en-IN")}
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

              {/* <div
                className="absolute inset-0 origin-bottom transition-transform duration-1000"
                style={{
                  transform: `rotate(${progress - 90}deg)`, // Rotate left by 90 degrees
                  display: progress > 0 ? "block" : "none",
                  backgroundImage: `url(${needleImage1})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "90%",
                }}
              ></div> */}

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
              <div className="text-sm text-[#969696] ">₹0</div>
              <div className="text-sm text-[#969696] ">₹{amountOutOf}</div>
            </div>
            <div className="text-center mt-4">
              {/* <h2 className="text-lg font-medium mb-1">Amount Raised</h2> */}
              <p className="text-xl text-[#4a6fa5] font-bold">
                ₹{currentAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Rank Card */}
        {/* Rank Card */}
        <div
          className="bg-red-100 rounded-xl p-4 mb-6 mt-4"
          onClick={() =>
            navigate("/rank-details", { state: { currentAmount } })
          }
          style={{ cursor: "pointer" }}
        >
          <p className="text-gray-600 text-sm mb-1">Your Rank</p>
          <h3 className="text-xl font-bold text-red-800">{rankTitle}</h3>
          <p className="text-[#F87171] text-sm">{rankLevel}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={copyReferralLink}
            className="flex items-center justify-center gap-2 bg-indigo-100 text-indigo-600 py-2 px-3 md:py-3 md:px-4 rounded-xl hover:bg-indigo-200 transition-colors text-sm md:text-base"
          >
            <span className="font-medium">Copy Link</span>
            <Copy size={16} />
          </button>

          <button
            onClick={shareOnWhatsapp}
            className="flex items-center justify-center gap-2 bg-green-100 text-green-600 py-2 px-3 md:py-3 md:px-4 rounded-xl hover:bg-green-200 transition-colors text-sm md:text-base"
          >
            <span className="font-medium">WhatsApp</span>
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Who We Are Working For */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            <span className="text-[#F87171]">WHO WE ARE</span>{" "}
            <span className="text-[#4a6fa5]">WORKING FOR</span>
          </h2>
          <button
            onClick={() => navigate("/children")}
            className="text-[#4a6fa5] flex items-center gap-1 text-sm font-medium"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {children.slice(0, 4).map((child) => (
            <div
              key={child.id}
              onClick={() => {
                setSelectedChild(child); // Set the selected child
                setShowModal(true); // Open the modal
              }}
              className="bg-amber-100  overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow border-4 border-[#ffd166] rounded-2xl p-1"
            >
              <div className="relative">
                <img
                  src={child.image_url}
                  alt={child.name}
                  className="w-full h-32 object-cover border-0 rounded-xl"
                />
                {child.priority === "High" && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-[0.6rem] leading-[0.8rem] px-2 py-1 rounded-full">
                    High Priority
                  </div>
                )}
              </div>
              <div className="py-1 px-1">
                <h3 className="text-lg font-bold text-[#4a6fa5]">
                  {child.name}
                </h3>
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
                  <button className="bg-[#F87171] text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full">
                    Assignment
                  </button>
                  {/* <button className="bg-indigo-500 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full">
                  See More
                </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && selectedChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            {/* Close Button (X) */}
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedChild(null); // Reset selected child
              }}
              className="absolute top-2 right-2"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="flex items-center gap-4">
              <img
                src={selectedChild.image_url}
                alt={selectedChild.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-[#4a6fa5]">
                  {selectedChild.name}
                </h2>
                <p className="text-gray-500">{selectedChild.age} years</p>
                <p className="text-gray-500">
                  <span className="mr-1">📍</span>
                  {selectedChild.location}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Description
              </h3>
              <div className="mt-1 max-h-60 overflow-y-auto text-sm text-gray-600">
                {selectedChild.description}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedChild(null); // Reset selected child
              }}
              className="mt-6 w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Crowdfunding Hacks */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-[#4a6fa5]">
            CROWDFUNDING HACKS
          </h3>
          <span className="text-xl">💡</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate("/hacks/capturing-attention")}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-[#F87171]">💡</span>
              </div>
              <h4 className="font-semibold">CAPTURING ATTENTION</h4>
            </div>
            <p className="text-sm text-gray-600">FOR YOUR CAUSE</p>
          </div>
          <div
            onClick={() => navigate("/hacks/building-connections")}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-[#F87171]">💡</span>
              </div>
              <h4 className="font-semibold">BUILDING</h4>
            </div>
            <p className="text-sm text-gray-600">CONNECTIONS WITH ANYONE</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/donations")}
          className="w-full text-[#F87171] font-semibold mt-4 text-center hover:text-red-600 transition-colors"
        >
          Check all your donations →
        </button>
      </div>
    </div>
  );
}
