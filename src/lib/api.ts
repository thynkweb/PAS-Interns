import { supabase } from './supabase';

// Add better error handling to all API functions
const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error.message?.includes('JWTExpired')) {
    // Handle expired session
    supabase.auth.signOut();
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  throw error;
};

export interface UserRank {
  id: string;
  user_id: string;
  rank_position: number;
  total_amount: number;
  total_donors: number;
  avg_donation: number;
  rank_title: string;
  created_at: string;
  updated_at: string;
}

export interface DonationStats {
  id: string;
  total_donations: number;
  avg_donation: number;
  total_donors: number;
  highest_donation: number;
  highest_donor_id: string | null;
  updated_at: string;
}

export interface TrainingModule {
  id: string;
  number: number;
  title: string;
  video_url: string | null;
  description?: string;
  is_locked?: boolean;
  progress_percentage?: number;
}

export interface Podcast {
  id: string;
  number: number;
  title: string;
  description?: string;
  audio_url: string | null;
}

export interface ModuleComment {
  id: string;
  comment: string;
  user_name: string;
  created_at: string;
}


export interface FundraisingAmount {
  id: string;
  user_id: string;
  current_amount: number;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

// export interface Donation {
//   id: string;
//   donor_id: string | null;
//   user_id: string;
//   amount: number;
//   created_at: string;
//   display_name: string;
//   message: string | null;
//   is_anonymous: boolean;
// }

export interface CommunityComment {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  approved: number; // Add the approved field
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  days_left: number;
  referral_code: string;
  created_at: string;
  updated_at: string;
  deadline_date: string;
  whatsapp_number: string | null;
  donations:number |null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentOption {
  id: string;
  question_id: string;
  option_text: string;
  option_label: string;
  created_at: string;
}

export interface AssignmentQuestion {
  id: string;
  assignment_id: string;
  question_text: string;
  correct_option: string;
  order_number: number;
  created_at: string;
  options: AssignmentOption[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  assignment_id: string;
  current_question: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  location: string;
  image_url: string;
  description: string;
  priority: string;
  created_at: string;
}
export interface Donation {
  id: string;
  donor_id: string;
  amount: number;
  created_at: string;
  display_name: string;
  message: string;
  is_anonymous: boolean;
  user_id: string;
}

export interface BatchStats {
  totalAmount: number;
  totalDonors: number;
  averageDonation: number;
  topDonors: {
    id: string;
    name: string;
    amount: number;
    role: string;
  }[];
}
export interface WeeklyData {
  week: string;
  value: number;
}

export interface WeeklyStats {
  weeklyDonors: WeeklyData[];
  weeklyDonations: WeeklyData[];
}
export interface TopDonor {
  id: string;
  name: string;
  amount: number;
  role: string;
  email?: string;
  avatar?: string;
}

// Add this function to your api.ts file
export async function ensureUserExists(userId: string, email: string, fullName?: string, avatarUrl?: string): Promise<UserData | null> {
  try {
    // First check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    // If user exists, return it
    if (existingUser) return existingUser;
    
    // User doesn't exist, create new record
    const currentDate = new Date();
    const deadline = new Date(currentDate);
    deadline.setDate(deadline.getDate() + 30); // 30 days from now
    
    const daysLeft = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create new user object with only the fields we know exist
    const newUser = {
      id: userId,
      email: email,
      full_name: fullName || null,
      avatar_url: avatarUrl || null,
      days_left: daysLeft,
      referral_code: referralCode,
      deadline_date: deadline.toISOString(),
      created_at: currentDate.toISOString(),
      updated_at: currentDate.toISOString()
    };
    
    // Remove any fields that might not exist in the table
    // This is a safer approach than assuming all fields exist
    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert(newUser)
      .select()
      .single();
      
    if (insertError) throw insertError;
    return createdUser;
  } catch (error) {
    handleError(error, 'ensureUserExists');
    return null;
  }
}

export async function getTrainingModules(): Promise<TrainingModule[]> {
  try {
    const response = await fetch('/api/training-modules');
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      return []; // Return an empty array if the response is invalid
    }

    return data;
  } catch (error) {
    console.error('Error fetching training modules:', error);
    return [];
  }
}

export async function getPodcasts(): Promise<Podcast[]> {
  try {
    const response = await fetch('/api/podcasts');
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      return []; // Return an empty array if the response is invalid
    }

    return data;
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return [];
  }
}


export async function getFundraisingAmount(userId: string): Promise<FundraisingAmount | null> {
  try {
    // Instead of using a separate table, we'll calculate from donations
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;

    const currentAmount = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
    
    return {
      id: userId, // Use userId as the id since we don't have a separate table
      user_id: userId,
      current_amount: currentAmount,
      target_amount: 35000, // Default target amount
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    handleError(error, 'getFundraisingAmount');
    return null;
  }
}

export async function getDonations(userId: string): Promise<Donation[]> {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .or(`user_id.eq.${userId},donor_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getDonations');
    return [];
  }
}
export async function getBatchStats(): Promise<BatchStats> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  if (error) {
    console.error('Error fetching batch donations:', error);
    throw new Error('Failed to load batch donations');
  }
  
  // Calculate batch statistics
  const donations = data as Donation[];
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  console.log("batch donations",donations);
  
  // Count unique donors
  const uniqueDonors = new Set(donations.map(d => d.id));
  const totalDonors = uniqueDonors.size;
  
  // Calculate average donation
  const averageDonation = totalDonors > 0 ? totalAmount / totalDonors : 0;
  
  // Calculate top donors
  const donorMap = new Map();
  
  // Aggregate donations by donor
  donations.forEach(donation => {
    const donorId = donation.donor_id;
    if (donorMap.has(donorId)) {
      donorMap.set(donorId, {
        ...donorMap.get(donorId),
        amount: donorMap.get(donorId).amount + donation.amount
      });
    } else {
      donorMap.set(donorId, {
        id: donorId,
        name: donation.display_name,
        amount: donation.amount,
        role: 'Social Change Leader'
      });
    }
  });
  
  // Convert to array and sort to get top donors
  const topDonors = Array.from(donorMap.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  return {
    totalAmount,
    totalDonors,
    averageDonation,
    topDonors
  };
}
export async function getWeeklyStats(userId: string): Promise<{ weeklyDonors: WeeklyData[]; weeklyDonations: WeeklyData[] }> {
  try {
    // Fetch user creation date
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user creation date:", userError);
      throw new Error("User not found or error fetching creation date");
    }

    const creationDate = new Date(userData.created_at);
    const today = new Date();
    const weeklyDonors: WeeklyData[] = [];
    const weeklyDonations: WeeklyData[] = [];
    const weeklyRecords: { week: string; records: Donation[] }[] = [];

    console.log("User creation date:", creationDate);

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(creationDate);
      weekStart.setDate(weekStart.getDate() + i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Ensure we do not exceed today's date
      if (weekStart >= today) break;
      if (weekEnd > today) weekEnd.setDate(today.getDate());

      const weekNumber = i + 1;
      console.log(`Fetching data for Week ${weekNumber}: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

      const { data: weekData, error: weekError } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      if (weekError) {
        console.error(`Error fetching week ${weekNumber} data:`, weekError);
        continue;
      }

      console.log(`Week ${weekNumber} data count:`, weekData?.length || 0);

      if (!weekData || weekData.length === 0) {
        weeklyDonors.push({ week: `Week ${weekNumber}`, value: 0 });
        weeklyDonations.push({ week: `Week ${weekNumber}`, value: 0 });
        weeklyRecords.push({ week: `Week ${weekNumber}`, records: [] });
        continue;
      }

      const donations = weekData as Donation[];
      const uniqueDonorIds = new Set(donations.map(d => d.donor_id || d.id));
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

      weeklyDonors.push({ week: `Week ${weekNumber}`, value: uniqueDonorIds.size });
      weeklyDonations.push({ week: `Week ${weekNumber}`, value: totalAmount });
      weeklyRecords.push({ week: `Week ${weekNumber}`, records: donations });
    }

    console.log("Weekly donors:", weeklyDonors);
    console.log("Weekly donations:", weeklyDonations);
    console.log("Weekly records:", weeklyRecords);

    return { weeklyDonors, weeklyDonations, weeklyRecords };
  } catch (error) {
    console.error("Error in getWeeklyStats:", error);
    throw error;
  }
}



// Define interface for weekly data

export async function getTopDonors(): Promise<TopDonor[]> {
  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString();
    
    // Fetch donations from the last 30 days
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .gte('created_at', thirtyDaysAgoString);
    
    if (error) {
      console.error('Error fetching donations:', error);
      throw new Error('Failed to load donations');
    }
    
    // Cast data to Donation type
    const donations = data as Donation[];
    console.log(`Fetched ${donations.length} donations from the last 30 days`);
    
    // Aggregate donations by donor
    const donorMap = new Map<string, TopDonor>();
    
    donations.forEach(donation => {
      const donorId = donation.id;
      
      if (donorMap.has(donorId)) {
        // Update existing donor with additional amount
        const existingDonor = donorMap.get(donorId)!;
        donorMap.set(donorId, {
          ...existingDonor,
          amount: existingDonor.amount + donation.amount
        });
      } else {
        // Add new donor to the map
        donorMap.set(donorId, {
          id: donorId,
          name: donation.display_name,
          amount: donation.amount,
          role: determineRole(donation.amount), // Dynamically determine role based on amount
          email: donation.email || '', // Include email if available
          avatar: donation?.avatar_url || '' // Include avatar if available
        });
      }
    });
    
    // Convert to array and sort to get top donors by amount
    const topDonors = Array.from(donorMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    if (topDonors.length === 0) {
      console.warn('No donors found in the last 30 days');
    } else if (topDonors.length < 5) {
      console.warn(`Only found ${topDonors.length} donors in the last 30 days`);
    }
    
    return topDonors;
  } catch (error) {
    console.error('Error in getTopDonors:', error);
    throw error;
  }
}
function determineRole(amount: number): string {
  if (amount >= 10000) return 'Platinum Supporter';
  if (amount >= 5000) return 'Gold Supporter';
  if (amount >= 1000) return 'Silver Supporter';
  if (amount >= 500) return 'Bronze Supporter';
  return 'Social Change Leader';
}
// Define the TopDonor type

export async function getComments(): Promise<CommunityComment[]> {
  try {
    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .eq('approved', 1) // Only fetch approved comments
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    // Fetch reactions for each comment
    const commentsWithReactions = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: reactions, error: reactionsError } = await supabase
          .from('comment_reactions')
          .select('*')

        if (reactionsError) throw reactionsError;

        return {
          ...comment,
          reactions: reactions || []
        };
      })
    );

    return commentsWithReactions;
  } catch (error) {
    handleError(error, 'getComments');
    return [];
  }
}

export async function createComment(
  content: string,
  image_url?: string
): Promise<CommunityComment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Option 1: If you want to use UUID for the id
    const id = crypto.randomUUID(); // Generate a UUID for the id

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        id, // Include the generated id
        user_id: user.id,
        content,
        image_url,
        approved: 0 // Set default approval status to 0 (not approved)
      })
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return { ...data, reactions: [] };
  } catch (error) {
    handleError(error, 'createComment');
    throw error;
  }
}

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getUserData');
    return null;
  }
}

export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getAssignment');
    return null;
  }
}

export async function getAssignmentQuestions(assignmentId: string): Promise<AssignmentQuestion[]> {
  try {
    const { data: questions, error: questionsError } = await supabase
      .from('assignment_questions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('order_number');

    if (questionsError) throw questionsError;

    const questionsWithOptions: AssignmentQuestion[] = [];
    
    for (const question of questions) {
      const { data: options, error: optionsError } = await supabase
        .from('assignment_options')
        .select('*')
        .eq('question_id', question.id);

      if (optionsError) throw optionsError;

      questionsWithOptions.push({
        ...question,
        options: options || []
      });
    }

    return questionsWithOptions;
  } catch (error) {
    handleError(error, 'getAssignmentQuestions');
    return [];
  }
}

export async function getUserProgress(
  userId: string,
  assignmentId: string
): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase
      .from('user_assignment_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('assignment_id', assignmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    handleError(error, 'getUserProgress');
    return null;
  }
}

export async function createUserProgress(
  userId: string,
  assignmentId: string
): Promise<UserProgress> {
  try {
    const { data, error } = await supabase
      .from('user_assignment_progress')
      .insert({
        user_id: userId,
        assignment_id: assignmentId,
        current_question: 1,
        completed: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'createUserProgress');
    throw error;
  }
}

export async function updateUserProgress(
  progressId: string,
  currentQuestion: number,
  completed: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_assignment_progress')
      .update({
        current_question: currentQuestion,
        completed: completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', progressId);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'updateUserProgress');
  }
}



export async function getUserRank(userId: string): Promise<UserRank | null> {
  try {
    const { data, error } = await supabase
      .from('user_ranks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    handleError(error, 'getUserRank');
    return null;
  }
}

export async function getDonationStats(): Promise<DonationStats | null> {
  try {
    const { data, error } = await supabase
      .from('donation_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getDonationStats');
    return null;
  }
}

export async function getUserDonationHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('amount, created_at')
      .eq('user_id', userId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getUserDonationHistory');
    return [];
  }
}

// export async function createComment(
//   content: string,
//   image_url?: string
// ): Promise<CommunityComment> {
//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) throw new Error('User not authenticated');

//     const { data, error } = await supabase
//       .from('community_comments')
//       .insert({
//         user_id: user.id,
//         content,
//         image_url
//       })
//       .select(`
//         *,
//         user:users(full_name, avatar_url)
//       `)
//       .single();

//     if (error) throw error;
//     return { ...data, reactions: [] };
//   } catch (error) {
//     handleError(error, 'createComment');
//     throw error;
//   }
// }

export async function updateComment(
  id: string,
  content: string,
  image_url?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('community_comments')
      .update({
        content,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'updateComment');
    throw error;
  }
}

export async function addReaction(
  commentId: string,
  reaction: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comment_reactions')
      .upsert({
        comment_id: commentId,
        user_id: user.id,
        reaction
      });

    if (error) throw error;
  } catch (error) {
    handleError(error, 'addReaction');
    throw error;
  }
}

export async function removeReaction(
  commentId: string,
  reaction: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('reaction', reaction);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'removeReaction');
    throw error;
  }
}

export async function getChildren(): Promise<Child[]> {
  try {
    console.log('Fetching children data...');
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at');

    if (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
    
    console.log('Children data received:', data);
    return data || [];
  } catch (error) {
    handleError(error, 'getChildren');
    return [];
  }
}

export async function getChildById(childId: string): Promise<Child | null> {
  try {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'getChildById');
    return null;
  }
}
export async function getTrainingModulesWithStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase.rpc('get_modules_with_status', { 
    user_id: user.id 
  });
  
  if (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
  
  return data as TrainingModule[];
}

// Get a single module by ID
export async function getModuleById(moduleId: string) {
  const { data, error } = await supabase
    .from('training_modules')
    .select('*')
    .eq('id', moduleId)
    .single();
    
  if (error) {
    console.error('Error fetching module:', error);
    throw error;
  }
  
  return data as TrainingModule;
}

// Get user progress for a module
export async function getModuleProgress(moduleId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" - user hasn't started this module
    console.error('Error fetching progress:', error);
    throw error;
  }
  
  return data;
}

// Update module progress
export async function updateModuleProgress(moduleId: string, progressPercentage: number, position: number, completed: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      module_id: moduleId,
      progress_percentage: progressPercentage,
      last_watched_position: position,
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: 'user_id,module_id' });
    
  if (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
  
  // If completed, try to unlock next module
  if (completed) {
    await unlockNextModule(moduleId);
  }
}

// Unlock next module when current is completed
export async function unlockNextModule(currentModuleId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Get current module order
    const { data: currentModule } = await supabase
      .from('training_modules')
      .select('order')
      .eq('id', currentModuleId)
      .single();
    
    if (!currentModule) return;
    
    // Get next module in sequence
    const { data: nextModule } = await supabase
      .from('training_modules')
      .select('id')
      .eq('order', currentModule.order + 1)
      .single();
    
    if (!nextModule) return; // No next module
    
    // Unlock next module
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        module_id: nextModule.id,
        progress_percentage: 0,
        completed: false,
        is_locked: false
      }, { onConflict: 'user_id,module_id' });
  } catch (err) {
    console.error('Error unlocking next module:', err);
  }
}

// Get comments for a module
export async function getModuleComments(moduleId: string) {
  const { data, error } = await supabase
    .from('module_comments')
    .select('id, comment, created_at, user_name')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
  
  return data as ModuleComment[];
}

// Add a comment to a module
export async function addModuleComment(moduleId: string, comment: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get user profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();
    
  const userName = profile?.full_name || 'Anonymous';
  
  const { error } = await supabase
    .from('module_comments')
    .insert({
      module_id: moduleId,
      user_id: user.id,
      comment: comment,
      user_name: userName
    });
    
  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}