# Known Limitations

> Estado actual de limitaciones conocidas del proyecto. No se planea resolverlas a menos que se conviertan en blockers.

---

---

---

## 3. DSNs de Sentry hardcodeados en `.env.*`

Los archivos `.env.development`, `.env.production` y `.env.staging` contienen DSNs de Sentry quemados. Deberían ser solo variables de entorno de runtime.

**Impacto:** Bajo. Los DSNs de Sentry son públicos por diseño.

---

## 4. Rate limiting inconsistente

Login tiene rate limit (5/15min), Register (5/min), Forgot (3/min). Falta rate limiting en:

- Reset password
- Tasks API (POST/PUT/DELETE)

**Impacto:** Bajo. Para un proyecto de portafolio, el riesgo es mínimo.

---

## 5. Sin LoggerService estructurado

El proyecto usa `console.error` directo en vez de un logger estructurado con niveles.

**Impacto:** Bajo. Para debugging es suficiente.

---

## 6. Analytics endpoint no configurado

`src/lib/analytics.ts` tiene un cliente con queue y sendBeacon, pero `NEXT_PUBLIC_ANALYTICS_ENDPOINT` no está configurado en ningún `.env`.

**Impacto:** Bajo. No es crítico para un portafolio.

---

## 7. Account lockout no implementado

Schema tiene `failedAttempts` y `lockedUntil` pero la lógica de bloqueo no está implementada.

**Impacto:** Bajo. Rate limiting ya mitiga ataques de fuerza bruta.

---

## 8. Email verification no implementado

Schema tiene `emailVerified` y `emailToken` pero no hay flujo de verificación de email.

**Impacto:** Bajo. Para un proyecto de portafolio no es crítico.

---

## 9. Sin health check endpoint

No existe `/api/health` para monitoreo.

**Impacto:** Bajo. Vercel maneja health checks internamente.
