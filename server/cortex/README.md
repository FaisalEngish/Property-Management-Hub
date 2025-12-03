# Captain Cortex AI - Internal DB-grounded Q&A System

## Overview
Captain Cortex AI provides intelligent, data-grounded answers by querying internal database records instead of making assumptions. The system analyzes natural language questions, extracts entities, fetches relevant data from the database, and generates accurate responses using GPT-4o-mini.

## Features
- ✅ **Intent Detection**: Identifies question type (property, utility, task, booking, finance)
- ✅ **Entity Extraction**: Parses property names, dates, utility types, statuses
- ✅ **Read-Only Connectors**: Safe database queries with timeout & retry logic
- ✅ **Data Grounding**: Merges data from multiple sources for comprehensive answers
- ✅ **60s Caching**: Reduces API costs and improves response time
- ✅ **Audit Logging**: Tracks all queries with organizationId, userId, latency
- ✅ **Graceful Fallback**: Clear messages when data is missing

## API Endpoints

### POST /api/cortex/answer
Main endpoint for processing questions.

**Request:**
```json
{
  "question": "Villa Samui Breeze October electricity bill paid?"
}
```

**Response:**
```json
{
  "answer": "Based on the internal data, Villa Samui Breeze's electricity bill for October 2025 shows...",
  "sources": [
    {
      "route": "/api/properties",
      "params": { "organizationId": "default-org", "name": "Villa Samui Breeze" }
    },
    {
      "route": "/api/utility-bills",
      "params": { "organizationId": "default-org", "propertyId": 1, "type": "electricity", "month": "10", "year": 2025 }
    }
  ],
  "latency": 850,
  "cached": false,
  "intent": "utility_query",
  "confidence": 0.75,
  "question": "Villa Samui Breeze October electricity bill paid?",
  "organizationId": "default-org"
}
```

### POST /api/cortex/cache/invalidate
Invalidate cache entries (for debugging).

**Request:**
```json
{
  "pattern": "cortex:default-org"
}
```

## Example Queries

### 1. Utility Bills
**Q:** "Villa A October electricity bill paid?"  
**Response:** Fetches utility bills data and confirms payment status with dates.

### 2. Tasks
**Q:** "How many pending maintenance tasks?"  
**Response:** Counts pending tasks filtered by status and type.

### 3. Bookings
**Q:** "Is Test Villa booked next weekend?"  
**Response:** Checks booking overlaps for the specified date range.

### 4. Finance
**Q:** "What was the net profit in September 2025?"  
**Response:** Calculates income - expenses for the specified month.

### 5. Missing Data
**Q:** "Property XYZ bill status?"  
**Response:** "I couldn't find any relevant information for Property XYZ. Please check the property name..."

## Technical Architecture

### 1. Intent Detection (`intent.ts`)
- Pattern matching with keyword weighting
- Confidence scoring based on match density
- Actionable threshold: 0.15 minimum confidence

### 2. Entity Extraction (`extract.ts`)
- Property names: "Villa [Name]" pattern or quoted text
- Dates: Natural language (October, next weekend) → ISO dates
- Utility types: electricity, water, internet, gas, waste, security
- Statuses: pending, completed, in-progress, cancelled

### 3. Data Connectors (`connectors.ts`)
- **Timeout**: 3 seconds default
- **Retry**: 2 attempts with exponential backoff
- **Organization Filtering**: Mandatory `organizationId` on all queries
- **Methods**: 
  - `fetchProperties()`
  - `fetchUtilityBills()`
  - `fetchTasks()`
  - `fetchBookings()`
  - `fetchFinances()`

### 4. Data Grounder (`grounder.ts`)
- Fetches data from multiple connectors in parallel
- Normalizes data for LLM consumption
- Provides source metadata for debugging

### 5. Answer Generator (`answer.ts`)
- **Model**: GPT-4o-mini
- **Temperature**: 0.2 (factual responses)
- **System Prompt**: Enforces data-only responses, no speculation
- **Fallback**: Clear error messages when data is unavailable

### 6. Cache (`cache.ts`)
- **TTL**: 60 seconds
- **Key Format**: `cortex:{organizationId}:{normalized_question}`
- **Invalidation**: Manual or triggered by data changes

## Performance Targets
- **Average Latency**: ≤ 1200ms (cache miss)
- **Cache Hit Latency**: ≤ 200ms
- **Timeout**: 3s per connector
- **Retry**: 2x with exponential backoff

## Security
- ✅ Read-only database access (no CREATE/UPDATE/DELETE)
- ✅ Organization-based isolation (multi-tenant safe)
- ✅ Authenticated requests only (`isDemoAuthenticated` middleware)
- ✅ Audit logging for all queries

## Integration with Utility Alert System

Captain Cortex AI can be integrated with the existing Smart Utility Reminder System to provide:
1. **Context-aware alerts**: "Villa A electricity bill due in 3 days"
2. **Intelligent follow-ups**: Auto-escalate if bill remains unpaid
3. **Smart reminders**: Based on past payment patterns
4. **Natural language queries**: "Which properties have overdue bills?"

## Extending the System

### Adding New Intent Types
Edit `server/cortex/intent.ts`:
```typescript
const INTENT_PATTERNS = {
  // ...existing patterns
  new_intent_type: ['keyword1', 'keyword2', 'keyword3']
};
```

### Adding New Entities
Edit `server/cortex/extract.ts`:
```typescript
export interface ExtractedEntities {
  // ...existing entities
  newEntity?: string;
}
```

### Adding New Data Sources
Edit `server/cortex/connectors.ts`:
```typescript
export async function fetchNewDataSource(options: ConnectorOptions & { /* params */ }) {
  // Implementation
}
```

## Monitoring & Debugging

### View Logs
All Cortex operations are logged with `[CORTEX]` prefix:
```
[CORTEX] Processing { intent: 'utility_query', organizationId: 'default-org', routes: [...], latency: 850 }
[CORTEX CACHE] Hit { key: 'cortex:default-org:villa a bill', age: 15000 }
```

### Cache Statistics
Check cache performance:
- Total entries
- Active vs expired
- TTL settings

### Latency Tracking
Monitor response times:
- Total query latency
- Individual connector latency
- LLM response time

## Future Enhancements
- [ ] Multi-channel notifications (Email, SMS, WhatsApp, Slack)
- [ ] Predictive alerts based on historical patterns
- [ ] Voice input support
- [ ] Multi-language support with auto-translation
- [ ] Advanced analytics and insights
