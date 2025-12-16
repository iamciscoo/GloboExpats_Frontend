/**
 * Description Parser Utility
 *
 * Parses product descriptions to extract structured specifications and clean descriptions.
 * This handles the format created by the listing form when category fields are included.
 */

import { getCategoryFields, type CategoryField } from '@/lib/category-fields'

export interface ParsedDescription {
  description: string
  specifications: Record<string, string>
}

/**
 * Convert specification labels back to field keys
 * This maps display labels (like "Brand") back to field keys (like "brand")
 */
function mapLabelsToFieldKeys(
  specifications: Record<string, string>,
  category: string
): Record<string, string> {
  if (!category) return {}

  // Import getCategoryFields to map labels back to keys
  const categoryFields = getCategoryFields(category)

  const mappedSpecs: Record<string, string> = {}

  // Create a reverse mapping from labels to field keys
  const labelToKeyMap: Record<string, string> = {}
  categoryFields.forEach((field: CategoryField) => {
    labelToKeyMap[field.label.toLowerCase()] = field.key
  })

  // Add common legacy/variation mappings to prevent duplicates
  labelToKeyMap['dimensions lwh'] = 'dimensions'
  labelToKeyMap['dimensions ( l x w x h )'] = 'dimensions'
  labelToKeyMap['dimensions (l x w x h)'] = 'dimensions'

  // Map specifications using the reverse mapping
  Object.entries(specifications).forEach(([label, value]) => {
    const normalizedLabel = label.toLowerCase().trim()
    const fieldKey = labelToKeyMap[normalizedLabel]

    if (fieldKey) {
      mappedSpecs[fieldKey] = value
    } else {
      // Fallback: try direct matching or create a key from the label
      const fallbackKey = normalizedLabel.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      mappedSpecs[fallbackKey] = value
    }
  })

  if (process.env.NODE_ENV === 'development' && Object.keys(specifications).length > 0) {
    console.log('🗺️ mapLabelsToFieldKeys debug:', {
      category,
      labelToKeyMap,
      originalSpecs: specifications,
      mappedSpecs,
    })
  }

  return mappedSpecs
}

/**
 * Parse a product description to extract specifications
 *
 * @param rawDescription - The raw description from the backend
 * @param category - The product category to map specifications correctly
 * @returns Object with separated description and specifications
 */
export function parseProductDescription(
  rawDescription: string,
  category?: string
): ParsedDescription {
  if (!rawDescription) {
    return {
      description: '',
      specifications: {},
    }
  }

  // Check if description contains structured specifications
  const specSeparator = '--- SPECIFICATIONS ---'
  const parts = rawDescription.split(specSeparator)

  if (parts.length < 2) {
    // No structured specifications found
    return {
      description: rawDescription.trim(),
      specifications: {},
    }
  }

  const description = parts[0].trim()
  const specsSection = parts[1].trim()

  // Parse specifications from the formatted section
  const specifications: Record<string, string> = {}

  if (specsSection) {
    const lines = specsSection.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine && trimmedLine.includes(':')) {
        const [key, ...valueParts] = trimmedLine.split(':')
        const value = valueParts.join(':').trim()

        if (key && value) {
          specifications[key.trim()] = value
        }
      }
    }
  }

  // Map the parsed labels back to field keys if category is provided
  const mappedSpecifications = category
    ? mapLabelsToFieldKeys(specifications, category)
    : specifications

  if (process.env.NODE_ENV === 'development' && Object.keys(specifications).length > 0) {
    console.log('🔍 parseProductDescription debug:', {
      category,
      rawSpecs: specifications,
      mappedSpecs: mappedSpecifications,
      hasCategory: !!category,
    })
  }

  return {
    description: description || 'No description provided.',
    specifications: mappedSpecifications,
  }
}

/**
 * Format specifications for display
 *
 * @param specifications - Record of specification key-value pairs
 * @returns Formatted specifications with proper labels and values
 */
export function formatSpecifications(specifications: Record<string, string>): Array<{
  label: string
  value: string
  key: string
}> {
  return Object.entries(specifications).map(([key, value]) => ({
    key,
    label: formatSpecificationLabel(key),
    value: formatSpecificationValue(key, value),
  }))
}

/**
 * Format specification label for better display
 */
function formatSpecificationLabel(key: string): string {
  // Convert camelCase or snake_case to proper case
  // Also clean up any potential mojibake characters from database
  return key
    .replace(/Ã\x97/g, 'x') // Fix Mojibake multiplication sign
    .replace(/Ã—/g, 'x') // Fix another variant
    .replace(/×/g, 'x') // Standardize multiplication sign
    .replace(/\(LÃ WÃ H\)/g, '(L x W x H)') // Specific fix for known issue
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) // Capitalize first letter of each word
    .trim()
}

/**
 * Format specification value for better display
 */
function formatSpecificationValue(key: string, value: string): string {
  // Handle specific formatting based on key type
  const lowerKey = key.toLowerCase()

  if (lowerKey.includes('year') && !isNaN(Number(value))) {
    return value
  }

  if (lowerKey.includes('mileage') && !isNaN(Number(value))) {
    return `${Number(value).toLocaleString()} km`
  }

  if (lowerKey.includes('area') && !isNaN(Number(value))) {
    return `${Number(value).toLocaleString()} sq m`
  }

  if (lowerKey.includes('engine') && !isNaN(Number(value))) {
    return `${value}L`
  }

  if (lowerKey.includes('storage') || lowerKey.includes('memory')) {
    return value.toUpperCase()
  }

  // Default: capitalize first letter
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Check if a description has structured specifications
 */
export function hasSpecifications(description: string): boolean {
  return description.includes('--- SPECIFICATIONS ---')
}

/**
 * Get specification categories for better organization
 */
export function categorizeSpecifications(specifications: Record<string, string>): {
  [category: string]: Array<{ label: string; value: string; key: string }>
} {
  const formatted = formatSpecifications(specifications)
  const categories: { [category: string]: Array<{ label: string; value: string; key: string }> } =
    {}

  formatted.forEach((spec) => {
    const category = getSpecificationCategory(spec.key)
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(spec)
  })

  return categories
}

/**
 * Determine which category a specification belongs to
 */
function getSpecificationCategory(key: string): string {
  const lowerKey = key.toLowerCase()

  if (
    lowerKey.includes('brand') ||
    lowerKey.includes('model') ||
    lowerKey.includes('manufacturer')
  ) {
    return 'General'
  }

  if (
    lowerKey.includes('year') ||
    lowerKey.includes('mileage') ||
    lowerKey.includes('fuel') ||
    lowerKey.includes('transmission') ||
    lowerKey.includes('engine')
  ) {
    return 'Vehicle Details'
  }

  if (
    lowerKey.includes('storage') ||
    lowerKey.includes('memory') ||
    lowerKey.includes('screen') ||
    lowerKey.includes('processor') ||
    lowerKey.includes('battery')
  ) {
    return 'Technical Specs'
  }

  if (
    lowerKey.includes('material') ||
    lowerKey.includes('dimensions') ||
    lowerKey.includes('color') ||
    lowerKey.includes('size')
  ) {
    return 'Physical Details'
  }

  if (
    lowerKey.includes('bedroom') ||
    lowerKey.includes('bathroom') ||
    lowerKey.includes('area') ||
    lowerKey.includes('furnished') ||
    lowerKey.includes('parking')
  ) {
    return 'Property Details'
  }

  return 'Other Details'
}
