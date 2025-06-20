#!/bin/bash

# Setup script for OpenAI API key integration
# This script will create the .env.local file with your OpenAI API key

echo "🚀 Setting up OpenAI GPT-4 integration for 0scope..."

# Create .env.local from template
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from template"
else
    echo "⚠️  .env.local already exists, backing up..."
    cp .env.local .env.local.backup
fi

# Add OpenAI API key
OPENAI_KEY="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"

# Update the API key in .env.local
sed -i.bak "s/OPENAI_API_KEY=your_openai_api_key_here/OPENAI_API_KEY=$OPENAI_KEY/" .env.local
sed -i.bak "s/NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here/NEXT_PUBLIC_OPENAI_API_KEY=$OPENAI_KEY/" .env.local

echo "✅ OpenAI API key configured successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Navigate to the Web3 Q&A page"
echo "3. You should see 'OpenAI GPT-4 Enabled' status"
echo ""
echo "🎉 Your chatbot now has full AI capabilities!"
echo "   - Context-aware responses"
echo "   - Conversation memory"
echo "   - Advanced Web3 analysis"
echo "   - Real-time data integration"

# Clean up backup files
rm -f .env.local.bak 