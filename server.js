const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.get('/check', async (req, res) => {
    let url = req.query.url;
    if (!/^https?:\/\//i.test(url)) {
        url = `http://${url}`;
    }

    if (!url) {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    let browser;
    const consoleLogs = [];

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1366, height: 768 },
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();

        // Attach browser listeners
        page.on('console', msg => {
            consoleLogs.push({
                type: msg.type(),
                text: msg.text(),
                relatedUrl: "" // Puppeteer doesn't expose location like chrome-aws-lambda
            });
        });

        page.on('pageerror', msg => {
            consoleLogs.push({
                type: "error",
                text: msg.toString(),
                relatedUrl: url
            });
        });

        page.on('requestfailed', req => {
            consoleLogs.push({
                type: "error",
                text: req.failure()?.errorText || "unknown failure",
                relatedUrl: req.url()
            });
        });

        await page.setUserAgent('Obsy-Observer (+https://siteobserver.co/obsy)');
        await page.setExtraHTTPHeaders({ Referer: "https://siteobserver.co/obsy" });
        await page.setCacheEnabled(false);

        const response = await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Optional wait for extra network stability
        try {
            await page.waitForNavigation({ timeout: 4000 });
        } catch (e) {
            // It's okay to fail silently here
        }

        const bodyHTML = await page.content();

        const timing = await page.evaluate(() => {
            const nav = performance.getEntriesByType("navigation")[0];
            return {
                navigationStart: nav.startTime,
                responseStart: nav.responseStart,
                domComplete: nav.domComplete
            };
        });

        const title = await page.title();

        const resourceEntries = await page.evaluate(() =>
            JSON.parse(JSON.stringify(performance.getEntriesByType("resource")))
        );

        const totalTransferSize = resourceEntries.reduce((sum, entry) => {
            return sum + (entry.transferSize || 0);
        }, 0);

        // Filter logs
        const filteredLogs = consoleLogs
            .filter(log =>
                !log.relatedUrl?.includes("fundingchoicesmessages.google.com") &&
                !log.relatedUrl?.includes("googletagmanager.com")
            )
            .slice(0, 50);

        const result = {
            url,
            pageUrl: page.url(),
            statusCode: response?.status() || 0,
            pageTitle: title,
            pageLoadTime: timing.responseStart - timing.navigationStart,
            totalPageLoadTime: timing.domComplete - timing.navigationStart,
            pageLoadSize: bodyHTML.length,
            totalPageLoadSize: totalTransferSize,
            consoleLogs: filteredLogs,
            resources: resourceEntries,
            // htmlBody: bodyHTML,
        };

        await browser.close();
        res.json(result);

    } catch (err) {
        if (browser) await browser.close();
        res.status(500).json({
            error: err.message,
            statusCode: 0,
            pageTitle: 0,
            pageLoadTime: 0,
            totalPageLoadTime: 0,
            pageLoadSize: 0,
            totalPageLoadSize: 0,
            payload: ""
        });
    }
});

const port = process.env.PORT || 8101;
app.listen(port, () => {
    console.log(`Obsy Puppeteer tool running on http://localhost:${port}`);
});
