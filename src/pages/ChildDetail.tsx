import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getChildById, Child } from '../lib/api';

export default function ChildDetail() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchChild() {
      if (!id) return;
      
      try {
        const data = await getChildById(id);
        setChild(data);
      } catch (err) {
        console.error('Error fetching child:', err);
        setError('Failed to load child data');
      } finally {
        setLoading(false);
      }
    }

    fetchChild();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Child not found'}</p>
          <Link to="/children" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700">
            Back to Children
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative">
        <img 
          src={child.image_url} 
          alt={child.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4">
          <Link to="/children" className=" backdrop-blur-sm p-2 rounded-full text-white">
            <ArrowLeft size={24} />
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <h1 className="text-2xl font-bold">{child.name}</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-500 text-sm">Age</p>
              <p className="font-bold">{child.age} years</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Location</p>
              <p className="font-bold">{child.location}</p>
            </div>
            {child.priority === 'High' && (
              <div className="col-span-2">
                <p className="text-gray-500 text-sm">Priority</p>
                <p className="font-bold text-green-600">{child.priority}</p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-indigo-600 mb-2">About {child.name}</h2>
            <p className="text-gray-700">{child.description}</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Assign to Me
            </button>
            <button className="flex-1 bg-indigo-500 text-white py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors">
              Support
            </button>
          </div>
        </div>

        <div className="bg-amber-100 rounded-xl p-4">
          <h2 className="text-lg font-bold text-indigo-600 mb-2">Education Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-700">Current Grade</p>
              <p className="font-medium">Grade {child.age - 5}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700">School Name</p>
              <p className="font-medium">Muskurahat Foundation School</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700">Favorite Subject</p>
              <p className="font-medium">Mathematics</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-700">Academic Performance</p>
              <p className="font-medium">Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-center mb-4">Assign {child.name} to Me</h2>
            <p className="text-gray-700 mb-6">
              By assigning {child.name} to yourself, you commit to supporting their education and well-being. 
              You'll receive regular updates about their progress.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert(`${child.name} has been assigned to you!`);
                  setShowModal(false);
                }}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}