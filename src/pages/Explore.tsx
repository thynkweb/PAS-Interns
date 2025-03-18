import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrainingModules, getPodcasts, TrainingModule, Podcast } from '../lib/api';
import Assignment from '../components/Assignment';

export default function Explore() {
  const navigate = useNavigate();
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const [modules, podcastsData] = await Promise.all([
          getTrainingModules(),
          getPodcasts()
        ]);
        setTrainingModules(modules);
        setPodcasts(podcastsData);
      } catch (err) {
        setError('Failed to load content. Please try again later.');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  const handlePlayClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-indigo-700 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-white text-indigo-700 px-4 py-2 rounded-full font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-700 pb-20">
      <div className="flex gap-4 p-4">
        <button 
          onClick={() => navigate('/')}
          className="flex-1 bg-indigo-600/50 text-white/70 py-2 px-4 rounded-full hover:bg-indigo-600/70 transition-colors"
        >
          DASHBOARD
        </button>
        <button className="flex-1 bg-white text-indigo-700 py-2 px-4 rounded-full font-medium">
          EXPLORE
        </button>
        <button className="flex-1 bg-indigo-600/50 text-white/70 py-2 px-4 rounded-full">
          JOURNEY
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-[2.5rem] min-h-[calc(100vh-140px)] p-6">
        <div className="space-y-8">
          {/* Training Modules */}
          <section>
  <h2 className="text-2xl font-bold mb-4">
    <span className="text-indigo-700">TRAINING</span>{' '}
    <span className="text-red-500">MODULES</span>
  </h2>
  <div className="space-y-4">
    {trainingModules.length > 0 ? (
      trainingModules.map((module) => (
        <div key={module.id} className="bg-white border-2 border-gray-100 rounded-xl p-4 relative">
          <h3 className="text-orange-400 font-bold mb-1">MODULE {module.number}</h3>
          <p className="text-gray-900 font-medium">{module.title}</p>
          {module.video_url && (
            <button 
              onClick={() => handlePlayClick(module.video_url)}
              className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 hover:bg-indigo-600 transition-colors"
            >
              <Play size={24} className="text-white ml-1" />
            </button>
          )}
        </div>
      ))
    ) : (
      <p className="text-gray-500">No training modules available.</p>
    )}
  </div>
</section>

          {/* Assignment Section */}
          {/* <section>
            <Assignment assignmentId="f7d7ce3e-e6b5-4f8b-a7b0-b7a3e0c29f1f" />
          </section> */}

          {/* Podcasts */}
          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-4">PODCASTS</h2>
            <div className="space-y-4">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-orange-400 font-bold mb-1">
                        PODCAST {podcast.number}
                      </h3>
                      <p className="text-gray-900 font-medium">{podcast.title}</p>
                      {podcast.description && (
                        <p className="text-gray-600 text-sm mt-1">{podcast.description}</p>
                      )}
                    </div>
                    {podcast.audio_url && (
                      <button 
                        onClick={() => handlePlayClick(podcast.audio_url)}
                        className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 hover:bg-indigo-600 transition-colors"
                      >
                        <Play size={24} className="text-white ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}