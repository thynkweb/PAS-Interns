import React, { useState, useEffect } from 'react';
import { Play, Lock, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function OrientationModule() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchModules(user.id);
      } else {
        // Handle not logged in state
        setError("Please log in to access training modules");
      }
    }

    fetchUser();
  }, []);

  async function fetchModules(userId:any) {
    try {
      // Get all modules first
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('*')
        .order('number', { ascending: true });

      if (modulesError) throw modulesError;
      
      // Get user progress for all modules
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress') // Using the table name from your schema
        .select('*')
        .eq('user_id', userId);

      if (progressError && progressError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is fine - user hasn't started any module
        throw progressError;
      }

      // Process modules with progress data
      let processedModules = modulesData.map((module, index) => {
        // Find progress for this module
        const moduleProgress = progressData?.find(p => p.module_id === module.id) || null;
        
        return {
          ...module,
          letter: String.fromCharCode(65 + (Number(module.number) - 1)), // Convert number to letter (1->A, 2->B, etc.)
          progress_percentage: moduleProgress?.progress_percentage || 0,
          is_completed: moduleProgress?.completed || false,
          last_watched_position: moduleProgress?.last_watched_position || 0,
          // First module is always unlocked, others are locked unless progress exists and is_locked is false
          is_locked: index === 0 ? false : moduleProgress ? moduleProgress.is_locked : true
        };
      });
      
      setModules(processedModules || []);
      
      // Calculate overall progress
      if (processedModules.length > 0) {
        const totalProgress = processedModules.reduce((sum, module) => sum + module.progress_percentage, 0);
        setProgress(Math.round(totalProgress / processedModules.length));
        
        // Set the first module as expanded by default (it's always unlocked)
        if (processedModules[0]) {
          setExpandedModule(processedModules[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load modules');
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleModule = (moduleId:any) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
    }
  };

  const handlePlayClick = (module:any) => {
    // Navigate to module player instead of opening in new tab
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
            onClick={() => window.location.reload()}
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
          {modules.map((module, index) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div 
                className={`flex items-center p-4 cursor-pointer ${module.is_locked ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                onClick={() => !module.is_locked && toggleModule(module.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${module.is_locked ? 'bg-gray-300' : 'bg-[#4a6fa5] text-white'}`}>
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