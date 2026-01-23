/**
 * Dynamic Category-Specific Fields Configuration
 *
 * This module defines the additional fields that appear when users select specific categories.
 * Each category can have its own set of relevant fields to help users create better listings.
 */

export interface CategoryField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  maxLength?: number
  min?: number
  max?: number
  step?: number
}

export interface CategoryFieldGroup {
  categoryName: string
  fields: CategoryField[]
}

/**
 * Category-specific field configurations
 * These fields are dynamically shown based on the selected category
 */
export const CATEGORY_FIELDS: CategoryFieldGroup[] = [
  {
    categoryName: 'Vehicle & Supplies',
    fields: [
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Toyota, BMW, Mercedes',
        required: true,
        maxLength: 50,
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'e.g., Camry, X5, C-Class',
        required: true,
        maxLength: 50,
      },
      {
        key: 'year',
        label: 'Year',
        type: 'number',
        placeholder: '2020',
        required: true,
        min: 1980,
        max: new Date().getFullYear() + 1,
      },
      {
        key: 'mileage',
        label: 'Mileage (km)',
        type: 'number',
        placeholder: '50000',
        min: 0,
        max: 1000000,
      },
      {
        key: 'fuelType',
        label: 'Fuel Type',
        type: 'select',
        required: true,
        options: [
          { value: 'petrol', label: 'Petrol' },
          { value: 'diesel', label: 'Diesel' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'electric', label: 'Electric' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'transmission',
        label: 'Transmission',
        type: 'select',
        required: true,
        options: [
          { value: 'automatic', label: 'Automatic' },
          { value: 'manual', label: 'Manual' },
          { value: 'cvt', label: 'CVT' },
        ],
      },
      {
        key: 'engineType',
        label: 'Engine Type',
        type: 'select',
        required: true,
        options: [
          { value: 'inline', label: 'Inline' },
          { value: 'v-type', label: 'V-Type' },
          { value: 'flat', label: 'Flat/Boxer' },
          { value: 'rotary', label: 'Rotary' },
          { value: 'electric-motor', label: 'Electric Motor' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'numberOfSeats',
        label: 'Number of Seats',
        type: 'number',
        placeholder: '5',
        required: true,
        min: 1,
        max: 50,
      },
      {
        key: 'steeringSide',
        label: 'Steering Side',
        type: 'select',
        required: true,
        options: [
          { value: 'left', label: 'Left Hand Drive' },
          { value: 'right', label: 'Right Hand Drive' },
        ],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'e.g., White, Black, Silver',
        maxLength: 30,
      },
      {
        key: 'engineSize',
        label: 'Engine Size',
        type: 'text',
        placeholder: 'e.g., 2.0L or 2000cc',
        maxLength: 20,
      },
    ],
  },
  {
    categoryName: 'Electronics',
    fields: [
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Apple, Samsung, Sony',
        required: true,
        maxLength: 50,
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'e.g., iPhone 15, Galaxy S24, PS5',
        required: true,
        maxLength: 50,
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'e.g., Space Gray, White, Black',
        maxLength: 30,
      },
      {
        key: 'storage',
        label: 'Storage/Memory',
        type: 'text',
        placeholder: 'e.g., 256GB, 16GB RAM, 1TB',
        maxLength: 50,
      },
      {
        key: 'screenSize',
        label: 'Screen Size',
        type: 'text',
        placeholder: 'e.g., 6.1", 55", 13.3"',
        maxLength: 20,
      },
    ],
  },
  {
    categoryName: 'Furniture',
    fields: [
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: [
          { value: 'wood', label: 'Wood' },
          { value: 'metal', label: 'Metal' },
          { value: 'plastic', label: 'Plastic' },
          { value: 'fabric', label: 'Fabric' },
          { value: 'leather', label: 'Leather' },
          { value: 'glass', label: 'Glass' },
          { value: 'mixed', label: 'Mixed Materials' },
        ],
      },
      {
        key: 'dimensions',
        label: 'Dimensions (L x W x H)',
        type: 'text',
        placeholder: 'e.g., 120x60x75 cm',
        maxLength: 50,
      },
      {
        key: 'color',
        label: 'Color/Finish',
        type: 'text',
        placeholder: 'e.g., Oak, Black, White',
        maxLength: 30,
      },
      {
        key: 'assemblyRequired',
        label: 'Assembly Required',
        type: 'select',
        options: [
          { value: 'no', label: 'No - Ready to use' },
          { value: 'yes', label: 'Yes - Some assembly needed' },
          { value: 'partial', label: 'Partially assembled' },
        ],
      },
    ],
  },
  {
    categoryName: 'Clothing',
    fields: [
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Nike, Adidas, Zara',
        maxLength: 50,
      },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        required: true,
        options: [
          { value: 'xs', label: 'XS' },
          { value: 's', label: 'S' },
          { value: 'm', label: 'M' },
          { value: 'l', label: 'L' },
          { value: 'xl', label: 'XL' },
          { value: 'xxl', label: 'XXL' },
          { value: 'xxxl', label: 'XXXL' },
          { value: 'other', label: 'Other (specify in description)' },
        ],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'e.g., Blue, Red, Multicolor',
        maxLength: 30,
      },
      {
        key: 'material',
        label: 'Material',
        type: 'text',
        placeholder: 'e.g., Cotton, Polyester, Silk',
        maxLength: 50,
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        options: [
          { value: 'unisex', label: 'Unisex' },
          { value: 'men', label: 'Men' },
          { value: 'women', label: 'Women' },
          { value: 'boys', label: 'Boys' },
          { value: 'girls', label: 'Girls' },
        ],
      },
    ],
  },
  {
    categoryName: 'Real Estate',
    fields: [
      {
        key: 'propertyType',
        label: 'Property Type',
        type: 'select',
        required: true,
        options: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'house', label: 'House' },
          { value: 'villa', label: 'Villa' },
          { value: 'office', label: 'Office Space' },
          { value: 'shop', label: 'Shop/Commercial' },
          { value: 'land', label: 'Land' },
        ],
      },
      {
        key: 'bedrooms',
        label: 'Bedrooms',
        type: 'number',
        min: 0,
        max: 20,
      },
      {
        key: 'bathrooms',
        label: 'Bathrooms',
        type: 'number',
        min: 0,
        max: 20,
      },
      {
        key: 'area',
        label: 'Area (sq meters)',
        type: 'number',
        placeholder: '120',
        min: 1,
        max: 100000,
      },
      {
        key: 'furnished',
        label: 'Furnished',
        type: 'select',
        options: [
          { value: 'furnished', label: 'Fully Furnished' },
          { value: 'semi-furnished', label: 'Semi Furnished' },
          { value: 'unfurnished', label: 'Unfurnished' },
        ],
      },
      {
        key: 'parking',
        label: 'Parking',
        type: 'select',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'multiple', label: 'Multiple spaces' },
        ],
      },
    ],
  },
  {
    categoryName: 'Books & Media',
    fields: [
      {
        key: 'author',
        label: 'Author/Creator',
        type: 'text',
        placeholder: 'e.g., Stephen King, Marvel Comics',
        maxLength: 100,
      },
      {
        key: 'genre',
        label: 'Genre/Category',
        type: 'text',
        placeholder: 'e.g., Fiction, Biography, Action',
        maxLength: 50,
      },
      {
        key: 'format',
        label: 'Format',
        type: 'select',
        options: [
          { value: 'hardcover', label: 'Hardcover' },
          { value: 'paperback', label: 'Paperback' },
          { value: 'ebook', label: 'E-book' },
          { value: 'audiobook', label: 'Audiobook' },
          { value: 'dvd', label: 'DVD' },
          { value: 'bluray', label: 'Blu-ray' },
          { value: 'digital', label: 'Digital' },
        ],
      },
      {
        key: 'language',
        label: 'Language',
        type: 'text',
        placeholder: 'e.g., English, Swahili, French',
        maxLength: 30,
      },
      {
        key: 'isbn',
        label: 'ISBN (for books)',
        type: 'text',
        placeholder: 'e.g., 978-0-123456-78-9',
        maxLength: 20,
      },
    ],
  },
  {
    categoryName: 'Sports & Games',
    fields: [
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Nike, Adidas, Wilson',
        maxLength: 50,
      },
      {
        key: 'sport',
        label: 'Sport/Activity',
        type: 'text',
        placeholder: 'e.g., Football, Tennis, Hiking',
        maxLength: 50,
      },
      {
        key: 'size',
        label: 'Size',
        type: 'text',
        placeholder: 'e.g., Size 42, Medium, One Size',
        maxLength: 30,
      },
      {
        key: 'suitable',
        label: 'Suitable For',
        type: 'select',
        options: [
          { value: 'adults', label: 'Adults' },
          { value: 'children', label: 'Children' },
          { value: 'unisex', label: 'Men & Women' },
          { value: 'professional', label: 'Professional/Competition' },
          { value: 'beginner', label: 'Beginner/Recreational' },
        ],
      },
    ],
  },
  {
    categoryName: 'Home & Kitchen Appliances',
    fields: [
      {
        key: 'applianceType',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'kitchen-small', label: 'Small Kitchen (Blender, Toaster)' },
          { value: 'kitchen-large', label: 'Large Kitchen (Fridge, Oven)' },
          { value: 'cleaning', label: 'Cleaning (Vacuum, Iron)' },
          { value: 'climate', label: 'Climate Control (AC, Fan)' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Samsung, LG, Phillips',
        required: true,
        maxLength: 50,
      },
      {
        key: 'model',
        label: 'Model',
        type: 'text',
        placeholder: 'e.g., Series 5000',
        maxLength: 50,
      },
      {
        key: 'power',
        label: 'Power/Capacity',
        type: 'text',
        placeholder: 'e.g., 1000W, 500L, 8kg',
        maxLength: 30,
      },
      {
        key: 'energyRating',
        label: 'Energy Rating',
        type: 'select',
        options: [
          { value: 'high', label: 'High Efficiency (A+/5 Star)' },
          { value: 'medium', label: 'Standard Efficiency' },
          { value: 'low', label: 'Low Efficiency' },
          { value: 'unknown', label: 'Not specified' },
        ],
      },
    ],
  },
  {
    categoryName: 'Beauty & Personal Care',
    fields: [
      {
        key: 'productType',
        label: 'Product Type',
        type: 'select',
        required: true,
        options: [
          { value: 'skincare', label: 'Skincare' },
          { value: 'makeup', label: 'Makeup/Cosmetics' },
          { value: 'fragrance', label: 'Fragrance/Perfume' },
          { value: 'haircare', label: 'Haircare' },
          { value: 'tools', label: 'Beauty Tools/Devices' },
          { value: 'personal-care', label: 'Personal Hygiene' },
        ],
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: "e.g., MAC, L'Oreal, Nivea",
        required: true,
        maxLength: 50,
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        options: [
          { value: 'unisex', label: 'Unisex' },
          { value: 'women', label: 'Women' },
          { value: 'men', label: 'Men' },
        ],
      },
      {
        key: 'volume',
        label: 'Volume/Size',
        type: 'text',
        placeholder: 'e.g., 50ml, 100g',
        maxLength: 30,
      },
      {
        key: 'skinType',
        label: 'Skin/Hair Type',
        type: 'text',
        placeholder: 'e.g., Oily, Dry, All types',
        maxLength: 50,
      },
      {
        key: 'expiry',
        label: 'Expiry Date',
        type: 'text',
        placeholder: 'e.g., 12/2026',
        maxLength: 20,
      },
    ],
  },
  {
    categoryName: 'Garden & Outdoors',
    fields: [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: [
          { value: 'furniture', label: 'Furniture' },
          { value: 'tools', label: 'Tools & Equipment' },
          { value: 'decor', label: 'Decor' },
          { value: 'plants', label: 'Plants/Seeds' },
          { value: 'grills', label: 'Grills & Outdoor Cooking' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'material',
        label: 'Material',
        type: 'text',
        placeholder: 'e.g., Wicker, Metal, Wood, Plastic',
        maxLength: 50,
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Black+Decker, Weber, IKEA',
        maxLength: 50,
      },
      {
        key: 'powerSource',
        label: 'Power Source (for tools)',
        type: 'select',
        options: [
          { value: 'manual', label: 'Manual' },
          { value: 'electric', label: 'Electric (Corded)' },
          { value: 'battery', label: 'Battery/Cordless' },
          { value: 'gas', label: 'Gas/Petrol' },
          { value: 'solar', label: 'Solar' },
          { value: 'not-applicable', label: 'Not Applicable' },
        ],
      },
    ],
  },
  {
    categoryName: 'Art & Crafts',
    fields: [
      {
        key: 'type',
        label: 'Craft Type',
        type: 'text',
        placeholder: 'e.g., Painting, Knitting, Scrapbooking, Sewing',
        required: true,
        maxLength: 50,
      },
      {
        key: 'itemType',
        label: 'Item Type',
        type: 'text',
        placeholder: 'e.g., Tools, Materials, Finished Piece',
        maxLength: 50,
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Winsor & Newton, Cricut, Singer',
        maxLength: 50,
      },
      {
        key: 'material',
        label: 'Material',
        type: 'text',
        placeholder: 'e.g., Acrylic, Wool, Paper, Canvas',
        maxLength: 50,
      },
    ],
  },
  {
    categoryName: 'Pet Supplies',
    fields: [
      {
        key: 'petType',
        label: 'Pet Type',
        type: 'select',
        required: true,
        options: [
          { value: 'dog', label: 'Dog' },
          { value: 'cat', label: 'Cat' },
          { value: 'bird', label: 'Bird' },
          { value: 'fish', label: 'Fish' },
          { value: 'small-pet', label: 'Small Pet (Hamster, Rabbit)' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'itemType',
        label: 'Item Category',
        type: 'select',
        required: true,
        options: [
          { value: 'food', label: 'Food & Treats' },
          { value: 'toy', label: 'Toys' },
          { value: 'bedding', label: 'Bedding/Furniture' },
          { value: 'accessory', label: 'Collars/Muzzels/Leashes' },
          { value: 'grooming', label: 'Grooming/Health' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'e.g., Royal Canin, Pedigree',
        maxLength: 50,
      },
      {
        key: 'size',
        label: 'Size/Weight',
        type: 'text',
        placeholder: 'e.g., Large, 15kg, Adjustable',
        maxLength: 30,
      },
      {
        key: 'feature',
        label: 'Key Feature',
        type: 'text',
        placeholder: 'e.g., Grain-free, Waterproof, Orthopedic',
        maxLength: 50,
      },
    ],
  },
  {
    categoryName: 'Other',
    fields: [
      {
        key: 'itemType',
        label: 'Item Type',
        type: 'select',
        required: true,
        options: [
          { value: 'animals', label: 'Animals' },
          { value: 'artifacts', label: 'Artifacts & Antiques' },
          { value: 'instruments', label: 'Musical Instruments' },
          { value: 'collectibles', label: 'Collectibles' },
          { value: 'equipment', label: 'Specialized Equipment' },
          { value: 'other', label: 'Other/Miscellaneous' },
        ],
      },
      {
        key: 'specificDetail',
        label: 'Specific Detail',
        type: 'text',
        placeholder: 'e.g., Breed of animal, Age of artifact, Brand of instrument',
        required: true,
        maxLength: 100,
      },
      {
        key: 'originHistory',
        label: 'Origin & History',
        type: 'textarea',
        placeholder: 'Tell us more about where it comes from or its history...',
        maxLength: 200,
      },
      {
        key: 'careRequirements',
        label: 'Care & Requirements',
        type: 'textarea',
        placeholder: 'e.g., Feeding instructions, handling delicate items, special storage...',
        maxLength: 200,
      },
    ],
  },
]

/**
 * Get fields for a specific category
 */
export function getCategoryFields(categoryName: string): CategoryField[] {
  const categoryConfig = CATEGORY_FIELDS.find(
    (config) => config.categoryName.toLowerCase() === categoryName.toLowerCase()
  )
  return categoryConfig?.fields || []
}

/**
 * Check if a category has dynamic fields
 */
export function hasCategoryFields(categoryName: string): boolean {
  return getCategoryFields(categoryName).length > 0
}
