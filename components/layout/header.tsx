"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import Image from "next/image"

export function Header() {
  const [selectedChain, setSelectedChain] = useState("All Chains")
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const chains = [
    { name: "All Chains", icon: "🌐", status: "active" },
    { name: "0G Chain", icon: "⚡", status: "primary", description: "0G Labs Modular EVM L1" },
    { name: "Ethereum", icon: "⟠", status: "active" },
    { name: "Polygon", icon: "🔷", status: "active" },
    { name: "BSC", icon: "🟡", status: "active" },
    { name: "Arbitrum", icon: "🔵", status: "active" },
    { name: "Optimism", icon: "🔴", status: "active" },
    { name: "Base", icon: "🔷", status: "active" },
  ]

  const navigation = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Wallet Analysis", href: "/wallet-analysis", icon: "👛" },
    { name: "Token Analysis", href: "/token-analysis", icon: "📈" },
    { name: "Web3 AMA", href: "/web3-qa", icon: "💬" },
  ]

  const ChainSelector = ({ isMobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`text-sm min-h-[44px] ${isMobile ? "w-full justify-between" : ""}`}>
          <div className="flex items-center">
            <span className="mr-2">🌐</span>
            <span className={isMobile ? "" : "hidden md:inline"}>{selectedChain}</span>
            {!isMobile && <span className="md:hidden">Chain</span>}
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {chains.map((chain) => (
          <DropdownMenuItem
            key={chain.name}
            onClick={() => setSelectedChain(chain.name)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{chain.icon}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <span>{chain.name}</span>
                  {chain.status === "primary" && (
                    <Badge variant="default" className="text-xs">
                      Primary
                    </Badge>
                  )}
                </div>
                {chain.description && <p className="text-xs text-muted-foreground">{chain.description}</p>}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const Navigation = () => (
    <nav className="flex items-center space-x-6">
      <Link href="/" className="flex items-center space-x-3">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          {/* Light mode logo (dark logo on light background) */}
          <Image
            src="/images/0scope-logo-light.png"
            alt="sc0pe Logo"
            width={40}
            height={40}
            className="dark:hidden w-full h-full object-contain"
            priority
          />
          {/* Dark mode logo (light logo on dark background) */}
          <Image
            src="/images/0scope-logo-dark.png"
            alt="sc0pe Logo"
            width={40}
            height={40}
            className="hidden dark:block w-full h-full object-contain"
            priority
          />
        </div>
        <span className="font-bold text-xl">sc0pe</span>
      </Link>

      <div className="hidden md:flex items-center space-x-1">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <Button variant={pathname === item.href ? "default" : "ghost"} className="flex items-center space-x-2">
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  )

  const MobileNavigation = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden min-h-[44px] min-w-[44px]">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col space-y-4 mt-8">
          <div className="flex items-center space-x-3 px-4 pb-4 border-b">
            <div className="relative w-8 h-8">
              <Image
                src="/images/0scope-logo-light.png"
                alt="sc0pe Logo"
                width={32}
                height={32}
                className="dark:hidden w-full h-full object-contain"
              />
              <Image
                src="/images/0scope-logo-dark.png"
                alt="sc0pe Logo"
                width={32}
                height={32}
                className="hidden dark:block w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-lg">sc0pe</span>
          </div>

          {/* Mobile Chain Selector */}
          <div className="px-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Select Chain</p>
            <ChainSelector isMobile={true} />
          </div>

          {/* Mobile 0G Network Status */}
          <div className="px-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">0G Network Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="border-t pt-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="ghost" className="justify-start w-full">
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MobileNavigation />
            <Navigation />
          </div>

          <div className="flex items-center space-x-4">
            {/* 0G Labs Status Indicator - Desktop Only */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">0G Network Active</span>
            </div>

            {/* Chain Selector - Desktop Only */}
            <div className="hidden sm:block">
              <ChainSelector />
            </div>

            {/* Mobile Chain Selector - Visible on mobile */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                    <span>🌐</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <div className="p-2 border-b">
                    <p className="text-sm font-medium">Select Chain</p>
                    <p className="text-xs text-muted-foreground">Current: {selectedChain}</p>
                  </div>
                  {chains.map((chain) => (
                    <DropdownMenuItem
                      key={chain.name}
                      onClick={() => setSelectedChain(chain.name)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{chain.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span>{chain.name}</span>
                            {chain.status === "primary" && (
                              <Badge variant="default" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          {chain.description && <p className="text-xs text-muted-foreground">{chain.description}</p>}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="min-h-[44px] min-w-[44px]"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
