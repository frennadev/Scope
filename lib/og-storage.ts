import { Indexer, ZgFile } from "@0glabs/0g-ts-sdk"
import { ethers } from "ethers"

// 0G Storage configuration
const RPC_URL = "https://evmrpc-testnet.0g.ai/"
const INDEXER_RPC = "https://indexer-storage-testnet-standard.0g.ai"

// Initialize storage client
class OGStorageClient {
  private indexer: Indexer
  private signer: ethers.Wallet

  constructor(privateKey: string) {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    this.signer = new ethers.Wallet(privateKey, provider)
    this.indexer = new Indexer(INDEXER_RPC)
  }

  // Store chat session
  async storeChatSession(sessionId: string, messages: any[]) {
    try {
      const chatData = {
        sessionId,
        messages,
        timestamp: new Date().toISOString(),
        version: "1.0",
      }

      const zgFile = await ZgFile.fromBuffer(Buffer.from(JSON.stringify(chatData, null, 2)))

      const [tree, treeErr] = await zgFile.merkleTree()
      if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)

      const [tx, uploadErr] = await this.indexer.upload(zgFile, RPC_URL, this.signer)
      if (uploadErr) throw new Error(`Upload error: ${uploadErr}`)

      return {
        rootHash: tree?.rootHash(),
        transactionHash: tx,
        success: true,
      }
    } catch (error) {
      console.error("Error storing chat session:", error)
      return { success: false, error: error.message }
    }
  }

  // Retrieve chat session
  async retrieveChatSession(rootHash: string) {
    try {
      const tempPath = `/tmp/chat-${rootHash}.json`
      const err = await this.indexer.download(rootHash, tempPath, true)

      if (err) throw new Error(`Download error: ${err}`)

      // Read and parse the downloaded file
      const fs = await import("fs")
      const fileContent = fs.readFileSync(tempPath, "utf8")
      const chatData = JSON.parse(fileContent)

      // Cleanup temp file
      fs.unlinkSync(tempPath)

      return { success: true, data: chatData }
    } catch (error) {
      console.error("Error retrieving chat session:", error)
      return { success: false, error: error.message }
    }
  }

  // Store knowledge base updates
  async storeKnowledgeBase(data: any) {
    try {
      const knowledgeData = {
        ...data,
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      }

      const zgFile = await ZgFile.fromBuffer(Buffer.from(JSON.stringify(knowledgeData, null, 2)))

      const [tree, treeErr] = await zgFile.merkleTree()
      if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)

      const [tx, uploadErr] = await this.indexer.upload(zgFile, RPC_URL, this.signer)
      if (uploadErr) throw new Error(`Upload error: ${uploadErr}`)

      return {
        rootHash: tree?.rootHash(),
        transactionHash: tx,
        success: true,
      }
    } catch (error) {
      console.error("Error storing knowledge base:", error)
      return { success: false, error: error.message }
    }
  }

  // Store user analytics and preferences
  async storeUserAnalytics(userId: string, analytics: any) {
    try {
      const analyticsData = {
        userId,
        analytics,
        timestamp: new Date().toISOString(),
        privacy: "encrypted", // Could implement encryption here
      }

      const zgFile = await ZgFile.fromBuffer(Buffer.from(JSON.stringify(analyticsData, null, 2)))

      const [tree, treeErr] = await zgFile.merkleTree()
      if (treeErr) throw new Error(`Merkle tree error: ${treeErr}`)

      const [tx, uploadErr] = await this.indexer.upload(zgFile, RPC_URL, this.signer)
      if (uploadErr) throw new Error(`Upload error: ${uploadErr}`)

      return {
        rootHash: tree?.rootHash(),
        transactionHash: tx,
        success: true,
      }
    } catch (error) {
      console.error("Error storing user analytics:", error)
      return { success: false, error: error.message }
    }
  }
}

export default OGStorageClient
