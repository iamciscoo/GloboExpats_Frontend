"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/browse?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search global marketplace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-10 sm:pr-12 bg-white border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
        <Button 
          type="submit"
          size="icon" 
          className="absolute right-1 top-1 h-7 w-7 sm:h-8 sm:w-8 bg-cyan-500 hover:bg-cyan-600 rounded-full"
        >
          <Search className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </form>
  )
} 