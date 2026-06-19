# Error Handling

## Logger

```typescript
console.log("mensaje"); // Desarrollo
console.error("error", e); // Errores
```

Niveles: El proyecto usa `console.log`/`console.error` directo. Sin LoggerService estructurado (decisión consciente).

## Sentry

Monitoreo en producción con sampling:

- Client: 25%
- Server: 50%
- Edge: 10%

Solo habilitado en producción.

## API Error Responses

Las API routes devuelven errores estructurados con código y mensaje.

## Rate limiting por IP

- Login: 5 intentos / 15 min
- Register: 5 / min
- Forgot password: 3 / min
