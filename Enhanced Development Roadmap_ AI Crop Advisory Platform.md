# Enhanced Development Roadmap: AI Crop Advisory Platform

## 1. Introduction
This roadmap serves as the definitive guide for transforming the AI Crop Advisory Platform into an enterprise-grade, secure, and autonomous system. It incorporates the requirements from the `SYSTEM_ENHANCEMENT_AND_SECURITY_PLAN.md` and addresses the critical vulnerabilities identified during the technical audit.

## 2. Strategic Objectives
*   **Centralized AI Orchestration:** Move all AI logic to a backend agent layer using NVIDIA NIM.
*   **Zero-Trust Security Baseline:** Eliminate hardcoded secrets and enforce strict validation.
*   **Autonomous Intelligence:** Transition from heuristics to model-driven reasoning and vision.
*   **Enterprise Resilience:** Implement granular rate limiting, caching, and robust error handling.

## 3. Detailed Phase Breakdown

### Phase 1: Security Hardening & Secret Management
**Goal:** Establish a secure foundation by removing all exposed credentials and hardening the authentication layer.

| Step | Task | Target Files |
| :--- | :--- | :--- |
| 1.1 | **Secret Purge** | Remove hardcoded keys from `.env`, `env-backup.md`, and source code. |
| 1.2 | **Vault Integration** | Implement a secure runtime secret loader (e.g., AWS Secrets Manager or HashiCorp Vault). |
| 1.3 | **Auth Fix** | Refactor `src/server/middleware/auth.js` to return 401/403 instead of throwing errors. |
| 1.4 | **JWT Hardening** | Implement refresh token rotation and a token revocation list (Redis-backed). |
| 1.5 | **Security Headers** | Configure `Helmet.js` with strict CSP and HSTS in `src/server/index.js`. |

### Phase 2: Backend Proxy & Validation Layer
**Goal:** Eliminate frontend-to-external-API calls and enforce strict input/output schemas.

| Step | Task | Description |
| :--- | :--- | :--- |
| 2.1 | **API Proxying** | Move Trefle, OpenWeather, and Plant.id calls from frontend services to backend routes. |
| 2.2 | **Zod Validation** | Define and apply Zod schemas for all request bodies, queries, and path parameters. |
| 2.3 | **Rate Limiting** | Implement `express-rate-limit` with Redis for per-user and per-endpoint quotas. |
| 2.4 | **CORS Lockdown** | Restrict `CORS` in `index.js` to specific production and development origins. |

### Phase 3: NVIDIA AI Agent Integration
**Goal:** Deploy the autonomous AI layer for vision, reasoning, and climate forecasting.

| Step | Task | Implementation Logic |
| :--- | :--- | :--- |
| 3.1 | **Vision NIM** | Integrate `Llama-3.2-Vision` or `Cosmos` for plant disease and pest identification. |
| 3.2 | **Reasoning NIM** | Deploy `Nemotron-3-Super` or `GLM-5.1` for complex advisory generation. |
| 3.3 | **Climate NIM** | Integrate `FourCastNet` for localized, high-resolution weather predictions. |
| 3.4 | **Agent Layer** | Create a unified `AgentService` to orchestrate model calls and data connectors. |

### Phase 4: Data Connectors & Caching
**Goal:** Optimize performance and ensure data accuracy through robust connectors and Redis.

*   **Connector Development:** Standardize connectors for AgroMonitoring, SoilGrids, and Market Data.
*   **Redis Caching:** Implement a 15-minute TTL for weather data and a 24-hour TTL for common AI advisories.
*   **Error Fallbacks:** Implement circuit breakers for external services to ensure platform availability.

### Phase 5: Testing & Deployment
**Goal:** Validate security and performance before production rollout.

*   **Security Audit:** Run automated vulnerability scans (e.g., Snyk, OWASP ZAP).
*   **Integration Tests:** Validate the full "Image -> Vision NIM -> Reasoning NIM -> Advisory" pipeline.
*   **CI/CD Pipeline:** Add checks for "No Secrets" and "Required Validation" in the deployment flow.

## 4. Immediate Action Items (Week 1)
1.  **Fix `auth.js` middleware** to prevent potential server crashes and improve error reporting.
2.  **Initialize a Secret Manager** and migrate the `NVIDIA_API_KEY` and `JWT_SECRET`.
3.  **Refactor the Pest Detection route** to use a backend proxy instead of hardcoded placeholder data.

## 5. Conclusion
This roadmap provides a clear, actionable path to a professional-grade deployment. By following these steps, the AI Crop Advisory Platform will not only be secure but will also leverage the full power of the NVIDIA AI catalog to provide unmatched value to its users.
