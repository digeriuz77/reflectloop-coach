# Deploying ReflectLoop Coach to Railway

This document provides step-by-step instructions for deploying both the **FastAPI Backend** and **Vite TypeScript Frontend** of ReflectLoop Coach onto [Railway](https://railway.app). 

Because the project is structured as a monorepo with separate `backend/` and `frontend/` directories (each having its own `railway.toml`), they will be deployed as **two separate services** within the same Railway project.

---

## Prerequisites

1. A [Railway](https://railway.app) account.
2. A GitHub repository containing your codebase.
3. A Fireworks AI API Key (for LLM services).

---

## Phase 1: Deploy the FastAPI Backend

We deploy the backend first so we can obtain its live URL, which the frontend needs during its compilation phase.

### Step 1: Connect your Repository
1. Log in to Railway and click **New Project** → **Deploy from GitHub repo**.
2. Select your `reflectloop-coach` repository.
3. When prompted, select **Deploy Later** so we can configure the subdirectories and variables first.

### Step 2: Configure the Backend Service Settings
1. Click on the newly created service card in your project canvas.
2. Go to the **Settings** tab.
3. Under **General**, rename the service to `reflectloop-coach-api` (or similar).
4. Under **Build**, find **Root Directory** and set it to `/backend`.
5. Railway will automatically detect the `/backend/railway.toml` and configure the start command:
   ```toml
   [deploy]
   startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
   healthcheckPath = "/health"
   ```

### Step 3: Configure Environment Variables
Go to the **Variables** tab of the backend service and add the following variables:

| Variable Name | Example Value | Description |
|---|---|---|
| `ENVIRONMENT` | `production` | Switches configurations to production-ready logs and error handlers. |
| `LOG_LEVEL` | `INFO` | Set logging level (`INFO`, `WARNING`, `ERROR`). |
| `FIREWORKS_API_KEY` | `your-fireworks-api-key-here` | **[Required]** Your Fireworks AI API credential. |
| `COACH_ACCESS_TOKEN` | `your-private-password` | **[Optional]** A secure token coaches must enter in the UI to authenticate. |
| `CORS_ORIGINS` | `https://reflectloop-coach.up.railway.app` | **[Required]** The public domain URL of your frontend service. (You can update this once the frontend is deployed). |

### Step 4: Expose Backend Service to the Public
1. Go back to the **Settings** tab of the backend service.
2. Under **Networking**, click **Generate Domain** (or set up a custom domain).
3. Copy this generated URL (e.g., `https://reflectloop-coach-api.up.railway.app`). This is your **Backend URL**.

---

## Phase 2: Deploy the Vite React Frontend

### Step 1: Create a New Service
1. In the same Railway project canvas, click **+ New** (top right) → **GitHub Repo**.
2. Select the same `reflectloop-coach` repository.
3. Click **Deploy Later**.

### Step 2: Configure the Frontend Service Settings
1. Click on the new service card.
2. Go to the **Settings** tab.
3. Rename the service to `reflectloop-coach-web` (or similar).
4. Under **Build**, find **Root Directory** and set it to `/frontend`.
5. Railway will automatically detect `/frontend/railway.toml` and configure the static server:
   ```toml
   [deploy]
   startCommand = "npm run start"
   healthcheckPath = "/"
   ```

### Step 3: Configure Environment Variables
Go to the **Variables** tab of the frontend service and add:

| Variable Name | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://reflectloop-coach-api.up.railway.app` | **[Required]** The exact URL you generated for your backend service in Phase 1 (no trailing slash). |

> [!IMPORTANT]
> **Vite Build-Time Variable Rule:**
> Vite embeds variables prefixed with `VITE_` into the static JavaScript bundle *during the build phase*. If you change this environment variable later, you **MUST** trigger a manual redeployment of the frontend service by clicking **Redeploy** on the Railway dashboard for the changes to take effect.

### Step 4: Expose Frontend Service to the Public
1. Go to the **Settings** tab of the frontend service.
2. Under **Networking**, click **Generate Domain** (or set up your custom domain).
3. Copy this URL (e.g., `https://reflectloop-coach-web.up.railway.app`). This is your **Frontend URL**.

---

## Phase 3: Connect and Verify

1. **Update Backend CORS Configuration**:
   Go back to the backend service's **Variables** tab, edit `CORS_ORIGINS`, and ensure it matches the final **Frontend URL** precisely.
2. **Re-deploy Backend**:
   Click **Redeploy** on the backend service to load the updated `CORS_ORIGINS`.
3. **Launch & Test**:
   - Open your Frontend URL in the browser.
   - Enter your `COACH_ACCESS_TOKEN` in the top access panel.
   - Paste a teacher reflection or lesson notes.
   - Click **Generate coach prep**.
   - Verify that the beautiful GROW guide, reframe suggestions, double-loop questions, and strategies appear!

---

## Troubleshooting

- **CORS Errors in the Browser Console**:
  Make sure `CORS_ORIGINS` in the backend service variables matches the frontend URL exactly (no trailing slash, e.g., `https://my-app.up.railway.app`).
- **Nixpacks Build Failures**:
  Railway uses Nixpacks. If the build fails, confirm that `package-lock.json` is committed in `frontend/` and that no TypeScript (`tsc`) compile-time errors exist in local builds (`npm run build`).
