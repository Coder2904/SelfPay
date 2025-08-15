# Services

This directory contains service classes that handle business logic and external API integrations.

## AuthService

The `AuthService` handles authentication with Supabase integration and mock data switching logic.

### Features

- **Mock/Real Data Switching**: Automatically switches between mock data and Supabase based on `USE_MOCK_DATA` flag
- **Secure Token Storage**: Uses Expo SecureStore for secure token and user data storage
- **Biometric Authentication**: Supports biometric authentication setup and validation
- **Token Management**: Handles token refresh and expiration detection
- **User Management**: Supports login, signup, and logout operations

### Usage

```typescript
import { authService } from "../services/AuthService";

// Login
const loginResult = await authService.login({
  email: "demo@selfpay.com",
  password: "password123",
});

// Signup
const signupResult = await authService.signup({
  email: "new@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
});

// Setup biometric authentication
const biometricResult = await authService.setupBiometric();

// Authenticate with biometrics
const biometricAuth = await authService.authenticateWithBiometric();

// Logout
const logoutResult = await authService.logout();
```

### Mock Data

When `USE_MOCK_DATA` is true, the service uses data from `mock/authData.json`:

- **Demo User**: `demo@selfpay.com` / `password123`
- **Test User**: `test@example.com` / `test123`

### Dependencies

- `@supabase/supabase-js`: Supabase client for real authentication
- `expo-secure-store`: Secure storage for tokens and sensitive data
- `expo-local-authentication`: Biometric authentication support

### Security Features

- Secure token storage using Expo SecureStore
- Token expiration detection and automatic refresh
- Biometric authentication with device capability detection
- Secure cleanup of user data on logout

### TODO Comments

The service includes `// TODO manual implementation` comments for areas that require manual implementation in future iterations:

- User data retrieval from stored preferences
- Enhanced error handling for specific scenarios
- Additional authentication methods (social login, etc.)
