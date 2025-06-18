"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface ChainContextType {
  selectedChain: string
  setSelectedChain: (chain: string) => void
}

const ChainContext = createContext<ChainContextType | undefined>(undefined)

interface ChainProviderProps {
  children: ReactNode
}

export const ChainProvider = ({ children }: ChainProviderProps) => {
  const [selectedChain, setSelectedChain] = useState<string>("0G Chain")

  return <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>{children}</ChainContext.Provider>
}

export const useChain = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider")
  }
  return context
}
