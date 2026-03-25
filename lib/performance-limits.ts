/** Límites para consultas y UI: equilibrio entre historial útil y peso en red/JS. */

/** Mensajes por conversación cargados en el cliente (más recientes). */
export const CHAT_THREAD_MESSAGE_LIMIT = 500

/** Mensajes máximos para armar el inbox admin (preview + no leídos). */
export const ADMIN_MESSAGES_INBOX_CAP = 4000

/** Sesiones completadas máx. al calcular métricas del coach (orden desc por fecha). */
export const COACH_OVERVIEW_SESSIONS_CAP = 2500

/** Sesiones máx. en dashboard cliente (volumen, gráfica, conteos). */
export const CLIENT_DASHBOARD_SESSIONS_CAP = 2000
