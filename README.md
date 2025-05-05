# Obsy Puppeteer Tool

This is a minimal **browser automation microservice** built using [Puppeteer](https://pptr.dev/) and Node.js, designed as part of the [Observer](https://siteobserver.co) project.

It runs a headless Chromium instance inside a Docker container, loads a web page, collects timing metrics, page title, and HTML size, and returns the result as JSON via a simple HTTP API.

## 🔍 Features

- Launches Chromium in headless mode
- Accepts a `url` via query string
- Returns:
  - HTTP status code
  - Page title
  - Total page size
  - Navigation timing metrics (from `window.performance.timing`)

## 📦 Usage

### Local (Docker)

```bash
docker build -t obsy-puppeteer .
docker run -p 3000:3000 obsy-puppeteer
```

### Example Request

```bash
curl "http://localhost:3000/check?url=https://example.com"
```

### Example Response

```json
{
  "url": "https://example.com",
  "statusCode": 200,
  "title": "Example Domain",
  "contentLength": 1256,
  "timing": {
    "navigationStart": 123,
    "responseStart": 456,
    "domComplete": 789
  },
  "pageLoadTime": 333,
  "totalPageLoadTime": 666
}
```

## 🧱 Part of Observer

This service is part of the broader [Observer](https://siteobserver.co) platform — a SaaS application for real-time website monitoring, performance analysis, SEO suggestions, and AI-powered insights. This container is used by **Obsy**, Observer's AI assistant, to diagnose real browser loading behavior and performance.

## 📄 License

MIT
