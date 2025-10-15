# API Requirements for Backend Team

## Overview

The frontend expects REST APIs with consistent response formats. You can implement these endpoints in **any technology** (Node.js, Python, Java, Go, PHP, etc.).

## Base Response Format

All API responses should follow this structure:

```json
{
  "data": any,           // The actual response data
  "success": boolean,    // Whether the request succeeded
  "message": string,     // Optional success/error message
  "errors": string[]     // Optional array of error messages
}
```

## Authentication

- Use Bearer token authentication
- Header: `Authorization: Bearer <token>`
- Include user context in protected endpoints

## Required Endpoints

### Products API

#### GET /api/products

**Query Parameters:**

- `category` (optional): Filter by category
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `search` (optional): Search query

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "price": number,
      "currency": "string",
      "image": "string",
      "images": ["string"],
      "seller": {
        "id": "string",
        "name": "string",
        "avatar": "string",
        "verified": boolean,
        "rating": number
      },
      "category": "string",
      "location": "string",
      "condition": "string",
      "description": "string",
      "createdAt": "ISO date string"
    }
  ],
  "success": true
}
```

#### GET /api/products/{id}

**Response:**

```json
{
  "data": {
    "id": "string",
    "title": "string",
    "price": number,
    "description": "string",
    "images": ["string"],
    "seller": { /* seller object */ },
    "specifications": [
      {"key": "string", "value": "string"}
    ]
  },
  "success": true
}
```

### Users API

#### GET /api/users/{id}

**Response:**

```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "isVerified": boolean,
    "createdAt": "ISO date string"
  },
  "success": true
}
```

#### PATCH /api/users/{id}

**Request Body:**

```json
{
  "name": "string",
  "avatar": "string"
}
```

### Authentication API

#### POST /api/auth/login

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "data": {
    "token": "string",
    "user": {
      /* user object */
    }
  },
  "success": true
}
```

#### POST /api/auth/register

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

### Messages API

#### GET /api/messages/conversations

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "lastMessage": "string",
      "time": "ISO date string",
      "unread": number,
      "product": "string"
    }
  ],
  "success": true
}
```

#### GET /api/messages/conversations/{id}

**Response:**

```json
{
  "data": {
    "messages": [
      {
        "id": "string",
        "sender": "string",
        "text": "string",
        "time": "ISO date string"
      }
    ]
  },
  "success": true
}
```

#### POST /api/messages/conversations/{id}

**Request Body:**

```json
{
  "message": "string"
}
```

### Orders API

#### GET /api/orders

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "buyer": {
        /* user object */
      },
      "seller": {
        /* user object */
      },
      "product": {
        /* product object */
      },
      "amount": "string",
      "currency": "string",
      "status": "pending|confirmed|shipped|delivered|completed|cancelled",
      "date": "ISO date string"
    }
  ],
  "success": true
}
```

#### POST /api/orders

**Request Body:**

```json
{
  "productId": "string",
  "sellerId": "string",
  "shippingAddress": {
    "fullName": "string",
    "address1": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "data": null,
  "success": false,
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## CORS Configuration

Make sure to configure CORS to allow requests from:

- Development: `http://localhost:3000`
- Production: `https://yourfrontend.com`

## Example Implementation Starters

### Node.js + Express

```javascript
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(req.query)
    res.json({
      data: products,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      data: null,
      success: false,
      message: error.message,
    })
  }
})
```

### Python + FastAPI

```python
@app.get("/api/products")
async def get_products(category: Optional[str] = None):
    try:
        products = await product_service.get_products(category)
        return {
            "data": products,
            "success": True
        }
    except Exception as e:
        return {
            "data": None,
            "success": False,
            "message": str(e)
        }
```

### Java + Spring Boot

```java
@GetMapping("/api/products")
public ResponseEntity<ApiResponse<List<Product>>> getProducts(
    @RequestParam(required = false) String category) {
    try {
        List<Product> products = productService.getProducts(category);
        return ResponseEntity.ok(new ApiResponse<>(products, true));
    } catch (Exception e) {
        return ResponseEntity.status(500)
            .body(new ApiResponse<>(null, false, e.getMessage()));
    }
}
```

## Testing

You can test your APIs using:

- Postman collections
- curl commands
- Automated testing tools

The frontend will automatically work once these endpoints are implemented correctly!
