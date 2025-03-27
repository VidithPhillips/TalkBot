class ChatEngine {
  constructor() {
    this.context = {
      lastTopic: null,
      emotionalState: null,
      conversationDepth: 0,
      userHistory: [],
    };
    
    this.patterns = [
      {
        pattern: /(?:i am|i'm) (?:feeling|sad|happy|angry|anxious|depressed|worried|stressed)/i,
        response: (match) => {
          const emotion = match[0].split(' ').pop();
          this.context.emotionalState = emotion;
          return `I hear that you're feeling ${emotion}. Would you like to tell me more about what's causing these feelings?`;
        }
      },
      {
        pattern: /(?:i feel|i am feeling) (?:like|that) (.+)/i,
        response: (match) => {
          const feeling = match[1];
          return `That's interesting that you feel ${feeling}. Can you elaborate on what makes you feel this way?`;
        }
      },
      {
        pattern: /(?:my|i have) (?:problem|issue|trouble) (?:is|with) (.+)/i,
        response: (match) => {
          const problem = match[1];
          this.context.lastTopic = problem;
          return `I understand you're dealing with ${problem}. How has this been affecting your daily life?`;
        }
      },
      {
        pattern: /(?:i don't|i do not) (?:know|understand) (.+)/i,
        response: (match) => {
          const uncertainty = match[1];
          return `It's okay to feel uncertain about ${uncertainty}. What have you tried so far to understand it better?`;
        }
      },
      {
        pattern: /(?:i want|i need) (.+)/i,
        response: (match) => {
          const desire = match[1];
          return `You mentioned wanting ${desire}. What would having that mean to you?`;
        }
      },
      {
        pattern: /(?:yes|yeah|yep)/i,
        response: () => {
          this.context.conversationDepth++;
          return "Could you tell me more about that?";
        }
      },
      {
        pattern: /(?:no|nope|nah)/i,
        response: () => {
          return "I understand. Would you like to explore a different aspect of this?";
        }
      }
    ];

    this.fallbackResponses = [
      "I hear you. Could you tell me more about that?",
      "That's interesting. How does that make you feel?",
      "I understand. What do you think about that?",
      "Could you elaborate on that?",
      "What do you mean by that?",
      "How does that affect you?",
      "What would you like to explore about this?",
      "I'm here to listen. What's on your mind?",
      "That sounds challenging. How have you been coping?",
      "What do you think might help in this situation?"
    ];
  }

  processInput(input) {
    // Store user input in history
    this.context.userHistory.push(input);
    
    // Clean and normalize input
    const cleanInput = input.trim().toLowerCase();
    
    // Check for patterns
    for (const pattern of this.patterns) {
      const match = cleanInput.match(pattern.pattern);
      if (match) {
        return pattern.response(match);
      }
    }

    // Generate contextual response based on conversation history
    if (this.context.lastTopic) {
      return `You mentioned ${this.context.lastTopic} earlier. How are you feeling about that now?`;
    }

    // Fallback to random response if no patterns match
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    return this.fallbackResponses[randomIndex];
  }

  getContext() {
    return this.context;
  }

  resetContext() {
    this.context = {
      lastTopic: null,
      emotionalState: null,
      conversationDepth: 0,
      userHistory: [],
    };
  }
}

export default ChatEngine; 