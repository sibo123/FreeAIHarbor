# Free AI Harbor

Free AI Harbor is a private, client-side AI workbench featuring on-device machine learning tools, browser models (via Hugging Face Transformers.js & ONNX WebAssembly), and optional connected cloud providers (BYOK).

---

## 🚀 Hostinger Deployment via Git

This repository is pre-configured and structured for zero-configuration deployment to **Hostinger** web hosting.

### Prerequisites in Hostinger:
- Website Type: **PHP / HTML Website** (or **WordPress / Custom Website**).
- Web Root: `public_html/`

### Step-by-Step Deployment in Hostinger hPanel:
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** -> Select your website -> Click **Manage**.
3. In the left navigation bar, search for or click **Git** (under the **Advanced** section).
4. Fill in the deployment details:
   - **Repository**: Paste your GitHub repository URL (`https://github.com/sibo123/FreeAIHarbor.git`)
   - **Branch**: `main`
   - **Install Directory**: Leave blank or set to `/` / `public_html` (so that `index.html` sits directly inside `public_html`).
5. Click **Create** / **Deploy**.
6. Hostinger will automatically clone the repository into `public_html`.
7. Ensure **Force HTTPS** is enabled in Hostinger (**Websites** -> **Security** / **SSL**).

---

## ⚙️ Architecture & Features

- **Zero-Build Static Architecture**: No `npm install`, build step, or server runtime required on Hostinger. All HTML, CSS, JavaScript ES modules, JSON data, and vendor libraries are pre-packaged and ready to serve.
- **Server Configuration (`.htaccess`)**:
  - Automatically configured for Hostinger Apache/LiteSpeed web servers.
  - Correct MIME types mapped for `.mjs`, `.wasm`, `.json`, and `.svg`.
  - Automatic HTTPS redirection.
  - Gzip/Deflate compression enabled for blazing-fast asset delivery.
  - Client-side cache controls for instant updates upon git deployment.
- **On-Device Inference**:
  - Uses Hugging Face Transformers.js and ONNX runtime in Web Workers (`ai-worker.js`).
  - Single-threaded WASM execution ensures full cross-origin compatibility without restrictive COOP/COEP isolation blockers.
- **Connected Providers (BYOK)**:
  - Supports direct browser-to-API requests for Gemini, Groq, Mistral, OpenRouter, ElevenLabs, etc.
  - Keys remain strictly in visitor session memory and are never sent to external third parties or servers.

---

## 📁 Repository Structure

```
├── .htaccess             # Hostinger Apache/LiteSpeed web server configuration
├── .gitignore            # Git exclusion rules
├── index.html            # Main application interface and workspace
├── catalog.html          # Legacy route redirect
├── app.js                # Core workspace application logic
├── engine.js             # Filter, search, and category engine
├── data.js               # Tool catalog data
├── tools.json            # Tool specifications
├── model-credits.json    # Credit pool specifications
├── ai-worker.js          # Client-side Transformers.js execution worker
├── cloud-engine.js       # Cloud provider client adapters
├── cloud-ui.js           # Cloud provider modal and workspace UI
├── lab.js & lab-tools.js # On-device lab tools and pipeline helpers
├── styles.css & *.css    # Modular CSS styling and workspace layout
├── robots.txt            # Search engine crawling rules
├── sitemap.xml           # Search engine sitemap
└── vendor/               # Bundled runtime libraries (Transformers.js & Tesseract OCR)
```
