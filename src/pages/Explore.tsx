import React, { useState, useEffect } from 'react';
import { Play, Lock, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTrainingModulesWithStatus } from '../lib/api';
// import { getTrainingModulesWithStatus } from '../api/modules';

interface TrainingModule {
  id: string;
  number: number;
  title: string;
  description?: string;
  video_url: string;
  progress_percentage: number;
  is_completed: boolean;
  is_locked: boolean;
  letter?: string;
}

export default function OrientationModule() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      // Use the API function to get modules with status
      const modulesData = await getTrainingModulesWithStatus();
      
      // Process modules - add letter property
      let processedModules = modulesData.map((module, index) => ({
        ...module,
        letter: String.fromCharCode(65 + (Number(module.number) - 1)), // Convert number to letter (1->A, 2->B, etc.)
      }));
      
      setModules(processedModules);
      
      // Calculate overall progress
      if (processedModules.length > 0) {
        const totalProgress = processedModules.reduce((sum, module) => sum + module.progress_percentage, 0);
        setProgress(Math.round(totalProgress / processedModules.length));
        
        // Set the first unlocked module as expanded by default
        const firstUnlockedModule = processedModules.find(module => !module.is_locked);
        if (firstUnlockedModule) {
          setExpandedModule(firstUnlockedModule.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load modules');
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleModule = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  const handlePlayClick = (module: TrainingModule) => {
    // Navigate to module player
    navigate(`/module/${module.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <div className="text-center">
          <p className="text-xl text-red-500">{error}</p>
          <button 
            onClick={() => fetchModules()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto bg-[#d8edff] rounded-3xl p-6 shadow">
        <h1 className="text-2xl font-bold text-center text-[#4a6fa5] mb-2">ORIENTATION</h1>
        <p className="text-gray-600 text-sm text-center mb-4">
          Complete all training modules to finish your orientation.
        </p>
        
        {/* Progress bar */}
        <div className="bg-white rounded-full p-2 flex items-center mb-6">
          <div className="text-[#69b0ee] font-medium text-sm mr-2">Progress</div>
          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
            <div 
              className="bg-[#69b0ee] h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[#69b0ee] font-medium text-sm ml-2">{progress}% Complete</div>
        </div>
        
        {/* Module list */}
        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className={`flex items-center p-4 cursor-pointer ${module.is_locked ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => !module.is_locked && toggleModule(module.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                  module.is_locked ? 'bg-gray-300' : 
                  module.is_completed ? 'bg-green-500 text-white' : 'bg-[#4a6fa5] text-white'
                }`}>
                  {module.letter}
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${module.is_locked ? 'text-gray-400' : 'text-[#4a6fa5]'}`}>
                    {module.title || `Module ${module.number}`}
                  </h3>
                  {module.progress_percentage > 0 && !module.is_completed && (
                    <div className="mt-1">
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-[#69b0ee] h-1.5 rounded-full" 
                          style={{ width: `${module.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                {module.is_completed ? (
                  <Check size={20} className="text-green-500" />
                ) : module.is_locked ? (
                  <Lock size={20} className="text-gray-400" />
                ) : (
                  expandedModule === module.id ? 
                    <ChevronDown size={20} className="text-[#4a6fa5]" /> : 
                    <ChevronRight size={20} className="text-[#4a6fa5]" />
                )}
              </div>
              
              {/* Expanded content */}
              {expandedModule === module.id && !module.is_locked && (
                <div className="p-4 pt-0 bg-white">
                  {module.description && (
                    <p className="text-[#69b0ee] text-sm mb-3">{module.description}</p>
                  )}
                  <button
                    onClick={() => handlePlayClick(module)}
                    className="w-full bg-[#69b0ee] text-white py-2 rounded-lg flex items-center justify-center hover:bg-[#4a6fa5] transition-colors"
                  >
                    <Play size={16} className="mr-2" />
                    {module.is_completed ? 'Watch Again' : module.progress_percentage > 0 ? 'Continue Watching' : 'Start Module'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}