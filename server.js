const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

const XB_URL = "https://xbdeals.net/us-store/discounts?sort=best-new-deals&contentType%5B%5D=games&contentType%5B%5D=bundles&minDiscount=100&discountType=regular&dealsDate=lastMonth";

app.get("/free-xbox-games", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(XB_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const results = [];

    $(".game-collection-item").each((i, el) => {
      const title = $(el).find(".game-collection-item__name").text().trim();
      const originalPrice = $(el).find(".game-collection-item__price--discount-regular").text().trim();
      const url = "https://xbdeals.net" + $(el).find("a").attr("href");

      results.push({ title, originalPrice, url });
    });

    res.json(results);
  } catch (err) {
    console.error("Scraping failed:", err);
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
