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
  - Navigation timing metrics (from `performance.getEntriesByType("navigation")`)
  - Transfer size of all resources
  - Captures JavaScript errors and failed requests

## 📦 Usage

### Clone and run locally with Docker Compose

```bash
docker build -t obsy-puppeteer .
docker run -p 3000:3000 obsy-puppeteer
```
or
```bash
git clone https://github.com/saplumbaga/obsy-puppeter.git
cd obsy-puppeter
docker compose up --build
```

### Example cURL Test

```bash
curl "http://localhost:3000/check?url=https://example.com"
```

### Example Response

```json
{
  "url": "https://example.com",
  "pageUrl": "https://example.com",
  "statusCode": 200,
  "pageTitle": "Example Domain",
  "pageLoadTime": 324,
  "totalPageLoadTime": 738,
  "pageLoadSize": 1249,
  "totalPageLoadSize": 1728,
  "consoleLogs": [
    {
      "type": "log",
      "text": "Some console output",
      "relatedUrl": ""
    }
  ],
  "resources": [
    {
      "name": "https://example.com/script.js",
      "entryType": "resource",
      "startTime": 45.8,
      "transferSize": 835,
      ...
    }
  ]
}
```

## Part of Observer

This service is part of the broader [Observer](https://siteobserver.co) platform — a SaaS application for real-time website monitoring, performance analysis, SEO suggestions, and AI-powered insights. This container is used by **Obsy**, Observer's AI assistant, to diagnose real browser loading behavior and performance.

## License

MIT