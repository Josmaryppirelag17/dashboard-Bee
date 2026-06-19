# Error Handling

## Logger

```typescript
console.log("message"); // Development
console.error("error", e); // Errors
```

Levels: The project uses direct `console.log`/`console.error`. No structured LoggerService (conscious decision).

## Sentry

Production monitoring with sampling:

- Client: 25%
- Server: 50%
- Edge: 10%

Only enabled in production.

## API Error Responses

API routes return structured errors with code and message.

## Rate limiting by IP

- Login: 5 attempts / 15 min
- Register: 5 / min
- Forgot password: 3 / min
