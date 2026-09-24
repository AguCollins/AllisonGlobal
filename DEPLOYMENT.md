# Allison Global — Production Deployment Guide

## Architecture

```
Internet → HTTPS :443 → Caddy → Next.js :3000 → Neon PostgreSQL
                                           ↓
                                    Upstash Redis (rate limiting)
```

## 1. Required Environment Variables

Copy `.env.example` to `.env.local` and fill in real values:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `AY...` |
| `NEXTAUTH_SECRET` | NextAuth JWT secret | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical app URL | `https://www.allisonglobal.tech` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO) | `https://www.allisonglobal.tech` |

## 2. Neon PostgreSQL Setup

1. Create a Neon project at https://neon.tech
2. Copy the connection string
3. Set `DATABASE_URL` in `.env.local`

## 3. Prisma Migration

```bash
# Create the initial migration (run once against Neon)
bunx prisma migrate dev --name init

# For production deployments (CI/CD):
bunx prisma migrate deploy
```

## 4. Database Seed

```bash
bun run scripts/seed.ts
```

This imports all static website data (services, projects, blog, etc.) into PostgreSQL. Idempotent — safe to run multiple times.

## 5. Admin Bootstrap

```bash
bun run scripts/bootstrap-admin.ts
```

Creates the first superadmin user interactively. Prompts for email, name, and password (min 12 chars).

## 6. Upstash Redis Setup

1. Create an Upstash Redis database at https://upstash.com
2. Copy the REST URL and token
3. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`

## 7. Caddy Setup

```bash
# Install Caddy
sudo apt install caddy

# Copy the Caddyfile (replace allisonglobal.tech with your domain)
sudo cp Caddyfile /etc/caddy/Caddyfile

# Caddy automatically provisions TLS certificates via Let's Encrypt
sudo systemctl restart caddy
```

## 8. Firewall Configuration

```bash
# Only allow HTTP (80, for redirect) and HTTPS (443) externally
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Next.js port 3000 must NOT be accessible externally
# Block it:
sudo ufw deny 3000/tcp
```

## 9. Build & Start

```bash
# Build
bun run build

# Start production server
NODE_ENV=production node .next/standalone/server.js
```

## 10. Health Check

```bash
curl https://www.allisonglobal.tech/api/health
# → {"status":"ok","checks":{"database":true,"redis":true}}
```

Returns 503 if any dependency is unavailable.

## 11. Backup Strategy

### Neon PostgreSQL
- Neon provides automatic point-in-time recovery (up to 7 days on free tier)
- For manual backups: `pg_dump $DATABASE_URL > backup.sql`
- Schedule daily backups via cron: `0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +%F).sql.gz`

### Restore
```bash
gunzip -c /backups/db-2025-01-01.sql.gz | psql $DATABASE_URL
```

## 12. Rollback Procedure

1. **Code rollback**: `git checkout <previous-release-tag> && bun run build && pm2 restart all`
2. **Database rollback**: `pg_dump` from before migration → `psql $DATABASE_URL < backup.sql`
3. **Migration rollback**: `bunx prisma migrate resolve --rolled-back <migration-name>`

## 13. Secret Rotation

```bash
# Rotate NEXTAUTH_SECRET
openssl rand -base64 32  # generate new secret
# Update .env.local → restart server
# All existing sessions are invalidated (users must re-login)

# Rotate Upstash token
# Create new token in Upstash console → update .env.local → restart

# Rotate Neon password
# Update password in Neon console → update DATABASE_URL → restart
```

## 14. Admin Bootstrap Procedure

1. Deploy the application
2. Set all environment variables
3. Run `bunx prisma migrate deploy`
4. Run `bun run scripts/seed.ts`
5. Run `bun run scripts/bootstrap-admin.ts`
6. Log in at `/admin/login`

## 15. Monitoring

### Sentry (optional but recommended)
1. Create a Sentry project at https://sentry.io
2. Set `SENTRY_DSN` environment variable
3. The application is instrumented to capture server errors

### Health endpoint
- `/api/health` — monitors DB + Redis connectivity
- Set up external monitoring (UptimeRobot, etc.) to poll this endpoint

## 16. Incident Response

1. **Site down**: Check `/api/health` → if DB down, check Neon status → if Redis down, check Upstash status
2. **Lead API failing**: Check health endpoint → check database connectivity → check rate limiting
3. **Admin locked out**: Run `bun run scripts/bootstrap-admin.ts` with a new superadmin email
4. **Security incident**: Check audit log at `/admin/audit` → rotate all secrets → reset affected admin passwords
