#!/usr/bin/env node

// Test script to demonstrate OpenAI integration
// This directly tests the LLM service with the configured API key

const { llmService } = require('./lib/llm-service.ts');

async function testOpenAIIntegration() {
  console.log('🚀 Testing OpenAI GPT-4 Integration for 0scope Web3 Q&A\n');

  const testQueries = [
    {
      query: "What is DeFi yield farming and what are the main risks?",
      description: "Complex DeFi question to test AI reasoning"
    },
    {
      query: "How does 0G Labs compare to other Web3 infrastructure providers?",
      description: "0G Labs specific question"
    },
    {
      query: "What are the best strategies for portfolio diversification in crypto?",
      description: "Investment strategy question"
    }
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const { query, description } = testQueries[i];
    
    console.log(`📝 Test ${i + 1}: ${description}`);
    console.log(`❓ Query: "${query}"`);
    console.log('⏳ Processing...\n');

    try {
      const response = await llmService.generateResponse(query, `test-session-${i}`);
      
      console.log('✅ Response received:');
      console.log(`📊 Confidence: ${response.confidence}%`);
      console.log(`📚 Sources: ${response.sources.join(', ')}`);
      console.log(`🏷️  Topics: ${response.relatedTopics.join(', ')}`);
      console.log(`💬 Content (first 200 chars): ${response.content.substring(0, 200)}...`);
      
      if (response.tokens) {
        console.log(`🔢 Tokens used: ${response.tokens}`);
      }
      
      console.log('\n' + '─'.repeat(80) + '\n');
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.log('\n' + '─'.repeat(80) + '\n');
    }
  }

  console.log('🎉 OpenAI Integration Test Complete!');
  console.log('\n💡 To use in the Web3 Q&A interface:');
  console.log('1. Navigate to http://localhost:3000/web3-qa');
  console.log('2. Look for "OpenAI GPT-4 Enabled" status badge');
  console.log('3. Ask any Web3 question and get intelligent responses!');
}

// Run the test
testOpenAIIntegration().catch(console.error); 