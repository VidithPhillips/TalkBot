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
      isGreeting: true,
      hasGreeted: false,
      conversationStage: 'initial',
      lastInteractionTime: new Date(),
      memory: {
        topics: [],
        emotions: [],
        concerns: [],
        goals: [],
        copingStrategies: [],
        supportSystems: []
      },
      currentFocus: null,
      previousFocus: null,
      therapeuticTechniques: {
        activeListening: true,
        reflection: true,
        openQuestions: true,
        validation: true
      }
    };
    
    this.patterns = [
      // Greeting patterns with context awareness
      {
        pattern: /^(?:hi|hello|hey|greetings|good (?:morning|afternoon|evening))/i,
        response: (match) => {
          this.context.hasGreeted = true;
          this.context.isGreeting = false;
          this.context.conversationStage = 'initial';
          const timeOfDay = new Date().getHours();
          let greeting = '';
          
          // Check if this is a returning user
          const isReturningUser = this.context.memory.topics.length > 0;
          
          if (timeOfDay < 12) {
            greeting = isReturningUser 
              ? "Good morning! Welcome back. How have you been since our last conversation?"
              : "Good morning! I'm here to listen and support you. How are you feeling today?";
          } else if (timeOfDay < 17) {
            greeting = isReturningUser
              ? "Good afternoon! Welcome back. How have you been since our last conversation?"
              : "Good afternoon! I'm here to listen and support you. How are you feeling today?";
          } else {
            greeting = isReturningUser
              ? "Good evening! Welcome back. How have you been since our last conversation?"
              : "Good evening! I'm here to listen and support you. How are you feeling today?";
          }
          
          return greeting;
        }
      },
      {
        pattern: /^(?:bye|goodbye|see you|take care|farewell)/i,
        response: () => {
          this.context.conversationStage = 'closing';
          return "Take care of yourself. Remember, I'm here if you need to talk again. Have a good day!";
        }
      },
      // Emotional state patterns with memory
      {
        pattern: /(?:i am|i'm) (?:feeling|sad|happy|angry|anxious|depressed|worried|stressed|overwhelmed|frustrated|lonely|confused|excited|peaceful|calm)/i,
        response: (match) => {
          const emotion = match[0].split(' ').pop();
          this.context.emotionalState = emotion;
          this.context.currentTheme = 'emotional_state';
          this.context.conversationStage = 'exploring';
          
          // Add emotion to memory
          if (!this.context.memory.emotions.includes(emotion)) {
            this.context.memory.emotions.push(emotion);
          }
          
          // Check for emotional patterns
          const emotionalPattern = this.analyzeEmotionalPattern();
          
          const responses = {
            sad: emotionalPattern 
              ? "I notice you've been feeling sad lately. Would you like to talk about what's been contributing to these feelings?"
              : "I hear that you're feeling sad. Would you like to talk about what's causing these feelings?",
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
      // Feeling expression patterns
      {
        pattern: /(?:i feel|i am feeling) (?:like|that) (.+)/i,
        response: (match) => {
          const feeling = match[1];
          this.context.currentTheme = 'feeling_expression';
          this.context.conversationStage = 'exploring';
          return `That's interesting that you feel ${feeling}. Can you tell me more about what makes you feel this way? What situations or thoughts trigger these feelings?`;
        }
      },
      // Problem statement patterns with memory
      {
        pattern: /(?:my|i have) (?:problem|issue|trouble|challenge) (?:is|with) (.+)/i,
        response: (match) => {
          const problem = match[1];
          this.context.lastTopic = problem;
          this.context.currentTheme = 'problem_statement';
          this.context.conversationStage = 'deep_discussion';
          
          // Add to memory
          if (!this.context.memory.concerns.includes(problem)) {
            this.context.memory.concerns.push(problem);
          }
          
          // Check if this is a recurring concern
          const isRecurring = this.context.memory.concerns.filter(c => c === problem).length > 1;
          
          return isRecurring
            ? `I notice this concern about ${problem} has come up before. Would you like to explore what's changed since we last discussed this?`
            : `I understand you're dealing with ${problem}. How has this been affecting your daily life? What have you tried so far to address this?`;
        }
      },
      // Uncertainty patterns
      {
        pattern: /(?:i don't|i do not) (?:know|understand) (.+)/i,
        response: (match) => {
          const uncertainty = match[1];
          this.context.currentTheme = 'uncertainty';
          this.context.conversationStage = 'exploring';
          return `It's okay to feel uncertain about ${uncertainty}. What have you tried so far to understand it better? What would help you feel more clear about this?`;
        }
      },
      // Goal or desire patterns with memory
      {
        pattern: /(?:i want|i need|i would like|my goal is) (.+)/i,
        response: (match) => {
          const goal = match[1];
          this.context.currentTheme = 'desire';
          this.context.conversationStage = 'deep_discussion';
          
          // Add to memory
          if (!this.context.memory.goals.includes(goal)) {
            this.context.memory.goals.push(goal);
          }
          
          return `You mentioned wanting ${goal}. What would having that mean to you? How do you think it would improve your situation? What steps could you take toward this?`;
        }
      },
      // Thought expression patterns
      {
        pattern: /(?:i think|i believe) (.+)/i,
        response: (match) => {
          const thought = match[1];
          this.context.currentTheme = 'thought_expression';
          this.context.conversationStage = 'deep_discussion';
          return `That's interesting that you think ${thought}. What led you to this conclusion? How does this belief affect your actions?`;
        }
      },
      // Limitation patterns
      {
        pattern: /(?:i can't|i cannot) (.+)/i,
        response: (match) => {
          const limitation = match[1];
          this.context.currentTheme = 'limitation';
          this.context.conversationStage = 'deep_discussion';
          return `You mentioned you can't ${limitation}. What makes you feel this way? What have you tried so far?`;
        }
      },
      // Yes/No responses
      {
        pattern: /^(?:yes|yeah|yep)$/i,
        response: () => {
          this.context.conversationDepth++;
          if (this.context.currentTheme) {
            return `Could you tell me more about that? What specific aspects would you like to explore?`;
          }
          return "Could you tell me more about that?";
        }
      },
      {
        pattern: /^(?:no|nope|nah)$/i,
        response: () => {
          if (this.context.currentTheme) {
            return `I understand. Would you like to explore a different aspect of this, or would you prefer to talk about something else?`;
          }
          return "I understand. Would you like to explore a different topic?";
        }
      },
      // Coping strategy patterns
      {
        pattern: /(?:i (?:try to|usually|often) (?:cope|deal|handle) (?:by|with) (.+)|when i feel .+ i (?:try to|usually|often) (.+))/i,
        response: (match) => {
          const strategy = match[1] || match[2];
          this.context.currentTheme = 'coping';
          
          // Add to memory
          if (!this.context.memory.copingStrategies.includes(strategy)) {
            this.context.memory.copingStrategies.push(strategy);
          }
          
          return `That's interesting that you try to ${strategy}. How effective has this been for you? What other strategies have you considered?`;
        }
      },
      // Support system patterns
      {
        pattern: /(?:i (?:talk to|get help from|rely on|depend on) (.+)|(?:my|i have) (?:support|help) (?:from|with) (.+))/i,
        response: (match) => {
          const support = match[1] || match[2];
          this.context.currentTheme = 'support';
          
          // Add to memory
          if (!this.context.memory.supportSystems.includes(support)) {
            this.context.memory.supportSystems.push(support);
          }
          
          return `It's good that you have support from ${support}. How has this been helpful? What other sources of support might be available to you?`;
        }
      }
    ];

    this.fallbackResponses = {
      initial: [
        "I'm here to listen and support you. How are you feeling today?",
        "How can I help you today?",
        "What's on your mind?",
        "I'm here to talk. What would you like to discuss?",
        "How are you feeling right now?"
      ],
      exploring: [
        "Could you tell me more about that?",
        "How does that make you feel?",
        "What do you think about that?",
        "Could you elaborate on that?",
        "What do you mean by that?"
      ],
      deep_discussion: [
        "How does that affect your daily life?",
        "What would you like to see change?",
        "What support would be helpful right now?",
        "How have you been coping with this?",
        "What do you think might help in this situation?"
      ],
      closing: [
        "Take care of yourself.",
        "I'm here if you need to talk again.",
        "Have a good day!",
        "Take it easy.",
        "Wishing you well."
      ]
    };

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
      ],
      coping: [
        "How effective has this strategy been for you?",
        "What other coping strategies have you considered?",
        "What makes this strategy work well for you?",
        "How could you enhance this coping strategy?",
        "What support do you need to maintain this strategy?"
      ],
      support: [
        "How has this support been helpful?",
        "What other sources of support might be available?",
        "How do you feel about reaching out for support?",
        "What kind of support would be most helpful right now?",
        "How can you strengthen your support system?"
      ]
    };
  }

  analyzeEmotionalPattern() {
    const recentEmotions = this.context.memory.emotions.slice(-3);
    return recentEmotions.length >= 2 && recentEmotions.every(e => e === this.context.emotionalState);
  }

  processInput(input) {
    // Update last interaction time
    this.context.lastInteractionTime = new Date();
    
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

    // If no greeting yet and no pattern matched, initiate greeting
    if (!this.context.hasGreeted && !this.context.isGreeting) {
      this.context.isGreeting = true;
      return "Hello! I'm here to listen and support you. How are you feeling today?";
    }

    // Generate contextual response based on conversation stage and theme
    if (this.context.currentTheme) {
      const responses = this.getContextualResponses();
      if (responses && responses.length > 0) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        const response = responses[randomIndex];
        this.context.lastResponse = response;
        return response;
      }
    }

    // If we have a last topic, try to maintain context
    if (this.context.lastTopic) {
      const response = `You mentioned ${this.context.lastTopic} earlier. How are you feeling about that now?`;
      this.context.lastResponse = response;
      return response;
    }

    // Fallback to stage-appropriate response
    const stageResponses = this.fallbackResponses[this.context.conversationStage];
    const randomIndex = Math.floor(Math.random() * stageResponses.length);
    const response = stageResponses[randomIndex];
    this.context.lastResponse = response;
    return response;
  }

  getContextualResponses() {
    const responses = {
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
      desire: [
        "What would having that mean to you?",
        "How would that improve your situation?",
        "What steps could you take toward this?",
        "What's stopping you from achieving this?",
        "How would you feel if you achieved this?"
      ],
      coping: [
        "How effective has this strategy been for you?",
        "What other coping strategies have you considered?",
        "What makes this strategy work well for you?",
        "How could you enhance this coping strategy?",
        "What support do you need to maintain this strategy?"
      ],
      support: [
        "How has this support been helpful?",
        "What other sources of support might be available?",
        "How do you feel about reaching out for support?",
        "What kind of support would be most helpful right now?",
        "How can you strengthen your support system?"
      ]
    };

    return responses[this.context.currentTheme];
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
      isGreeting: true,
      hasGreeted: false,
      conversationStage: 'initial',
      lastInteractionTime: new Date(),
      memory: {
        topics: [],
        emotions: [],
        concerns: [],
        goals: [],
        copingStrategies: [],
        supportSystems: []
      },
      currentFocus: null,
      previousFocus: null,
      therapeuticTechniques: {
        activeListening: true,
        reflection: true,
        openQuestions: true,
        validation: true
      }
    };
  }
}

export default ChatEngine; 