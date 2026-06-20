/**
 * A bank of guided journal prompts.
 * Users often don't know what to write - this rotates a thoughtful
 * prompt each day so the blank page feels less intimidating.
 */
const PROMPTS = [
  'What made you smile today?',
  'What is one thing you are grateful for right now?',
  'Describe a moment today when you felt at peace.',
  'What is weighing on your mind right now? Let it out here.',
  'Name three things that went well today, however small.',
  'What would you tell a friend who felt the way you feel right now?',
  'What is something you are looking forward to?',
  'When did you last feel truly relaxed? What were you doing?',
  'What is one kind thing you did for yourself or someone else today?',
  'If today had a color, what would it be and why?',
  'What is something you want to let go of before you sleep tonight?',
  'What gave you energy today, and what drained it?',
  'Write about a small win from today.',
  'What does your body need right now?',
  'What is one thought you keep returning to today?',
];

/**
 * Returns a prompt based on the day of the year, so every user sees
 * the same "prompt of the day" and it rotates daily without needing
 * to store state in the database.
 */
function getPromptOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return PROMPTS[dayOfYear % PROMPTS.length];
}

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

module.exports = { PROMPTS, getPromptOfTheDay, getRandomPrompt };
