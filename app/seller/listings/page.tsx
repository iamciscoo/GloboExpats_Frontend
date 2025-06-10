"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import SellerLayout from "@/components/seller-layout"
import { MoreHorizontal, PlusCircle } from "lucide-react"

const listings = [
  {
    name: "Vintage Leather Sofa",
    status: "Active",
    price: "TZS 1,200,000",
    inventory: 1,
  },
  {
    name: "Samsung 4K Smart TV",
    status: "Active",
    price: "TZS 950,000",
    inventory: 3,
  },
  {
    name: "Hand-carved Coffee Table",
    status: "Inactive",
    price: "TZS 400,000",
    inventory: 0,
  },
  {
    name: "Antique Persian Rug",
    status: "Active",
    price: "TZS 2,500,000",
    inventory: 1,
  },
]

export default function ListingsPage() {
  return (
    <SellerLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage your products and view their status.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Listing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.name}>
                  <TableCell className="font-medium">{listing.name}</TableCell>
                  <TableCell>
                    <Badge variant={listing.status === "Active" ? "default" : "outline"}>
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{listing.price}</TableCell>
                  <TableCell>{listing.inventory}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SellerLayout>
  )
} 