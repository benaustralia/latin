import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These environment variables should be defined in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Records a user's answer to the database
 * @param {string} userId - Identifier for the user
 * @param {string} question - The question text
 * @param {string} answer - The user's answer
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Promise} - A promise resolving to the inserted data
 */
export async function recordAnswer(userId, question, answer, isCorrect) {
  const { data, error } = await supabase
    .from('user_answers')
    .insert([
      { 
        user_id: userId, 
        question: question, 
        answer: answer, 
        correct: isCorrect 
      }
    ]);
  
  if (error) {
    console.error('Error saving answer:', error);
    throw error;
  }
  
  return data;
}

/**
 * Generates a simple anonymous user ID if one doesn't exist yet
 * @returns {string} - User ID
 */
export function getAnonymousUserId() {
  // Check if we already have a user ID in local storage
  let userId = localStorage.getItem('anonymousUserId');
  
  // If not, create a new one
  if (!userId) {
    userId = 'anon_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('anonymousUserId', userId);
  }
  
  return userId;
}