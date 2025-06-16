import Link from "next/link"
import Image from "next/image"
import { Database, Cpu, LinkIcon, Shield } from "lucide-react"

export function Footer() {
  const ogComponents = [
    {
      name: "0G Storage",
      icon: Database,
      description: "Decentralized data storage for analytics",
      status: "Active",
    },
    {
      name: "0G Compute",
      icon: Cpu,
      description: "Distributed AI/ML processing",
      status: "Active",
    },
    {
      name: "0G Chain",
      icon: LinkIcon,
      description: "Modular EVM L1 blockchain",
      status: "Active",
    },
    {
      name: "0G DA",
      icon: Shield,
      description: "Data availability layer",
      status: "Active",
    },
  ]

  return (
    <footer className="border-t mt-12 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 0G Labs Components Status */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">0G Labs Infrastructure Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ogComponents.map((component) => (
              <div key={component.name} className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                <component.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{component.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{component.description}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">{component.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src="/images/0scope-logo-light.png"
                alt="0scope Logo"
                width={24}
                height={24}
                className="dark:hidden w-full h-full object-contain"
              />
              <Image
                src="/images/0scope-logo-dark.png"
                alt="0scope Logo"
                width={24}
                height={24}
                className="hidden dark:block w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-sm sm:text-base">0scope - Cross-Chain Analytics Platform</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground">
              Support
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
