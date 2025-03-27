class ChatEngine {
  constructor() {
    this.context = {
      lastTopic: null,
      emotionalState: null,
      conversationDepth: 0,
      userHistory: [],
      currentTheme: null,
      lastResponse: null,
      sessionStartTime: new Date(),
    };
    
    this.patterns = [
      {
        pattern: /(?:i am|i'm) (?:feeling|sad|happy|angry|anxious|depressed|worried|stressed|overwhelmed|frustrated|lonely|confused|excited|peaceful|calm)/i,
        response: (match) => {
          const emotion = match[0].split(' ').pop();
          this.context.emotionalState = emotion;
          this.context.currentTheme = 'emotional_state';
          
          const responses = {
            sad: "I hear that you're feeling sad. Would you like to talk about what's causing these feelings?",
            happy: "I'm glad you're feeling happy. What's contributing to your positive mood?",
            angry: "Feeling angry can be really challenging. Would you like to explore what triggered these feelings?",
            anxious: "Anxiety can be really difficult to deal with. Would you like to talk about what's making you feel this way?",
            depressed: "I hear that you're feeling depressed. Would you like to talk about what's on your mind?",
            worried: "Worry can be really consuming. Would you like to explore what's causing these concerns?",
            stressed: "Stress can be really overwhelming. Would you like to talk about what's causing this stress?",
            overwhelmed: "Feeling overwhelmed can be really difficult. Would you like to break down what's happening?",
            frustrated: "Frustration can be really challenging. Would you like to talk about what's causing this?",
            lonely: "Loneliness can be really painful. Would you like to talk about what's making you feel this way?",
            confused: "Confusion can be really unsettling. Would you like to explore what's unclear?",
            excited: "I'm glad you're feeling excited! What's contributing to your enthusiasm?",
            peaceful: "That's wonderful that you're feeling peaceful. What's helping you maintain this state?",
            calm: "It's good that you're feeling calm. What's contributing to your sense of calm?"
          };
          
          return responses[emotion] || "I hear that you're feeling this way. Would you like to tell me more about what's causing these feelings?";
        }
      },
      {
        pattern: /(?:i feel|i am feeling) (?:like|that) (.+)/i,
        response: (match) => {
          const feeling = match[1];
          this.context.currentTheme = 'feeling_expression';
          return `That's interesting that you feel ${feeling}. Can you tell me more about what makes you feel this way? What situations or thoughts trigger these feelings?`;
        }
      },
      {
        pattern: /(?:my|i have) (?:problem|issue|trouble|challenge) (?:is|with) (.+)/i,
        response: (match) => {
          const problem = match[1];
          this.context.lastTopic = problem;
          this.context.currentTheme = 'problem_statement';
          return `I understand you're dealing with ${problem}. How has this been affecting your daily life? What have you tried so far to address this?`;
        }
      },
      {
        pattern: /(?:i don't|i do not) (?:know|understand) (.+)/i,
        response: (match) => {
          const uncertainty = match[1];
          this.context.currentTheme = 'uncertainty';
          return `It's okay to feel uncertain about ${uncertainty}. What have you tried so far to understand it better? What would help you feel more clear about this?`;
        }
      },
      {
        pattern: /(?:i want|i need) (.+)/i,
        response: (match) => {
          const desire = match[1];
          this.context.currentTheme = 'desire';
          return `You mentioned wanting ${desire}. What would having that mean to you? How do you think it would improve your situation?`;
        }
      },
      {
        pattern: /(?:yes|yeah|yep)/i,
        response: () => {
          this.context.conversationDepth++;
          if (this.context.currentTheme) {
            return `Could you tell me more about that? What specific aspects would you like to explore?`;
          }
          return "Could you tell me more about that?";
        }
      },
      {
        pattern: /(?:no|nope|nah)/i,
        response: () => {
          if (this.context.currentTheme) {
            return `I understand. Would you like to explore a different aspect of this, or would you prefer to talk about something else?`;
          }
          return "I understand. Would you like to explore a different topic?";
        }
      },
      {
        pattern: /(?:i think|i believe) (.+)/i,
        response: (match) => {
          const thought = match[1];
          this.context.currentTheme = 'thought_expression';
          return `That's interesting that you think ${thought}. What led you to this conclusion? How does this belief affect your actions?`;
        }
      },
      {
        pattern: /(?:i can't|i cannot) (.+)/i,
        response: (match) => {
          const limitation = match[1];
          this.context.currentTheme = 'limitation';
          return `You mentioned you can't ${limitation}. What makes you feel this way? What have you tried so far?`;
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

    this.contextualResponses = {
      emotional_state: [
        "How long have you been feeling this way?",
        "What situations tend to trigger these feelings?",
        "How do you typically cope with these feelings?",
        "What would help you feel better?",
        "Who do you usually talk to about these feelings?"
      ],
      problem_statement: [
        "How has this affected your daily life?",
        "What have you tried so far to address this?",
        "What would you like to see change?",
        "What support would be helpful right now?",
        "How do you feel about seeking help with this?"
      ],
      uncertainty: [
        "What have you tried to understand this better?",
        "What would help you feel more clear?",
        "What information would be most helpful?",
        "Who could help you understand this better?",
        "What's the most challenging part about this uncertainty?"
      ],
      desire: [
        "What would having that mean to you?",
        "How would that improve your situation?",
        "What steps could you take toward this?",
        "What's stopping you from achieving this?",
        "How would you feel if you achieved this?"
      ]
    };
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
        const response = pattern.response(match);
        this.context.lastResponse = response;
        return response;
      }
    }

    // Generate contextual response based on conversation history
    if (this.context.currentTheme && this.contextualResponses[this.context.currentTheme]) {
      const responses = this.contextualResponses[this.context.currentTheme];
      const randomIndex = Math.floor(Math.random() * responses.length);
      const response = responses[randomIndex];
      this.context.lastResponse = response;
      return response;
    }

    // If we have a last topic, try to maintain context
    if (this.context.lastTopic) {
      const response = `You mentioned ${this.context.lastTopic} earlier. How are you feeling about that now?`;
      this.context.lastResponse = response;
      return response;
    }

    // Fallback to random response if no patterns match
    const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
    const response = this.fallbackResponses[randomIndex];
    this.context.lastResponse = response;
    return response;
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
      currentTheme: null,
      lastResponse: null,
      sessionStartTime: new Date(),
    };
  }
}

export default ChatEngine; 