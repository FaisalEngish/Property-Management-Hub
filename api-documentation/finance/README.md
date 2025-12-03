# Finance API Routes Documentation

## Overview
The Finance API provides comprehensive financial data management for HostPilotPro, including transaction tracking, analytics, reporting, and property-specific financial summaries.

## Base URL
All finance API endpoints are prefixed with `/api/finance`

## Authentication
All endpoints require demo authentication using `isDemoAuthenticated` middleware.

## Available Endpoints

### 1. Get All Finance Records
**GET** `/api/finance`

Returns all finance records for the authenticated organization.

**Response:**
```json
[
  {
    "id": 1,
    "type": "income",
    "amount": 15000,
    "category": "booking_revenue",
    "description": "Villa Samui Breeze - January booking",
    "propertyId": 1,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

### 2. Create Finance Record
**POST** `/api/finance`

Creates a new finance record.

**Request Body:**
```json
{
  "type": "income",
  "amount": 15000,
  "category": "booking_revenue",
  "description": "Villa booking payment",
  "propertyId": 1
}
```

### 3. Finance Analytics
**GET** `/api/finance/analytics`

Provides comprehensive financial analytics including revenue, expenses, and profit calculations.

**Response:**
```json
{
  "totalRevenue": 45000,
  "totalExpenses": 12000,
  "netProfit": 33000,
  "transactionCount": 25,
  "averageTransaction": 2280
}
```

### 4. Property Finance Summary
**GET** `/api/finance/summary-by-property`

Returns financial summary grouped by property.

**Response:**
```json
[
  {
    "propertyId": 1,
    "propertyName": "Villa Samui Breeze",
    "revenue": 25000,
    "expenses": 5000,
    "netProfit": 20000,
    "transactionCount": 8
  }
]
```

### 5. Monthly Finance Report
**GET** `/api/finance/monthly-report?year=2025&month=1`

Generates detailed monthly financial report.

**Query Parameters:**
- `year` (optional): Year for the report (defaults to current year)
- `month` (optional): Month for the report (defaults to current month)

**Response:**
```json
{
  "period": "2025-01",
  "totalRevenue": 15000,
  "totalExpenses": 3000,
  "transactionCount": 12,
  "transactionsByCategory": {
    "booking_revenue": {
      "income": 15000,
      "expense": 0,
      "count": 5
    },
    "maintenance": {
      "income": 0,
      "expense": 2000,
      "count": 3
    }
  }
}
```

### 6. Finance Categories
**GET** `/api/finance/categories`

Returns all available finance categories.

**Response:**
```json
[
  "booking_revenue",
  "maintenance",
  "utilities",
  "cleaning",
  "commission"
]
```

### 7. Villa-Specific Finance Query
**GET** `/api/finance/villa/:villaId?dateStart=YYYY-MM-DD&dateEnd=YYYY-MM-DD`

Retrieves revenue and commission data for a specific villa with optional date range filtering.

**Path Parameters:**
- `villaId` (required): Property/Villa ID

**Query Parameters:**
- `dateStart` (optional): Start date in YYYY-MM-DD format
- `dateEnd` (optional): End date in YYYY-MM-DD format

**Response:**
```json
{
  "villaId": 17,
  "dateStart": "2025-01-01",
  "dateEnd": "2025-01-31",
  "totalRevenue": 25000,
  "totalCommission": 2500,
  "bookingCount": 3,
  "commissionRecords": 3
}
```

### 8. Finance Dashboard
**GET** `/api/finance/dashboard`

Provides dashboard summary with current month metrics and recent transactions.

**Response:**
```json
{
  "totalProperties": 4,
  "monthlyRevenue": 15000,
  "monthlyExpenses": 3000,
  "totalTransactions": 12,
  "recentTransactions": [
    {
      "id": 1,
      "type": "income",
      "amount": 8000,
      "description": "Villa Aruna booking",
      "createdAt": "2025-01-20T14:30:00Z"
    }
  ]
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error description"
}
```

## Usage Examples

### JavaScript/TypeScript (Frontend)
```typescript
// Get finance analytics
const analytics = await fetch('/api/finance/analytics')
  .then(res => res.json());

// Create new finance record
const newRecord = await fetch('/api/finance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'expense',
    amount: 500,
    category: 'maintenance',
    description: 'Pool cleaning service',
    propertyId: 1
  })
}).then(res => res.json());

// Get villa-specific finance data with date range
const villaFinances = await fetch('/api/finance/villa/17?dateStart=2025-01-01&dateEnd=2025-01-31')
  .then(res => res.json());
```

### cURL Examples
```bash
# Get all finance records
curl -X GET http://localhost:5000/api/finance

# Get analytics
curl -X GET http://localhost:5000/api/finance/analytics

# Create finance record
curl -X POST http://localhost:5000/api/finance \
  -H "Content-Type: application/json" \
  -d '{"type":"income","amount":15000,"category":"booking_revenue","description":"Villa booking"}'
```