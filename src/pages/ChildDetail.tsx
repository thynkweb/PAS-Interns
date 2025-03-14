import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
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
        <img src={child.image_url} alt={child.name} className="w-full h-64 object-cover" />
        <div className="absolute top-0 left-0 right-0 p-4">
          <Link to="/children" className="backdrop-blur-sm p-2 rounded-full text-white">
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
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            {/* Close Button */}
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>

            {/* Image and Name */}
            <div className="flex items-center gap-4">
              <img src={child.image_url} alt={child.name} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-bold text-indigo-600">{child.name}</h2>
                <p className="text-gray-500">{child.age} years</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700">Description</h3>
              <p className="text-gray-600 text-sm mt-1">{child.description}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
