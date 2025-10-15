'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Plus, Edit2, Trash2, ChevronRight, Home, Building, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

// Mock address data
const mockAddresses = [
  {
    id: 1,
    name: 'John Doe',
    type: 'home',
    street: '123 Palm Street',
    apartment: 'Apt 4B',
    city: 'Dubai Marina',
    state: 'Dubai',
    country: 'United Arab Emirates',
    zipCode: '00000',
    phone: '+971 50 123 4567',
    isDefault: true,
  },
  {
    id: 2,
    name: 'John Doe',
    type: 'office',
    street: '456 Sheikh Zayed Road',
    apartment: 'Office Tower, Floor 15',
    city: 'Business Bay',
    state: 'Dubai',
    country: 'United Arab Emirates',
    zipCode: '00001',
    phone: '+971 4 987 6543',
    isDefault: false,
  },
]

const countries = [
  'United Arab Emirates',
  'Saudi Arabia',
  'Singapore',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'South Korea',
  'India',
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<(typeof mockAddresses)[0] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'home',
    street: '',
    apartment: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  })
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveAddress = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...formData, id: editingAddress.id }
            : formData.isDefault && addr.isDefault
              ? { ...addr, isDefault: false }
              : addr
        )
      )
      toast({
        title: 'Address updated',
        description: 'Your address has been updated successfully.',
      })
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Math.max(...addresses.map((a) => a.id)) + 1,
      }
      if (formData.isDefault) {
        setAddresses([...addresses.map((addr) => ({ ...addr, isDefault: false })), newAddress])
      } else {
        setAddresses([...addresses, newAddress])
      }
      toast({
        title: 'Address added',
        description: 'Your new address has been added successfully.',
      })
    }

    setIsAddDialogOpen(false)
    setEditingAddress(null)
    resetForm()
  }

  const handleEditAddress = (address: (typeof mockAddresses)[0]) => {
    setEditingAddress(address)
    setFormData(address)
    setIsAddDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    const addressToDelete = addresses.find((addr) => addr.id === id)
    if (addressToDelete?.isDefault && addresses.length > 1) {
      // If deleting default address, make the first other address default
      const remaining = addresses.filter((addr) => addr.id !== id)
      remaining[0].isDefault = true
      setAddresses(remaining)
    } else {
      setAddresses(addresses.filter((addr) => addr.id !== id))
    }
    toast({
      title: 'Address deleted',
      description: 'The address has been removed from your account.',
    })
  }

  const handleSetDefault = (id: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    )
    toast({
      title: 'Default address updated',
      description: 'Your default shipping address has been changed.',
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'home',
      street: '',
      apartment: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      phone: '',
      isDefault: false,
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
            <Link href="/account" className="hover:text-brand-primary">
              My Account
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-800">Addresses</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800">Your Addresses</h1>
              <p className="text-neutral-600 mt-1">Manage your shipping addresses</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                  <DialogDescription>
                    {editingAddress
                      ? 'Update your shipping address details'
                      : 'Enter your shipping address details'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Address Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Home
                            </div>
                          </SelectItem>
                          <SelectItem value="office">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Office
                            </div>
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Dubai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Dubai"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="00000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+971 50 123 4567"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="default"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                    />
                    <Label htmlFor="default" className="text-sm font-normal cursor-pointer">
                      Set as default address
                    </Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingAddress(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAddress}>
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id} className="bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-neutral-800">{address.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {address.type === 'home' && <Home className="w-3 h-3 mr-1" />}
                          {address.type === 'office' && <Building className="w-3 h-3 mr-1" />}
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>

                      <div className="text-neutral-600 space-y-1">
                        <p>{address.street}</p>
                        {address.apartment && <p>{address.apartment}</p>}
                        <p>
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p>{address.country}</p>
                        <p className="flex items-center gap-2 mt-2">
                          <span className="text-neutral-500">Phone:</span> {address.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete address?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">No addresses saved</h3>
              <p className="text-neutral-600 mb-4">
                Add your shipping addresses to make checkout faster
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
