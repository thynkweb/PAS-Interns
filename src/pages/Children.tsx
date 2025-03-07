import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getChildren, Child } from '../lib/api';

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
        console.error('Error fetching children:', err);
        setError('Failed to load children data');
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-amber-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-red-500">WHO WE ARE</span> <span className="text-indigo-600">WORKING FOR</span>
          </h1>
        </div>

        <div className=" backdrop-blur-sm rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=100&h=100&fit=crop" 
              alt="Children"
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p className="text-sm text-gray-700">
                Meet The Children We Are Supporting On Their Learning Journey. Each Child Has A Unique Story, 
                A Bright Future Ahead, And The Potential To Achieve Great Things.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {children.map(child => (
            <div 
              key={child.id}
              onClick={() => navigate(`/children/${child.id}`)}
              className="bg-amber-100 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img 
                  src={child.image_url} 
                  alt={child.name}
                  className="w-full h-40 object-cover"
                />
                {child.priority === 'High' && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    High Priority
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-lg font-bold text-indigo-600">{child.name}</h3>
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
                  <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                    Assignment
                  </button>
                  <button className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
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