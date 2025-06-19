import OGStorageClient from "./og-storage"

// Chat storage manager
export class ChatStorageManager {
  private storageClient: OGStorageClient
  private sessionHashes: Map<string, string> = new Map()

  constructor(privateKey: string) {
    this.storageClient = new OGStorageClient(privateKey)
  }

  // Auto-save chat sessions
  async autoSaveChatSession(sessionId: string, messages: any[]) {
    try {
      // Only save every 5 messages or when session ends
      if (messages.length % 5 === 0 || messages[messages.length - 1]?.type === "session_end") {
        const result = await this.storageClient.storeChatSession(sessionId, messages)

        if (result.success) {
          this.sessionHashes.set(sessionId, result.rootHash!)
          console.log(`Chat session ${sessionId} saved to 0G Storage: ${result.rootHash}`)
        }

        return result
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
      return { success: false, error: error.message }
    }
  }

  // Load previous chat history
  async loadChatHistory(sessionId: string) {
    try {
      const rootHash = this.sessionHashes.get(sessionId)
      if (!rootHash) {
        return { success: false, error: "No saved session found" }
      }

      return await this.storageClient.retrieveChatSession(rootHash)
    } catch (error) {
      console.error("Load chat history failed:", error)
      return { success: false, error: error.message }
    }
  }

  // Store AI training data
  async storeAITrainingData(interactions: any[]) {
    try {
      const trainingData = {
        interactions,
        generatedAt: new Date().toISOString(),
        purpose: "ai_training",
        anonymized: true,
      }

      return await this.storageClient.storeKnowledgeBase(trainingData)
    } catch (error) {
      console.error("Store training data failed:", error)
      return { success: false, error: error.message }
    }
  }
}
