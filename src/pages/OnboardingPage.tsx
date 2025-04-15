import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import splashBG from "../../public/assets/splashBG.svg";
import { UserData, fetchUserData, updateUserData } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const OnboardingPage = () => {
  const containerClass = "min-h-screen max-w-[700px] mx-auto bg-white";
  const [formData, setFormData] = useState({
    full_name: "",
    whatsapp_number: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate=useNavigate();
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

  
  // Fetch user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await fetchUserData();
        if (userData) {
          setFormData({
            full_name: userData.full_name || "",
            whatsapp_number: userData.whatsapp_number || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load your profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleNext = async () => {
    try {
      setIsSaving(true);
      setError("");
  
      await updateUserData({
        full_name: formData.full_name,
        whatsapp_number: formData.whatsapp_number,
      });
      const userData = await fetchUserData();
      // ✅ Re-fetch user from Supabase
      const { data, error } = await supabase
        .from("users")
        .select("whatsapp_number")
        .eq("id", userData.id)
        .single();
  
      if (!error && data?.whatsapp_number) {
        console.log("User data updated successfully");
        setTimeout(() => window.location.href = "/", 500);
 // Now navigation won't get blocked
      } else {
        console.error("Failed to verify WhatsApp number");
        setError("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Error updating user data:", err);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  
  return (
    <div
      className={`${containerClass} flex flex-col p-6`}
      style={{ backgroundImage: `url(${splashBG})` }}
    >
      <button className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-red-500 mb-2">WELCOME</h1>
        <p className="text-gray-600 mb-8">Let's get to know you better!</p>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              {/* <div className="grid grid-cols-3 gap-4 mb-8">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setFormData({ ...formData, avatar: avatar.url })}
                    className={`relative rounded-full overflow-hidden h-24 w-24 m-2 ${
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
              </div> */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What should we call you?
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What's your WhatsApp number?
              </label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your WhatsApp number"
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}
            
            <button
              onClick={handleNext}
              disabled={!formData.full_name || !formData.whatsapp_number || isSaving}
              className="w-full bg-red-500 text-white py-3 rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;