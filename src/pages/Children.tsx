import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getChildren, Child } from "../lib/api";

export default function Children() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChildren() {
      try {
        const data = await getChildren();
        setChildren(data);
      } catch (err) {
        console.error("Error fetching children:", err);
        setError("Failed to load children data");
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    <div className="min-h-screen bg-gray-50 pb-0">
      <div className="bg-amber-100 p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="md:text-2xl text-xl font-bold">
            <span className="text-red-500">WHO WE ARE</span>{" "}
            <span className="text-indigo-600">WORKING</span>{" "}
            <span className="text-red-500">FOR</span>{" "}
          </h1>
        </div>

        <div className=" rounded-xl p-4 mb-6 border-0 shadow-[1px_10px_15px_7px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-4">
            <img
              src="public/assets/teaching.svg"
              alt="Children"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <p className="text-sm text-gray-700 italic">
                Meet The Children We Are Supporting On Their Learning Journey.
                Each Child Has A Unique Story, A Bright Future Ahead, And The
                Potential To Achieve Great Things.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#fef2c7]">
        <div className="grid grid-cols-2 gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              onClick={() => navigate(`/children/${child.id}`)}
              className="bg-amber-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow shadow-[1px_10px_15px_10px_rgba(0,0,0,0.07)]"
            >
              <div
  className="relative w-full h-60 rounded-lg overflow-hidden shadow-lg"
  style={{
    backgroundImage: `url(${child.image_url})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
<div className="absolute inset-0 bg-gradient-to-t from-black to-transparent shadow-[1px_10px_15px_7px_rgba(0,0,0,0.07)]"></div>
  {/* Priority Label */}
  {child.priority === "High" && (
    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full">
      High Priority
    </div>
  )}

  {/* Name & Info Overlay */}
  <div className="absolute bottom-14 w-full px-3 text-white">
    <h3 className="text-lg font-bold">{child.name}</h3>
    <div className="flex items-center gap-2 text-xs mt-1">
      <div className="flex items-center">
        <span className="mr-1">🗓️</span>
        <span>{child.age} Years</span>
      </div>
      <div className="flex items-center">
        <span className="mr-1">📍</span>
        <span>{child.location}</span>
      </div>
    </div>
  </div>

  {/* Buttons - Fully Aligned & Spaced Correctly */}
  <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-3">
    <button className="bg-red-500 text-white text-xs p-2 rounded-full w-1/2">
      Assignment
    </button>
    <button className="bg-indigo-500 text-white text-xs p-2 rounded-full w-1/2">
      See More
    </button>
  </div>
</div>


            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
