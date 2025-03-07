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
  description: string | null;
  video_url: string | null;
  created_at: string;
}

export interface Podcast {
  id: string;
  number: number;
  title: string;
  description: string | null;
  audio_url: string | null;
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

export interface Donation {
  id: string;
  donor_id: string | null;
  user_id: string;
  amount: number;
  created_at: string;
  display_name: string;
  message: string | null;
  is_anonymous: boolean;
}

export interface CommunityComment {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
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

export async function getTrainingModules(): Promise<TrainingModule[]> {
  try {
    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .order('number');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getTrainingModules');
    return [];
  }
}

export async function getPodcasts(): Promise<Podcast[]> {
  try {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('number');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getPodcasts');
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

export async function getComments(): Promise<CommunityComment[]> {
  try {
    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select(`
        *,
        user:users(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (commentsError) throw commentsError;

    // Fetch reactions for each comment
    const commentsWithReactions = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: reactions, error: reactionsError } = await supabase
          .from('comment_reactions')
          .select('*')
          .eq('comment_id', comment.id);

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

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

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

export async function getTopDonors(): Promise<UserRank[]> {
  try {
    const { data, error } = await supabase
      .from('user_ranks')
      .select(`
        *,
        user:users(
          full_name,
          avatar_url
        )
      `)
      .order('rank_position')
      .limit(5);

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'getTopDonors');
    return [];
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

export async function createComment(
  content: string,
  image_url?: string
): Promise<CommunityComment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        user_id: user.id,
        content,
        image_url
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
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .order('created_at');

    if (error) throw error;
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