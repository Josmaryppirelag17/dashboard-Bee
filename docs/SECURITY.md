# Security

## Headers

| Header                 | Valor                      |
| ---------------------- | -------------------------- |
| CSP                    | Nonce-based strict-dynamic |
| HSTS                   | Preload                    |
| X-Frame-Options        | DENY                       |
| X-Content-Type-Options | nosniff                    |

## Authentication

- bcryptjs (12 rounds)
- httpOnly cookies
- Rate limiting: Login 5/15min, Register 5/min, Forgot 3/min
- Token reset 1h expiration
- Invalidación de sesiones en password reset

## Validación

- Zod en todas las rutas API (auth y tasks)
- Sanitización XSS

## Resultados

| Auditoría           | Resultado      |
| ------------------- | -------------- |
| Mozilla Observatory | **A+** (10/10) |
