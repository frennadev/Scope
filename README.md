# 0scope - Web3 Analytics Dashboard

A comprehensive Web3 analytics platform powered by 0G Labs infrastructure, featuring AI-driven insights, cross-chain portfolio analysis, and intelligent chatbot capabilities.

## 🚀 Features

### Core Analytics
- **Wallet Analysis**: Multi-chain portfolio tracking with AI-powered risk assessment
- **Token Analysis**: Real-time price analysis, risk scoring, and market predictions
- **DeFi Insights**: Protocol performance tracking and yield optimization
- **Cross-Chain Support**: Ethereum, 0G Chain, Base, Polygon, BSC

### AI-Powered Features
- **Intelligent Chatbot**: OpenAI GPT-4 integration for Web3 Q&A
- **Risk Scoring**: AI-driven portfolio and token risk assessment
- **Market Predictions**: ML-based price forecasting with confidence intervals
- **Portfolio Optimization**: Automated diversification recommendations

### 0G Labs Integration
- **0G Storage**: Decentralized data persistence with 1000x cost reduction
- **0G Compute**: Verifiable AI computation with cryptographic proofs
- **0G Chain**: Low-cost transactions and emerging DeFi ecosystem
- **0G DA**: High-availability data layer for rollups

## 🤖 AI Chatbot Setup

The Web3 Q&A chatbot supports two modes:

### 1. Full AI Mode (OpenAI GPT-4)
Advanced conversational AI with context awareness, conversation memory, and real-time data integration.

**Setup:**
1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Copy `env.example` to `.env.local`
3. Add your API key:
   ```bash
   OPENAI_API_KEY=your_api_key_here
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```
4. Restart the development server

**Features:**
- Context-aware responses based on conversation history
- Real-time Web3 data integration
- Advanced reasoning and analysis
- Personalized recommendations
- Multi-turn conversations with memory

### 2. Fallback Mode
Curated responses for common Web3 questions when OpenAI API is not configured.

**Features:**
- Pre-built responses for popular topics
- 0G Labs ecosystem information
- Basic DeFi and Web3 education
- No API key required

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/frennadev/Scope.git
cd 0scope-2m

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Configure your keys in .env.local
# - ZEROG_PRIVATE_KEY: Your 0G Storage private key
# - OPENAI_API_KEY: Your OpenAI API key (optional)

# Start development server
npm run dev
```

## 📋 Environment Configuration

```bash
# 0G Storage Configuration (Required)
ZEROG_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_ZEROG_PRIVATE_KEY=your_private_key_here

# OpenAI API Configuration (Optional - for advanced AI features)
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# 0G Network Configuration (Optional - defaults provided)
# ZEROG_RPC_URL=https://evmrpc-testnet.0g.ai/
# ZEROG_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
# ZEROG_KV_RPC=http://3.101.147.150:6789
```

## 🏗️ Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### AI & Analytics
- **OpenAI GPT-4**: Advanced language model for conversational AI
- **Custom AI Services**: Risk scoring, market analysis, portfolio optimization
- **Real-time Data**: Live market feeds and blockchain data

### Blockchain Integration
- **0G Labs SDK**: Native integration with 0G infrastructure
- **Ethers.js**: Ethereum and EVM chain interactions
- **Moralis**: Multi-chain data aggregation
- **Cross-chain APIs**: Bridge data and analytics

## 🔧 API Routes

### `/api/chat` - AI Chatbot
Handles LLM requests server-side for security and performance.

**Request:**
```json
{
  "query": "What are the best DeFi strategies for 2024?",
  "sessionId": "user-session-id",
  "context": {
    "source": "web3-qa-page",
    "timestamp": 1704067200000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Based on current market conditions...",
    "confidence": 87,
    "sources": ["OpenAI GPT-4", "DeFi Analytics"],
    "relatedTopics": ["DeFi Strategy", "Yield Farming"],
    "tokens": 245
  }
}
```

## 🎯 Usage Examples

### Basic Wallet Analysis
```javascript
// Analyze a wallet address
const analysis = await analyzeWallet("0x742d35Cc6634C0532925a3b8D2C9b4c4b91c2c1f")
console.log(analysis.riskScore) // 0-100 risk rating
console.log(analysis.diversificationScore) // Portfolio diversity
```

### AI-Powered Token Research
```javascript
// Get AI insights for a token
const insights = await getTokenInsights("0xA0b86a33E6441B8a4B0B6C5E6F7d0e2C2F7d8e9f")
console.log(insights.riskAssessment) // AI risk analysis
console.log(insights.pricePredicition) // ML-based forecast
```

### Chat with AI Assistant
```javascript
// Send a question to the AI
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    query: "How do I optimize my DeFi portfolio?",
    sessionId: "my-session"
  })
})
```

## 🔐 Security Features

- **Server-side API Keys**: OpenAI API key never exposed to client
- **Input Validation**: All user inputs sanitized and validated
- **Rate Limiting**: API request throttling to prevent abuse
- **Error Handling**: Graceful fallbacks for all failure scenarios
- **0G Compute Verification**: Cryptographic proofs for AI responses

## 📊 Performance Optimizations

- **Caching**: Response caching with 0G Storage
- **Lazy Loading**: Component-based code splitting
- **API Optimization**: Efficient data fetching and aggregation
- **Real-time Updates**: WebSocket connections for live data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **0G Labs** for providing the infrastructure foundation
- **OpenAI** for GPT-4 language model capabilities
- **Next.js** team for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Documentation**: [0G Labs Docs](https://docs.0g.ai)
- **Discord**: [0G Labs Community](https://discord.gg/0glabs)
- **GitHub Issues**: [Report bugs and request features](https://github.com/frennadev/Scope/issues)

---

Built with ❤️ by the 0scope team, powered by 0G Labs infrastructure.
