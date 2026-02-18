<p align="center">
  <img src="DOCUMENTS/logo.PNG" width="200" alt="Sharexpress Logo">
</p>
---


# Sharexpress

Sharexpress is a secure, session-based file sharing platform designed for time-limited file transfers using QR codes and controlled access policies.

Built with FastAPI, MongoDB, and S3-compatible storage, Sharexpress focuses on security, scalability, and production-ready backend architecture.





## Overview

Sharexpress enables:

- Session-bound file sharing
- QR-based device pairing
- Time-limited access control
- Secure presigned upload/download
- Storage integrity verification
- Background lifecycle management
- Horizontally scalable stateless APIs

The system is designed with a security-first and distributed-system mindset.

---

## Architecture

```
Client (Web / API)
        │
        ▼
FastAPI (Stateless API Layer)
        │
 ┌──────┼──────────────┐
 │      │              │
 ▼      ▼              ▼
Auth   QR Service   File Service
        │              │
        └──────┬───────┘
               ▼
MongoDB (Metadata) + S3 (Object Storage)
```

### Architectural Principles

- Stateless API instances (horizontal scaling ready)
- Direct-to-storage uploads via presigned URLs
- Two-phase upload verification
- Circuit breaker + retry mechanisms
- Rate limiting and quota enforcement

---

## Key Features

- RS256 JWT authentication
- QR-based secure session pairing
- Presigned upload & download URLs
- Rate limiting and daily quota control
- Circuit breaker for storage resilience
- Metrics and health endpoints
- Automatic expired file cleanup
- S3-compatible storage (MinIO / AWS S3)

---

## Quick Start

### Requirements

- Python 3.8+
- MongoDB 6.0+
- S3-compatible storage (MinIO / AWS S3)

### Run Locally

```bash
git clone https://github.com/yourusername/sharexpress
cd sharexpress

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload
```

Open API documentation:

```
http://localhost:8000/docs
```

---

## Deployment

### Docker

```bash
docker-compose up -d
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
```

Sharexpress is designed for horizontal scaling with stateless API instances behind a load balancer.

---

## Security Model

- Session-scoped access control
- Permission-based operations
- Expiring presigned URLs
- Filename sanitization
- MIME type verification
- Storage verification (HEAD object validation)
- Daily upload quota tracking
- Token-based authentication (RS256)

---

## Tech Stack

| Layer      | Technology        |
|------------|-------------------|
| Backend    | FastAPI           |
| Database   | MongoDB           |
| Storage    | MinIO / AWS S3    |
| Auth       | JWT (RS256)       |
| Async      | asyncio           |
| Deployment | Docker / Kubernetes |

---

## Roadmap

- WebSocket real-time updates
- File versioning
- Distributed caching (Redis)
- Enhanced observability
- Advanced security hardening

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

Apache License 2.0  
© 2026 Sharexpress Contributors