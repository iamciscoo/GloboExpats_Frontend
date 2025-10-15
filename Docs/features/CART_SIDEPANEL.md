# Cart Side Panel Feature

## Overview

The Cart Side Panel provides users with quick access to their shopping cart from any page on the platform. It features smooth animations, keyboard shortcuts, and a clean, intuitive interface inspired by modern e-commerce best practices.

## Key Features

### 1. **Quick Access**
- Accessible from any page via cart icon in header
- Keyboard shortcut: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- Slide-out panel from the right side
- Smooth animations and transitions

### 2. **Cart Management**
- View all cart items with images and details
- Update item quantities with +/- buttons
- Remove individual items
- Clear entire cart (with confirmation)
- Real-time subtotal calculation

### 3. **Actions**
- **Proceed to Checkout**: Navigate to checkout page
- **View Full Cart**: Navigate to full cart page
- **Continue Shopping**: Close panel and continue browsing
- **Clear Cart**: Remove all items at once

### 4. **Empty State**
- Clean, friendly empty cart message
- Call-to-action to continue shopping
- Icon-based visual feedback

### 5. **Accessibility**
- Full keyboard navigation support
- ARIA roles and labels for screen readers
- Focus management
- Escape key to close
- High contrast and readable text

### 6. **Performance**
- Lazy-loaded cart data
- Optimized re-renders with React.memo
- Debounced quantity updates
- Smooth animations without layout shift

## Component Structure

```
components/
  cart-sidepanel.tsx          # Main component file
    - CartSidePanel           # The side panel dialog
    - CartSidePanelTrigger    # Trigger button with keyboard shortcut
    - CartItemRow             # Individual cart item display
    - EmptyCartState          # Empty cart UI
```

## Usage

### Basic Usage

The cart side panel is automatically integrated into the header. Users can access it by:

1. **Clicking the cart icon** in the header navigation
2. **Pressing `Ctrl+K`** (or `Cmd+K` on Mac) anywhere on the site

### For Developers

#### Using the Trigger Component

```tsx
import { CartSidePanelTrigger } from '@/components/cart-sidepanel'

// Basic usage - renders default cart icon with badge
<CartSidePanelTrigger />

// Custom styling
<CartSidePanelTrigger className="custom-class">
  {/* Custom children */}
</CartSidePanelTrigger>
```

#### Using the Panel Directly

```tsx
import { CartSidePanel } from '@/components/cart-sidepanel'

const [open, setOpen] = useState(false)

<CartSidePanel open={open} onOpenChange={setOpen} />
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Toggle cart panel |
| `Escape` | Close cart panel |
| `Tab` | Navigate between interactive elements |
| `Enter` / `Space` | Activate buttons |

## Accessibility Features

### ARIA Attributes
- `role="dialog"` on the panel
- `aria-label` for descriptive labels
- `aria-haspopup` and `aria-expanded` on trigger
- `role="list"` and `role="listitem"` for cart items

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Focus trap within the panel when open
- Focus restoration when closed

### Screen Reader Support
- Descriptive labels for all actions
- Live region updates for quantity changes
- Status messages for cart operations

## Design System Integration

### Colors
Uses the platform's existing color palette:
- **Background**: `bg-white`
- **Text**: `text-neutral-900`, `text-neutral-600`
- **Primary Action**: `bg-neutral-900` (Continue to Checkout)
- **Borders**: `border-neutral-200`
- **Accent**: `bg-red-500` (cart count badge)

### Typography
- **Headings**: Font-semibold, appropriate sizing
- **Body Text**: Regular weight, good contrast
- **Prices**: Font-bold for emphasis

### Spacing
- Consistent padding and margins using Tailwind scale
- Comfortable touch targets (min 44x44px)
- Appropriate whitespace for readability

## Performance Considerations

### Optimizations
1. **React.memo** - Prevents unnecessary re-renders
2. **Lazy Loading** - Cart data loaded only when needed
3. **Debounced Updates** - Quantity changes debounced to reduce API calls
4. **Efficient Rendering** - Only affected items re-render on updates

### Bundle Size
- Uses existing UI components (Sheet, Button, etc.)
- No additional dependencies
- Tree-shakeable exports

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Unit Tests
Location: `components/__tests__/cart-sidepanel.test.tsx`

Tests cover:
- Component rendering
- Keyboard shortcuts
- Cart operations
- Empty state
- Accessibility
- Performance

### Manual Testing Checklist

- [ ] Cart icon displays correct item count
- [ ] Panel opens/closes smoothly
- [ ] Keyboard shortcut (Ctrl/Cmd+K) works
- [ ] Items display correctly with images
- [ ] Quantity buttons work
- [ ] Remove item button works
- [ ] Clear cart works with confirmation
- [ ] Subtotal calculates correctly
- [ ] Checkout button navigates correctly
- [ ] View Full Cart button navigates correctly
- [ ] Continue Shopping closes panel
- [ ] Empty state displays correctly
- [ ] Responsive on mobile devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

## Integration Points

### Backend API
The cart side panel integrates with the following API endpoints:

- `GET /api/v1/cart/User` - Fetch cart items
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/item/{cartId}` - Update item quantity
- `DELETE /api/v1/cart/item/{itemId}` - Remove item
- `DELETE /api/v1/cart/clear` - Clear cart

### State Management
- Uses `CartProvider` for cart state
- Integrates with `useCart` hook
- Automatic sync with backend

### Navigation
- Links to `/checkout` for checkout flow
- Links to `/cart` for full cart page
- Closes on navigation to avoid state conflicts

## Known Limitations

1. **Single Currency Display**: Currently assumes items have the same currency
2. **Image Loading**: Placeholder shown if image fails to load
3. **Maximum Quantity**: Set to 10 items per product (configurable)

## Future Enhancements

1. **Animations**: Add micro-interactions for item additions/removals
2. **Promo Codes**: Add promo code input field
3. **Recommendations**: Show recommended products based on cart items
4. **Save for Later**: Allow users to save items for future purchase
5. **Multi-Currency**: Better handling of mixed currency carts
6. **Offline Support**: Cache cart state for offline viewing

## Troubleshooting

### Cart not opening
- Check that `CartProvider` wraps your app
- Verify keyboard shortcut isn't conflicting with browser shortcuts
- Check browser console for errors

### Items not displaying
- Verify cart items have required fields (id, title, price, image)
- Check API connectivity
- Verify image URLs are accessible

### Keyboard shortcut not working
- Check if another component is capturing the same shortcut
- Verify event listener is properly attached
- Test in different browsers

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test files for usage examples
3. Contact the development team

---

**Last Updated**: 2025-10-15  
**Component Version**: 1.0.0  
**Maintainer**: Development Team
