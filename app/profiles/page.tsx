'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  MapPin,
  Star,
  Users,
  Calendar,
  Award,
  Shield,
  MessageCircle,
  Grid,
  List,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RouteGuard } from '@/components/route-guard'
import { EXPAT_LOCATIONS } from '@/lib/constants'

export default function ProfilesPage() {
  return (
    <RouteGuard requireAuth loadingMessage="Loading expat community...">
      <ProfilesPageContent />
    </RouteGuard>
  )
}

function ProfilesPageContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('rating')

  // TODO: Fetch seller profiles from backend API
  // GET /api/v1/sellers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allProfiles: any[] = []

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const allSpecialties = allProfiles.flatMap((profile) => profile.specialties || [])
    return Array.from(new Set(allSpecialties)).sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // allProfiles is empty array, no dependencies needed

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    let filtered = allProfiles

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (profile) =>
          profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          profile.specialties?.some((spec: string) =>
            spec.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    // Location filter
    if (selectedLocation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((profile: any) =>
        profile.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Specialty filter
    if (selectedSpecialty) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered = filtered.filter((profile: any) =>
        profile.specialties?.some((spec: string) =>
          spec.toLowerCase().includes(selectedSpecialty.toLowerCase())
        )
      )
    }

    // Sort profiles
    switch (sortBy) {
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating)
      case 'reviews':
        return filtered.sort((a, b) => b.reviewCount - a.reviewCount)
      case 'newest':
        return filtered.sort(
          (a, b) => new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime()
        )
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return filtered
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedLocation, selectedSpecialty, sortBy]) // allProfiles is empty, no dependency needed

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedLocation('')
    setSelectedSpecialty('')
    setSortBy('rating')
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Link href="/" className="hover:text-brand-primary">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-800">Expat Community</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-brand-primary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold font-display mb-4">Expat Community</h1>
            <p className="text-xl text-neutral-200 max-w-2xl mx-auto">
              Discover verified expat professionals around the world. Connect with trusted sellers
              in your location.
            </p>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-primary">{allProfiles.length}</div>
              <div className="text-sm text-neutral-600">Verified Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{EXPAT_LOCATIONS.length}+</div>
              <div className="text-sm text-neutral-600">Global Locations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{specialties.length}</div>
              <div className="text-sm text-neutral-600">Specialties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-neutral-600">Avg. Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search by name, location, or specialty..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {EXPAT_LOCATIONS.map((location) => (
                  <SelectItem key={location.value} value={location.country || location.label}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Specialty Filter */}
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="newest">Newest Members</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                {filteredProfiles.length} members found
              </span>
              {(searchQuery || selectedLocation || selectedSpecialty) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Results */}
        {filteredProfiles.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">No profiles found</h3>
            <p className="text-neutral-600 mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Profile Card Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileCard({ profile, viewMode }: { profile: any; viewMode: 'grid' | 'list' }) {
  // Badge count calculation reserved for when profiles are loaded from API
  // const verificationBadgeCount = Object.values(profile.verificationBadges || {}).filter(
  //   Boolean
  // ).length

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-16 h-16 border-2 border-neutral-200">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-brand-secondary text-brand-primary text-lg font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-neutral-800">{profile.name}</h3>
                {profile.verified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.businessInfo?.type === 'company' && (
                  <Badge className="bg-blue-100 text-blue-800">Business</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{profile.rating}</span>
                  <span>({profile.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profile.memberSince}</span>
                </div>
              </div>

              <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{profile.bio}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {profile.specialties?.slice(0, 3).map((specialty: string) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {(profile.specialties?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(profile.specialties?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/messages?seller=${encodeURIComponent(profile.name)}`}>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                  <Link href={`/expat/profile/${profile.id}`}>
                    <Button size="sm">View Profile</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-neutral-200 group-hover:border-brand-primary transition-colors">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-brand-secondary text-brand-primary text-xl font-bold">
              {profile.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="mb-3">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">{profile.name}</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              {profile.verified && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {profile.rating >= 4.8 && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Top Rated
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-neutral-600">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{profile.rating}</span>
              <span>({profile.reviewCount})</span>
            </div>
          </div>

          <div className="text-sm text-neutral-600 mb-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
            <div className="text-xs">Member since {profile.memberSince}</div>
          </div>

          <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{profile.bio}</p>

          <div className="mb-4">
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {profile.specialties?.slice(0, 2).map((specialty: string) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
            {(profile.specialties?.length || 0) > 2 && (
              <div className="text-xs text-neutral-500">
                +{(profile.specialties?.length || 0) - 2} more specialties
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/expat/profile/${profile.id}`}>
              <Button className="w-full" size="sm">
                View Profile
              </Button>
            </Link>
            <Link href={`/messages?seller=${encodeURIComponent(profile.name)}`}>
              <Button variant="outline" className="w-full" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
