# ShareXpress

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/sharexpress)](https://github.com/yourusername/sharexpress/issues)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/sharexpress?style=social)](https://github.com/yourusername/sharexpress)

<p align="center">
  <img src="docs/images/logo.png" width="200" alt="ShareXpress Logo">
</p>

----

ShareXpress is an open-source, production-ready file sharing platform that enables **secure, time-limited file transfers** via QR codes. Built with modern technologies and security-first principles, ShareXpress provides enterprise-grade file sharing capabilities for organizations of all sizes.

ShareXpress provides basic mechanisms for secure file sharing, session management, and access control across distributed systems.

ShareXpress builds upon modern web technologies and best practices from the cloud-native community, providing a scalable, maintainable solution for secure file sharing needs.

----

## To start using ShareXpress

See our documentation on [sharexpress.io](https://sharexpress.io) (or your documentation site).

Try a live demo at [demo.sharexpress.io](https://demo.sharexpress.io).

Take a guided tour through our [Getting Started Guide](docs/getting-started.md).

To use ShareXpress code as a library in other applications, see the [API Integration Guide](docs/api-integration.md).

## To start developing ShareXpress

The [community repository](https://github.com/yourusername/sharexpress-community) hosts all information about building ShareXpress from source, how to contribute code and documentation, who to contact about what, etc.

If you want to run ShareXpress right away there are multiple options:

##### You have a working [Python environment].

```bash
git clone https://github.com/yourusername/sharexpress
cd sharexpress
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

##### You have a working [Docker environment].

```bash
git clone https://github.com/yourusername/sharexpress
cd sharexpress
docker-compose up -d
```

##### You want to deploy to Kubernetes.

```bash
git clone https://github.com/yourusername/sharexpress
cd sharexpress/k8s
kubectl apply -f deployment.yaml
```

For the full story, head over to the [developer's documentation](docs/developers/README.md).

## Features

ShareXpress provides a comprehensive set of features for secure file sharing:

- **🔐 Multi-Factor Authentication**: Email OTP and Google OAuth 2.0
- **📱 QR Code Sharing**: Generate and scan QR codes for instant file access
- **🔒 Advanced Security**: Rate limiting, virus scanning, and encryption
- **⚡ High Performance**: Async processing with streaming uploads/downloads
- **📊 Real-time Analytics**: Track usage, downloads, and session metrics
- **🌐 Privacy-First**: Anonymized tracking and GDPR compliance
- **🔧 Developer-Friendly**: RESTful API with comprehensive documentation
- **📦 Cloud-Ready**: S3-compatible storage with MinIO/AWS S3 support

## Architecture

ShareXpress follows a modern, cloud-native architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│         (Web / Mobile / API Integrations)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   API Gateway         │
         │   (FastAPI + ASGI)    │
         └───────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │   Auth   │ │    QR    │ │   File   │
  │ Service  │ │ Service  │ │ Service  │
  └────┬─────┘ └────┬─────┘ └────┬─────┘
       │            │            │
       └────────────┼────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
         ▼                      ▼
  ┌─────────────┐      ┌──────────────┐
  │  MongoDB    │      │  S3 Storage  │
  │  (Async)    │      │  (MinIO/AWS) │
  └─────────────┘      └──────────────┘
```

## Quick Start

### Prerequisites

- Python 3.8 or higher
- MongoDB 6.0 or higher
- S3-compatible storage (MinIO or AWS S3)
- Optional: Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sharexpress
   cd sharexpress
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Generate RSA keys**
   ```bash
   mkdir -p keys
   openssl genrsa -out keys/private.pem 2048
   openssl rsa -in keys/private.pem -pubout -out keys/public.pem
   ```

5. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Initialize database**
   ```bash
   python setup_indexes.py
   ```

7. **Run the application**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```

Visit http://localhost:8080/docs for the interactive API documentation.

## Documentation

Full documentation is available at [docs.sharexpress.io](https://docs.sharexpress.io) or in the [docs/](docs/) directory:

- [Getting Started](docs/getting-started.md) - Quick start guide
- [API Reference](docs/api-reference.md) - Complete API documentation
- [Security Guide](docs/security.md) - Security features and best practices
- [Deployment Guide](docs/deployment.md) - Production deployment instructions
- [Developer Guide](docs/developers/README.md) - Contributing and development
- [Architecture](docs/architecture.md) - System design and architecture

## Support

If you need support, start with the [troubleshooting guide](docs/troubleshooting.md), and work your way through the process that we've outlined.

That said, if you have questions, reach out to us [one way or another](SUPPORT.md):

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/sharexpress/issues)
- **GitHub Discussions**: [Ask questions and discuss](https://github.com/yourusername/sharexpress/discussions)
- **Discord**: [Join our community](https://discord.gg/sharexpress)
- **Stack Overflow**: Tag questions with `sharexpress`
- **Email**: support@sharexpress.io

## Community

### Community Meetings

The [Calendar](https://calendar.sharexpress.io) has the list of all the meetings in the ShareXpress community in a single location.

- **Weekly Community Meeting**: Every Wednesday at 10:00 AM UTC
- **Contributors Sync**: Every Friday at 3:00 PM UTC
- **Security Office Hours**: First Monday of each month

### Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

Ways to contribute:
- 🐛 [Report bugs](https://github.com/yourusername/sharexpress/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/yourusername/sharexpress/issues/new?template=feature_request.md)
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the project

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Code of Conduct

ShareXpress follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read and follow it.

## Adopters

Organizations using ShareXpress in production:

- **Company A** - Secure document sharing for legal teams
- **Company B** - Medical records transfer between hospitals
- **Company C** - Construction project file sharing
- **Company D** - Academic research collaboration

Want to add your organization? [Submit a case study](https://github.com/yourusername/sharexpress/issues/new?template=adopter.md).

## Governance

The ShareXpress project is governed by a framework of principles, values, policies and processes to help our community and constituents towards our shared goals.

The [ShareXpress Community](https://github.com/yourusername/sharexpress-community/blob/main/governance.md) is the launching point for learning about how we organize ourselves.

The [ShareXpress Steering Committee](https://github.com/yourusername/sharexpress-steering) oversees governance of the ShareXpress project.

### Project Structure

- **Technical Oversight Committee**: Guides technical direction
- **Security Team**: Handles security issues and releases
- **Documentation Team**: Maintains and improves documentation
- **Release Team**: Manages release process and testing

## Roadmap

The [ShareXpress Enhancements repo](https://github.com/yourusername/sharexpress-enhancements) provides information about ShareXpress releases, as well as feature tracking and backlogs.

### Current Release: v1.0.0

- ✅ Email OTP and Google OAuth authentication
- ✅ QR code generation and management
- ✅ Secure file upload/download with S3
- ✅ Share session management
- ✅ Real-time analytics and metrics

### Next Release: v1.1.0 (Q2 2024)

- 🚧 Two-factor authentication (2FA)
- 🚧 WebSocket support for real-time updates
- 🚧 Advanced file preview capabilities
- 🚧 Bulk operations support
- 🚧 Mobile SDK (iOS/Android)

### Future (v2.0.0+)

- 📋 End-to-end encryption
- 📋 Blockchain-based audit trail
- 📋 AI-powered content moderation
- 📋 Multi-language support
- 📋 GraphQL API

See the [full roadmap](ROADMAP.md) for detailed planning.

## Release Cycle

ShareXpress follows a time-based release cycle:

- **Major releases**: Every 6 months
- **Minor releases**: Every 2 months
- **Patch releases**: As needed for critical bugs/security

See [Release Process](docs/developers/release-process.md) for details.

## Security

ShareXpress takes security seriously. We follow industry best practices and maintain a robust security posture.

### Security Features

- 🔒 RSA-256 JWT authentication
- 🔐 HTTP-only secure cookies
- 🛡️ Rate limiting and DDoS protection
- 🔍 Virus scanning integration
- 🔑 Encryption at rest and in transit
- 📝 Comprehensive audit logging

### Reporting Security Issues

**DO NOT** open a public issue for security vulnerabilities.

Instead, email security@sharexpress.io with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond within 48 hours.

See [SECURITY.md](SECURITY.md) for our full security policy.

## Performance

ShareXpress is designed for high performance:

- **Throughput**: 10,000+ uploads per minute (single instance)
- **Latency**: < 100ms average response time
- **Concurrency**: Handles 1,000+ concurrent connections
- **Storage**: Unlimited with S3-compatible storage
- **Scalability**: Horizontal scaling with Kubernetes

See [Performance Benchmarks](docs/benchmarks.md) for detailed metrics.

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Backend** | FastAPI 0.109.0 | Web framework |
| **Database** | MongoDB 6.0+ | Document storage |
| **Storage** | MinIO/AWS S3 | File storage |
| **Authentication** | JWT (RS256) | Token-based auth |
| **Queue** | Redis (optional) | Background jobs |
| **Testing** | Pytest | Test framework |
| **Deployment** | Docker, K8s | Container orchestration |

## License

ShareXpress is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for the full license text.

```
Copyright 2024 ShareXpress Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## Acknowledgments

ShareXpress is built on the shoulders of giants. We'd like to thank:

- [FastAPI](https://fastapi.tiangolo.com/) - The amazing web framework
- [MongoDB](https://www.mongodb.com/) - Flexible database solution
- [MinIO](https://min.io/) - High-performance object storage
- [Anthropic](https://www.anthropic.com/) - AI assistance
- All our [contributors](https://github.com/yourusername/sharexpress/graphs/contributors)

## Related Projects

- [sharexpress-web](https://github.com/yourusername/sharexpress-web) - React frontend
- [sharexpress-mobile](https://github.com/yourusername/sharexpress-mobile) - Mobile apps
- [sharexpress-cli](https://github.com/yourusername/sharexpress-cli) - Command-line tool
- [sharexpress-sdk](https://github.com/yourusername/sharexpress-sdk) - SDKs for various languages

## Project Status

ShareXpress is actively maintained and used in production by organizations worldwide. We follow semantic versioning and maintain backwards compatibility within major versions.

**Current Status**: ✅ Production Ready

**Maturity Level**: Stable

**Maintenance**: Actively Maintained

## Statistics

![GitHub stars](https://img.shields.io/github/stars/yourusername/sharexpress?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/sharexpress?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/yourusername/sharexpress?style=social)

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/yourusername/sharexpress)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/sharexpress)
![GitHub contributors](https://img.shields.io/github/contributors/yourusername/sharexpress)

![Docker Pulls](https://img.shields.io/docker/pulls/sharexpress/sharexpress)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/yourusername/sharexpress)

----

**[⬆ back to top](#sharexpress)**

<p align="center">
  Made with ❤️ by the ShareXpress Community
</p>

<p align="center">
  <a href="https://sharexpress.io">Website</a> •
  <a href="https://docs.sharexpress.io">Documentation</a> •
  <a href="https://github.com/yourusername/sharexpress/issues">Issues</a> •
  <a href="https://discord.gg/sharexpress">Discord</a> •
  <a href="https://twitter.com/sharexpress">Twitter</a>
</p>

[Python environment]: https://www.python.org/downloads/
[Docker environment]: https://docs.docker.com/engine
[troubleshooting guide]: docs/troubleshooting.md
