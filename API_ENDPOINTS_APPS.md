# Admin Apps - API Endpoints Documentation

This document outlines all API endpoints for the `/admin/apps/` module.

## Status Legend
- ✅ **Implemented** - Endpoint exists and is functional
- ⚠️ **Stub Only** - Endpoint exists but returns mock data
- ❌ **Missing** - Endpoint needs to be created

---

## 🔌 Integrations

### List Integrations
```http
GET /api/admin/apps/integrations
```
**Status:** ⚠️ Stub Only (returns mock data)

**Response:**
```json
[
  {
    "id": "1",
    "provider": "supabase",
    "name": "Supabase",
    "status": "connected",
    "lastPing": 12,
    "config": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Integration
```http
POST /api/admin/apps/integrations
Content-Type: application/json
```
**Status:** ⚠️ Stub Only

**Request Body:**
```json
{
  "provider": "supabase",
  "name": "Supabase",
  "config": {
    "projectUrl": "https://xxx.supabase.co",
    "anonKey": "xxx",
    "serviceKey": "xxx"
  }
}
```

**Response:**
```json
{
  "id": "123",
  "provider": "supabase",
  "name": "Supabase",
  "status": "connected",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Update Integration
```http
PATCH /api/admin/apps/integrations/[id]
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "config": {
    "projectUrl": "https://new.supabase.co"
  }
}
```

---

### Delete Integration
```http
DELETE /api/admin/apps/integrations/[id]
```
**Status:** ❌ Missing

**Response:**
```json
{
  "success": true,
  "message": "Integration deleted successfully"
}
```

---

### Ping Integration
```http
POST /api/admin/apps/integrations/[id]/ping
```
**Status:** ❌ Missing

**Response:**
```json
{
  "status": "ok",
  "latency": 45,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## 🔗 Webhooks

### List Webhooks
```http
GET /api/admin/apps/webhooks
```
**Status:** ❌ Missing

**Query Parameters:**
- `direction` (optional): `incoming` | `outgoing`

**Response:**
```json
[
  {
    "id": "1",
    "direction": "outgoing",
    "name": "Slack Notifications",
    "url": "https://hooks.slack.com/xxx",
    "secretLast4": "...b5c8",
    "enabled": true,
    "lastStatus": "200",
    "lastFired": "2024-01-15T09:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Create Webhook
```http
POST /api/admin/apps/webhooks
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "name": "Slack Notifications",
  "direction": "outgoing",
  "url": "https://hooks.slack.com/xxx",
  "secret": "webhook-secret-key"
}
```

---

### Update Webhook
```http
PATCH /api/admin/apps/webhooks/[id]
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "enabled": false
}
```

---

### Delete Webhook
```http
DELETE /api/admin/apps/webhooks/[id]
```
**Status:** ❌ Missing

---

### Test Webhook
```http
POST /api/admin/apps/webhooks/test
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "webhookId": "1",
  "payload": {
    "event": "test",
    "data": {
      "message": "Hello from TWR"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "latency": 123,
  "response": {...}
}
```

---

## 📜 Scripts

### List Scripts
```http
GET /api/admin/apps/scripts
```
**Status:** ❌ Missing

---

### Create Script
```http
POST /api/admin/apps/scripts
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "name": "Daily Backup",
  "description": "Backup database to S3",
  "schedule": "0 0 * * *",
  "codeRef": "scripts/backup.js"
}
```

---

### Run Script
```http
POST /api/admin/apps/scripts/run
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "scriptId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec-123",
  "startedAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Script Logs
```http
GET /api/admin/apps/scripts/[id]/logs
```
**Status:** ❌ Missing

**Query Parameters:**
- `limit` (optional): number of logs to return (default: 100)

---

## 🚀 Automations

### List Automations
```http
GET /api/admin/apps/automations
```
**Status:** ❌ Missing

---

### Create Automation
```http
POST /api/admin/apps/automations
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "name": "New User Welcome",
  "trigger": "event:user.created",
  "actions": [
    {
      "type": "email",
      "config": {
        "template": "welcome",
        "to": "{{user.email}}"
      }
    }
  ]
}
```

---

### Toggle Automation
```http
PATCH /api/admin/apps/automations/[id]
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "enabled": false
}
```

---

### Run Automation
```http
POST /api/admin/apps/automations/[id]/run
```
**Status:** ❌ Missing

---

## ⚙️ Jobs

### List Jobs
```http
GET /api/admin/apps/jobs
```
**Status:** ❌ Missing

**Query Parameters:**
- `queue` (optional): filter by queue name
- `status` (optional): filter by status

**Response:**
```json
{
  "jobs": [...],
  "metrics": {
    "queued": 5,
    "active": 2,
    "completed": 100,
    "failed": 3
  }
}
```

---

### Get Job Details
```http
GET /api/admin/apps/jobs/[id]
```
**Status:** ❌ Missing

---

### Retry Failed Job
```http
POST /api/admin/apps/jobs/[id]/retry
```
**Status:** ❌ Missing

---

### Cancel Job
```http
POST /api/admin/apps/jobs/[id]/cancel
```
**Status:** ❌ Missing

---

## ✅ Tasks

### List Tasks
```http
GET /api/admin/apps/tasks
```
**Status:** ❌ Missing

---

### Create Task
```http
POST /api/admin/apps/tasks
Content-Type: application/json
```
**Status:** ❌ Missing

---

### Update Task
```http
PATCH /api/admin/apps/tasks/[id]
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "status": "paused"
}
```

---

### Run Task
```http
POST /api/admin/apps/tasks/[id]/run
```
**Status:** ❌ Missing

---

## 🔐 Vault (API Keys)

### List API Keys
```http
GET /api/admin/apps/vault
```
**Status:** ❌ Missing

**Response:**
```json
[
  {
    "id": "1",
    "label": "Production API",
    "scope": "api:production",
    "last4": "...a3f4",
    "enabled": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUsedAt": "2024-01-15T09:00:00Z"
  }
]
```

---

### Create API Key
```http
POST /api/admin/apps/vault
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "label": "Production API",
  "scope": "api:production",
  "secret": "your-secret-key",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "1",
  "label": "Production API",
  "scope": "api:production",
  "fullKey": "twr_abc123...", // Only returned on creation
  "last4": "...f456",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Rotate API Key
```http
POST /api/admin/apps/vault/[id]/rotate
```
**Status:** ❌ Missing

---

### Delete API Key
```http
DELETE /api/admin/apps/vault/[id]
```
**Status:** ❌ Missing

---

## 🔨 Custom Apps

### List Custom Apps
```http
GET /api/admin/apps/custom
```
**Status:** ❌ Missing

---

### Create Custom App
```http
POST /api/admin/apps/custom
Content-Type: application/json
```
**Status:** ❌ Missing

---

### Run Custom App
```http
POST /api/admin/apps/custom/[id]/run
Content-Type: application/json
```
**Status:** ❌ Missing

**Request Body:**
```json
{
  "inputs": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

---

## 💚 Health Checks

### Get Health Status
```http
GET /api/admin/apps/health
```
**Status:** ✅ Implemented (with mock data)

**Response:**
```json
[
  {
    "provider": "Supabase",
    "status": "ok",
    "latencyMs": 12,
    "checkedAt": "2024-01-15T10:00:00Z"
  },
  {
    "provider": "Discord",
    "status": "error",
    "latencyMs": 0,
    "checkedAt": "2024-01-15T10:00:00Z",
    "message": "Invalid token"
  }
]
```

---

### Run Health Checks
```http
POST /api/admin/apps/health
```
**Status:** ✅ Implemented (returns same mock data)

---

## 📊 Quotas

### Get Usage Quotas
```http
GET /api/admin/apps/quotas
```
**Status:** ❌ Missing

**Response:**
```json
{
  "quotas": [
    {
      "provider": "OpenAI",
      "unit": "tokens",
      "used": 450000,
      "limit": 1000000,
      "period": "monthly",
      "resetAt": "2024-02-01T00:00:00Z"
    }
  ],
  "summary": {
    "atRisk": 2,
    "averageUsage": 65.4,
    "totalServices": 6
  }
}
```

---

### Export Quotas Report
```http
GET /api/admin/apps/quotas/export
```
**Status:** ❌ Missing

**Response:** CSV file download

---

## 🔒 Authentication

All endpoints require SuperAdmin authentication.

**Headers:**
```http
Cookie: next-auth.session-token=xxx
```

Or for API access:
```http
Authorization: Bearer <admin-api-key>
```

---

## Error Responses

All endpoints may return these error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### Common Error Codes:
- `401` - Unauthorized (not logged in or invalid credentials)
- `403` - Forbidden (not SuperAdmin)
- `404` - Resource not found
- `422` - Validation error
- `429` - Rate limit exceeded
- `500` - Internal server error

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Health checks (already done)
2. Webhooks CRUD
3. Scripts execution
4. Vault (API keys) management

### Medium Priority
5. Jobs queue management
6. Tasks management
7. Automations CRUD

### Low Priority (Can use mock data initially)
8. Custom apps builder
9. Quotas tracking
10. Export/reporting features
