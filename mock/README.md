# Mock Data Files

This directory contains mock data files for development and testing purposes. These files provide realistic sample data that matches the TypeScript interfaces defined in the application.

## Files

### `surgeData.json`

Contains mock data for the Smart Optimization Engine feature:

- **surgeZones**: Array of surge pricing zones with location, multiplier, and platform information
- **recommendations**: Array of earning recommendations with estimated earnings and confidence scores
- **lastUpdated**: Timestamp of when the data was last updated

### `incomeData.json`

Contains mock data for the Multi-platform Income Tracking feature:

- **accounts**: Array of connected bank accounts with balance and connection status
- **transactions**: Array of income transactions from various gig platforms
- **summary**: Income summary with total earnings, goals, and progress tracking

### `subscriptionData.json`

Contains mock data for the RevenueCat Subscription system:

- **status**: Current subscription status and active features
- **availablePlans**: Array of subscription plans with pricing and features
- **features**: Array of feature definitions with tier requirements
- **mockPurchaseInfo**: Sample purchase information for testing

## Validation

All mock data files are validated against TypeScript interfaces using the validation utilities in `src/types/validation.ts` and `src/utils/mockData.ts`.

### Running Validation

To validate all mock data files, run:

```bash
node scripts/validateMockData.js
```

This will check that all mock data files:

- Can be parsed as valid JSON
- Match the expected data structure
- Contain all required fields
- Have correct data types for all properties

### Using in Services

Services can load and validate mock data using the utilities:

```typescript
import {
  loadSurgeData,
  loadIncomeData,
  loadSubscriptionData,
} from "../utils/mockData";

// In your service file
const mockData = require("../../mock/surgeData.json");
const validatedData = loadSurgeData(mockData);
```

## Data Structure

### Surge Data Structure

```typescript
interface OptimizationData {
  surgeZones: SurgeZone[];
  recommendations: Recommendation[];
  lastUpdated: string;
}
```

### Income Data Structure

```typescript
interface IncomeData {
  accounts: Account[];
  transactions: Transaction[];
  summary: IncomeSummary;
}
```

### Subscription Data Structure

```typescript
interface SubscriptionData {
  status: SubscriptionStatus;
  availablePlans: SubscriptionPlan[];
  features: SubscriptionFeature[];
  mockPurchaseInfo?: PurchaseInfo;
}
```

## Development Notes

- All mock data uses realistic values and scenarios
- Timestamps are in ISO 8601 format
- Currency amounts are in USD
- Platform names match real gig economy platforms
- Location data uses San Francisco coordinates for consistency
- All IDs use descriptive prefixes (e.g., "zone*", "txn*", "acc\_")

## Updating Mock Data

When updating mock data files:

1. Ensure the data structure matches the TypeScript interfaces
2. Run the validation script to verify correctness
3. Update this README if new fields or structures are added
4. Consider the impact on existing services and components

## Testing

Mock data validation is tested through:

- Basic JSON parsing validation
- Structure validation against TypeScript interfaces
- Type checking for all required fields
- Consistency checks across related data

The validation script provides detailed feedback on any issues found in the mock data files.
