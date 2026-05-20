# Scalability Notes

## Current Architecture
Single Node.js + PostgreSQL server — suitable for development and small deployments.

---

## Scaling Strategies

### 1. Horizontal Scaling (Stateless API)
The JWT-based auth is stateless — no session stored on server. This means multiple API instances can run in parallel behind a **load balancer** (e.g., NGINX, AWS ALB) without shared session state.

```
Client → Load Balancer → [API Instance 1]
                       → [API Instance 2]
                       → [API Instance 3]
                         All read from same PostgreSQL
```

### 2. Caching with Redis
Add Redis to reduce DB reads for frequently accessed data:
- Cache user profile after login (`/auth/me`)
- Cache task list per user with TTL of 60 seconds
- Invalidate cache on write (create/update/delete)

```js
// Example: cache tasks per user
const cacheKey = `tasks:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
const tasks = await Task.findAllByUser(userId);
await redis.setex(cacheKey, 60, JSON.stringify(tasks));
```

### 3. Microservices Split
As the app grows, split into independent services:
- **Auth Service** — handles register, login, token validation
- **Task Service** — CRUD for tasks
- **Notification Service** — email/push on task updates
- Each communicates via REST or message queues (RabbitMQ, Kafka)

### 4. Database Scaling
- Add **read replicas** in PostgreSQL for read-heavy traffic
- Use **connection pooling** (PgBouncer) to limit DB connections
- Add **indexes** on frequently queried columns (`email`, `user_id`, `status`)

### 5. Docker & Deployment
```yaml
# docker-compose.yml outline
services:
  api:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [db, redis]
  db:
    image: postgres:15
  redis:
    image: redis:7
```

Deploy to:
- **AWS ECS / Fargate** for managed containers
- **Railway / Render** for simpler deploys
- **Kubernetes** for enterprise-scale orchestration

### 6. Rate Limiting & DDoS Protection
Add `express-rate-limit` to prevent abuse on auth endpoints:
```js
const rateLimit = require('express-rate-limit');
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
```

---

## Summary Table

| Concern         | Solution                          |
|-----------------|-----------------------------------|
| API scaling     | Horizontal + Load Balancer        |
| DB reads        | Redis caching                     |
| DB writes       | Write replicas / sharding         |
| Feature growth  | Microservices architecture        |
| Auth state      | Stateless JWT (already done)      |
| Deployment      | Docker + CI/CD pipeline           |
| Abuse           | Rate limiting + input validation  |
