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
  social_status:any
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
      .eq('email', email)
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
      id: userId.toString(), // Explicitly convert UUID to string
      email: email,
      full_name: fullName || null,
      avatar_url: avatarUrl || null,
      days_left: daysLeft,
      referral_code: referralCode,
      deadline_date: deadline.toISOString(),
      created_at: currentDate.toISOString(),
      updated_at: currentDate.toISOString(),
      social_status: 4,
      donations: 0
    };
    console.log("new user",newUser);
    
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
    // Added payment_status filter
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount')
      .eq('user_id', userId)
      .eq('payment_status', 'captured'); // Added the payment status filter

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
      .eq('payment_status', 'captured') // Added the payment status filter
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
    .eq('payment_status', 'captured') // Added the payment status filter
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching batch donations:', error);
    throw new Error('Failed to load batch donations');
  }

  // Calculate batch statistics
  const donations = data as Donation[];
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  console.log("batch donations", donations);

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
export async function getWeeklyStats(userId: string): Promise<{ weeklyDonors: WeeklyData[]; weeklyDonations: WeeklyData[]; weeklyRecords: { week: string; records: Donation[] }[] }> {
  try {
    // Create dates in UTC
    const today = new Date();
    const weeklyDonors: WeeklyData[] = [];
    const weeklyDonations: WeeklyData[] = [];
    const weeklyRecords: { week: string; records: Donation[] }[] = [];

    // Calculate the start date (4 weeks ago from today) - in UTC
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(today.getDate() - (4 * 7));
    fourWeeksAgo.setUTCHours(0, 0, 0, 0);

    // Today end time in UTC
    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    console.log(`Analysis period: ${fourWeeksAgo.toISOString()} to ${todayEnd.toISOString()}`);

    // Get all donations for the period
    const { data: allDonations, error: allDonationsError } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_status', 'captured')
      .gte('created_at', fourWeeksAgo.toISOString())
      .lte('created_at', todayEnd.toISOString());
    
    if (allDonationsError) {
      console.error("Error fetching all donations:", allDonationsError);
      throw allDonationsError;
    }
    
    console.log(`Total captured donations in period: ${allDonations?.length || 0}`);
    
    // Create an array to hold our week data before sorting
    const weeksData = [];
    
    // Process each week
    for (let i = 0; i < 4; i++) {
      // Calculate this week's start date (counting back from today)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - ((4 - i) * 7));
      weekStart.setUTCHours(0, 0, 0, 0);
      
      // Calculate this week's end date
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      weekEnd.setUTCHours(23, 59, 59, 999);
      
      // Ensure we don't exceed today's date
      if (weekEnd > todayEnd) {
        weekEnd.setTime(todayEnd.getTime());
      }

      const weekNumber = i + 1; 
      const weekLabel = i === 3 ? "W4" : `W${weekNumber}`;
      console.log(`Processing ${weekLabel}: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

      // Filter donations for this week
      const weekData = allDonations?.filter(donation => {
        const donationDate = new Date(donation.created_at);
        return donationDate >= weekStart && donationDate <= weekEnd;
      }) || [];

      console.log(`${weekLabel} data count:`, weekData.length);
      
      // Add debugging for donor IDs
      if (weekData.length > 0) {
        console.log(`Sample donation donor_id: ${weekData[0].id}, amount: ${weekData[0].amount}`);
        
        // Log all donor IDs to see what's happening
        const donorIds = weekData.map(d => d.id);
        console.log(`All donor IDs in this week: ${JSON.stringify(donorIds)}`);
      }
      
      // Count unique donors (even if donor_id is null, we'll count it as one donor)
      let uniqueDonorCount = 0;
      if (weekData.length > 0) {
        // Use a Map to count unique donors
        const donorMap = new Map();
        weekData.forEach(d => {
          const donorId = d.id || 'anonymous';
          donorMap.set(donorId, true);
        });
        uniqueDonorCount = donorMap.size;
      }
      
      // Calculate total amount
      const totalAmount = weekData.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      
      console.log(`${weekLabel} - Unique donors: ${uniqueDonorCount}, Total amount: ${totalAmount}`);
      
      // Store the week data with its position for sorting later
      weeksData.push({
        index: i,
        weekLabel,
        donorCount: uniqueDonorCount,
        amount: totalAmount,
        records: weekData
      });
    }
    
    // Sort weeks chronologically (oldest to newest)
    weeksData.sort((a, b) => a.index - b.index);
    
    // Populate the result arrays
    weeksData.forEach(week => {
      weeklyDonors.push({ week: week.weekLabel, value: week.donorCount });
      weeklyDonations.push({ week: week.weekLabel, value: week.amount });
      weeklyRecords.push({ week: week.weekLabel, records: week.records });
    });
    
    console.log("Final weekly donors:", weeklyDonors);
    console.log("Final weekly donations:", weeklyDonations);

    return { weeklyDonors, weeklyDonations, weeklyRecords };
  } catch (error) {
    console.error("Error in getWeeklyStats:", error);
    throw error;
  }
}


// Define interface for weekly data

export async function getTopDonors(): Promise<TopDonor[]> {
  try {
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString();

    // Fetch donations
    const { data: donationsData, error: donationError } = await supabase
      .from('donations')
      .select('amount, user_id')
      .eq('payment_status', 'captured')
      .gte('created_at', thirtyDaysAgoString);

    if (donationError) {
      console.error('Error fetching donations:', donationError);
      throw new Error('Failed to load donations');
    }

    // Aggregate donation amounts by user_id
    const userDonationMap = new Map<string, number>();

    donationsData.forEach(donation => {
      const userId = donation.user_id;
      if (!userId) return;
      userDonationMap.set(userId, (userDonationMap.get(userId) || 0) + donation.amount);
    });

    // Get top 5 user_ids by donation amount
    const sortedUserEntries = Array.from(userDonationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topUserIds = sortedUserEntries.map(([userId]) => userId);
    console.log("top user IDs",topUserIds);
    
    // Fetch user details for top donors
    const { data: usersData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, email')
      .in('id', topUserIds);
    console.log("users data",usersData);
    
    if (userError) {
      console.error('Error fetching users:', userError);
      throw new Error('Failed to load user details');
    }

    // Combine user info with donation amount
    const topDonors: TopDonor[] = sortedUserEntries.map(([userId, amount]) => {
      const user = usersData.find(u => u.id === userId);
      console.log("user found",user);
      
      return {
        id: userId,
        name: user?.full_name || 'Anonymous',
        email: user?.email || '',
        avatar: user?.avatar_url || '',
        amount,
        role: determineRole(amount),
      };
    });

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
      .eq('payment_status', 'captured') // Added the payment status filter
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
export async function getTrainingModulesWithStatus(): Promise<TrainingModule[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Check if the RPC function exists
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_modules_with_status', { 
      user_id: user.id 
    });
    
    if (!rpcError && rpcData) {
      return rpcData as TrainingModule[];
    }
    
    // Fallback if RPC doesn't exist - manually fetch and combine data
    const { data: modulesData, error: modulesError } = await supabase
      .from('training_modules')
      .select('*')
      .order('number', { ascending: true });
    
    if (modulesError) throw modulesError;
    
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);
    
    if (progressError && progressError.code !== 'PGRST116') {
      throw progressError;
    }
    
    return modulesData.map((module, index) => {
      const progress = progressData?.find(p => p.module_id === module.id);
      
      return {
        ...module,
        progress_percentage: progress?.progress_percentage || 0,
        is_completed: progress?.completed || false,
        is_locked: index === 0 ? false : progress ? progress.is_locked : true
      };
    });
  } catch (error) {
    console.error('Error fetching modules with status:', error);
    throw error;
  }
}


/**
 * Get a module by its ID
 * @param {string} moduleId - The module ID to fetch
 * @returns {Promise<Object>} - The module data
 */
export const getModuleById = async (moduleId: string) => {
  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .eq("id", moduleId)
    .single();

  if (error) {
    console.error('Error fetching module:', error);
    throw error;
  }
  
  return data;
};

/**
 * Get module progress for the current user
 * @param {string} moduleId - The module ID to get progress for
 * @returns {Promise<Object>} - The progress data
 */
export const getModuleProgress = async (moduleId: string) => {
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
};

/**
 * Update module progress in the database
 * @param {string} moduleId - The module ID
 * @param {number} progressPercentage - The progress percentage (0-100)
 * @param {number} position - Current video position in seconds
 * @param {boolean} completed - Whether the module is completed
 * @returns {Promise<void>}
 */
export const updateModuleProgress = async (
  moduleId: string, 
  progressPercentage: number, 
  position: number, 
  completed: boolean
) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      module_id: moduleId,
      progress_percentage: progressPercentage,
      last_watched_position: position,
      completed: completed,
      completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: 'user_id,module_id' });
    console.log("upserted data",data);
    
  if (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
  
  // If completed, try to unlock next module
  if (completed) {
    await unlockNextModule(moduleId);
  }
};

/**
 * Unlock the next module after completing the current one
 * @param {string} currentModuleId - The current module ID
 * @returns {Promise<void>}
 */
export const unlockNextModule = async (currentModuleId: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Auth error:", userError);
    return;
  }

  if (!user) {
    console.error("User not authenticated");
    return;
  }

  try {
    // Get current module
    const { data: currentModule, error: currentModuleError } = await supabase
      .from('training_modules')
      .select('order')
      .eq('id', currentModuleId)
      .single();

    if (currentModuleError) {
      console.error("Current module fetch error:", currentModuleError);
      return;
    }

    console.log("Current module order:", currentModule?.order);

    // Get next module
    const { data: nextModule, error: nextModuleError } = await supabase
      .from('training_modules')
      .select('id')
      .eq('"order"', currentModule.order + 1)
      .single();

    if (nextModuleError) {
      console.error("Next module fetch error:", nextModuleError);
      return;
    }

    if (!nextModule) {
      console.log("No next module found");
      return;
    }

    console.log("Next module to unlock:", nextModule.id);

    // Upsert user_progress record
    const { error: upsertError, data: upsertData } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        module_id: nextModule.id,
        progress_percentage: 0,
        last_watched_position: 0,
        completed: false,
        is_locked: false,
        completed_at: null
      }, { onConflict: ['user_id', 'module_id'] });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    } else {
      console.log("Upserted user_progress:", upsertData);
    }

  } catch (err) {
    console.error("Unexpected error in unlockNextModule:", err);
  }
};

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
export async function updateUserData(userData: Partial<UserData>): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  // Update the user profile
  const { error } = await supabase
    .from('users')
    .update({
      full_name: userData.full_name,
      whatsapp_number: userData.whatsapp_number,
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
}
export async function fetchUserData(): Promise<UserData | null> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  // Fetch user profile from the profiles table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
  
  return data;
}
