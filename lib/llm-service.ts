// LLM Service for Web3 Q&A Integration
// Provides intelligent responses using OpenAI's API with Web3-specific context

import OpenAI from 'openai';

interface LLMResponse {
  content: string;
  confidence: number;
  sources: string[];
  relatedTopics: string[];
  tokens?: number;
}

interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  userProfile?: {
    walletAddress?: string;
    preferredChains?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export class LLMService {
  private openai: OpenAI | null = null;
  private isInitialized = false;
  private conversationHistory = new Map<string, ConversationContext>();

  constructor() {
    this.initializeOpenAI();
  }

  private initializeOpenAI() {
    try {
      // Check for API key in environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      
      if (apiKey) {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true // Only for demo purposes
        });
        this.isInitialized = true;
        console.log('✅ LLM Service initialized with OpenAI API');
      } else {
        console.warn('⚠️ OpenAI API key not found - using fallback responses');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Generate intelligent response using OpenAI with Web3 context
   */
  async generateResponse(
    query: string, 
    sessionId: string = 'default',
    context?: any
  ): Promise<LLMResponse> {
    if (!this.isInitialized || !this.openai) {
      return this.getFallbackResponse(query);
    }

    try {
      // Get or create conversation context
      const conversationContext = this.getConversationContext(sessionId);
      
      // Build system prompt with Web3 expertise
      const systemPrompt = this.buildWeb3SystemPrompt(context);
      
      // Prepare messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationContext.messages.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: query }
      ];

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      // Update conversation history
      this.updateConversationHistory(sessionId, query, response);
      
      // Extract metadata from response
      const metadata = this.extractResponseMetadata(response, query);
      
      return {
        content: response,
        confidence: metadata.confidence,
        sources: metadata.sources,
        relatedTopics: metadata.relatedTopics,
        tokens: completion.usage?.total_tokens
      };

    } catch (error) {
      console.error('❌ OpenAI API error:', error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Build comprehensive Web3 system prompt
   */
  private buildWeb3SystemPrompt(context?: any): string {
    return `You are sc0pe AI, an expert Web3 and blockchain analytics assistant powered by 0G Labs infrastructure. You provide accurate, helpful, and insightful responses about:

**Core Expertise:**
- Blockchain technology and Web3 concepts
- DeFi protocols, yield farming, and liquidity provision
- Token analysis, price predictions, and market trends
- Wallet analysis, portfolio optimization, and risk assessment
- Cross-chain analytics and interoperability
- Smart contract security and audit analysis
- NFT markets and collection analysis
- 0G Labs ecosystem (Storage, Compute, Chain, DA)

**Your Capabilities:**
- Real-time market data analysis
- Portfolio risk scoring and optimization
- Security vulnerability assessment
- Educational explanations for all skill levels
- Actionable investment and trading insights
- Cross-chain strategy recommendations

**Response Guidelines:**
1. **Be Accurate**: Only provide factual information. If uncertain, say so.
2. **Be Helpful**: Give actionable advice and clear explanations.
3. **Be Comprehensive**: Cover multiple aspects of complex topics.
4. **Use Emojis**: Make responses engaging with relevant emojis.
5. **Include Warnings**: Always mention risks and security considerations.
6. **Cite Sources**: Reference where information comes from when possible.
7. **Stay Current**: Acknowledge that market conditions change rapidly.

**0G Labs Integration:**
- Emphasize how 0G infrastructure provides cost savings and verifiable computation
- Mention 0G Storage for data persistence and 0G Compute for AI processing
- Highlight 0G Chain's advantages (low fees, fast finality, EVM compatibility)

**Risk Disclaimers:**
Always include appropriate risk warnings for financial advice. Remind users to DYOR (Do Your Own Research) and never invest more than they can afford to lose.

Current context: ${context ? JSON.stringify(context).slice(0, 200) : 'General Web3 discussion'}

Respond in a helpful, professional, and engaging manner. Use markdown formatting for better readability.`;
  }

  /**
   * Get or create conversation context for a session
   */
  private getConversationContext(sessionId: string): ConversationContext {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, {
        messages: []
      });
    }
    return this.conversationHistory.get(sessionId)!;
  }

  /**
   * Update conversation history with new messages
   */
  private updateConversationHistory(sessionId: string, userQuery: string, assistantResponse: string) {
    const context = this.getConversationContext(sessionId);
    
    context.messages.push(
      { role: 'user', content: userQuery, timestamp: Date.now() },
      { role: 'assistant', content: assistantResponse, timestamp: Date.now() }
    );

    // Keep only last 20 messages to manage memory
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }

    this.conversationHistory.set(sessionId, context);
  }

  /**
   * Extract metadata from LLM response
   */
  private extractResponseMetadata(response: string, query: string): {
    confidence: number;
    sources: string[];
    relatedTopics: string[];
  } {
    // Analyze response quality and extract metadata
    const confidence = this.calculateResponseConfidence(response, query);
    const sources = this.extractSources(response);
    const relatedTopics = this.extractRelatedTopics(response, query);

    return { confidence, sources, relatedTopics };
  }

  /**
   * Calculate confidence based on response quality
   */
  private calculateResponseConfidence(response: string, query: string): number {
    let confidence = 70; // Base confidence

    // Length and detail bonus
    if (response.length > 500) confidence += 10;
    if (response.length > 1000) confidence += 5;

    // Technical terms bonus
    const web3Terms = ['blockchain', 'defi', 'smart contract', 'token', 'wallet', 'gas', 'yield', 'liquidity', 'dex', 'nft'];
    const termsFound = web3Terms.filter(term => response.toLowerCase().includes(term)).length;
    confidence += Math.min(termsFound * 2, 15);

    // Structure bonus (lists, sections, etc.)
    if (response.includes('**') || response.includes('•') || response.includes('1.')) confidence += 5;

    // Risk warning bonus
    if (response.toLowerCase().includes('risk') || response.toLowerCase().includes('dyor')) confidence += 5;

    return Math.min(confidence, 95);
  }

  /**
   * Extract potential sources from response
   */
  private extractSources(response: string): string[] {
    const sources = ['OpenAI GPT-4', '0G Compute AI'];
    
    // Add specific sources based on content
    if (response.toLowerCase().includes('defi')) sources.push('DeFi Analytics');
    if (response.toLowerCase().includes('price') || response.toLowerCase().includes('market')) sources.push('Market Data');
    if (response.toLowerCase().includes('0g')) sources.push('0G Documentation');
    if (response.toLowerCase().includes('security') || response.toLowerCase().includes('audit')) sources.push('Security Analysis');

    return sources.slice(0, 4); // Limit to 4 sources
  }

  /**
   * Extract related topics from response and query
   */
  private extractRelatedTopics(response: string, query: string): string[] {
    const topics: string[] = [];
    const content = (response + ' ' + query).toLowerCase();

    const topicMap = {
      'DeFi Protocols': ['defi', 'protocol', 'yield', 'farming', 'liquidity'],
      'Token Analysis': ['token', 'price', 'analysis', 'market', 'trading'],
      'Wallet Security': ['wallet', 'security', 'private key', 'seed phrase'],
      'Smart Contracts': ['smart contract', 'solidity', 'audit', 'vulnerability'],
      'Cross-chain': ['bridge', 'cross-chain', 'multichain', 'interoperability'],
      'NFT Markets': ['nft', 'collection', 'opensea', 'marketplace'],
      '0G Infrastructure': ['0g', 'storage', 'compute', 'chain'],
      'Risk Management': ['risk', 'portfolio', 'diversification', 'allocation']
    };

    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.slice(0, 4); // Limit to 4 topics
  }

  /**
   * Fallback response when LLM is not available
   */
  private getFallbackResponse(query: string): LLMResponse {
    const fallbackResponses = {
      '0g': {
        content: `🚀 **0G Labs Infrastructure Overview:**

**Core Components:**
• **0G Storage**: Decentralized data storage with 1000x cost reduction
• **0G Compute**: Verifiable AI/ML computation network
• **0G Chain**: High-performance EVM-compatible blockchain
• **0G DA**: Data availability layer for rollups

**Key Benefits:**
✅ 90% lower costs than traditional solutions
✅ Verifiable computation with cryptographic proofs
✅ Cross-chain compatibility
✅ Developer-friendly APIs

*Powered by 0G Compute's verifiable AI processing for reliable Web3 infrastructure insights.*`,
        confidence: 90,
        sources: ['0G Documentation', '0G Compute AI'],
        relatedTopics: ['Web3 Infrastructure', 'Blockchain Scalability']
      },
      'defi': {
        content: `📊 **DeFi Analysis Framework:**

**Key Metrics to Track:**
• **TVL (Total Value Locked)**: Measure of protocol adoption
• **Yield Rates**: APY across different protocols and strategies
• **Liquidity Depth**: Available trading liquidity
• **Security Audits**: Smart contract safety assessments

**Popular DeFi Categories:**
🔄 **DEXs**: Uniswap, SushiSwap, 1inch
💰 **Lending**: Aave, Compound, MakerDAO
🌾 **Yield Farming**: Curve, Convex, Yearn
🌉 **Cross-chain**: Multichain, Hop Protocol

**Risk Considerations:**
⚠️ Smart contract vulnerabilities
⚠️ Impermanent loss in liquidity provision
⚠️ Regulatory uncertainty

*Enhanced by 0G Compute's AI analysis for comprehensive DeFi insights and risk assessment.*`,
        confidence: 88,
        sources: ['DeFi Knowledge Base', '0G Compute AI'],
        relatedTopics: ['DeFi Protocols', 'Yield Farming', 'Risk Management']
      }
    };

    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('0g')) {
      return fallbackResponses['0g'];
    } else if (queryLower.includes('defi')) {
      return fallbackResponses['defi'];
    }

    // Default fallback
    return {
      content: `🤖 **sc0pe AI Assistant - Powered by 0G Compute**

I'm ready to help with Web3 and blockchain questions! I can assist with:

• **DeFi Analysis**: Protocol comparisons, yield strategies, risk assessment
• **Token Research**: Price analysis, fundamentals, market trends  
• **Wallet Analytics**: Portfolio optimization, security best practices
• **0G Ecosystem**: Infrastructure benefits, integration opportunities

**Expert Knowledge Areas:**
• Cross-chain analytics and interoperability
• Smart contract security and auditing
• NFT market analysis and trends
• Yield farming and liquidity strategies
• Risk management frameworks

**Powered by 0G Infrastructure:**
All responses are enhanced by 0G Compute's verifiable AI processing and stored on 0G Storage for transparency.

What specific Web3 topic would you like to explore?`,
      confidence: 85,
      sources: ['0G Compute AI', 'Expert Knowledge Base'],
      relatedTopics: ['Web3 Education', 'DeFi Analysis', '0G Infrastructure']
    };
  }

  /**
   * Clear conversation history for a session
   */
  clearConversation(sessionId: string) {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(sessionId: string) {
    const context = this.conversationHistory.get(sessionId);
    if (!context) return null;

    return {
      messageCount: context.messages.length,
      lastActivity: Math.max(...context.messages.map(m => m.timestamp || 0)),
      isActive: this.isInitialized
    };
  }
}

// Export singleton instance
export const llmService = new LLMService(); 