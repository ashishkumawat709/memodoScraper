

const colors = require("colors");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const file = require("./allProducts.json");
const axios = require("axios");
const fs = require("fs");
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  async function getData() {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], DISPLAY: ":10.0"});
    // const browser = await puppeteer.launch({ headless: false,                                         // use to launch in chrome
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://www.memodo.de/account/login", {
      waitUntil: "load",
      timeout: 0,
    });
    const data = await page.content();
    await browser.close();
    processData(data);
  }
  getData();

  async function processData(data) {
    console.log("Processing Data...");
    const $ = cheerio.load(data);
    const posts = [];
    posts.push({
      token: $('input[name="__csrf_token"]').val(),
    });
    console.log(posts[0].token);

    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], DISPLAY: ":10.0"});

    // const browser = await puppeteer.launch({ headless: false,                                         // use to launch in chrome
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.goto("https://www.memodo.de/account/login", {
      waitUntil: "load",
      timeout: 0,
    });

    await page.type(
      '#login--form > div.register--login-email > input[name="email"]',
      "contact@epp.solar",
      { delay: 100 }
    );
    await page.type(
      '#login--form > div.register--login-password > input[name="password"]',
      "EPP2022!",
      { delay: 100 }
    );

    await page.click("#login--form > div.register--login-action > button", {
      delay: 100,
    });
    const solarData = [];

    //  async function sliceIntoChunks(file, chunkSize) {
    //     const final = [];
    //     for (let i = 0; i < 50; i += chunkSize) {
    //       const chunk = file.slice(i, i + chunkSize);
    //       final.push(chunk);
    //     }

    // for (const item of final[0]) {

    for (const item of file) {
      if (item.product_url === null) {
        solarData.push(item);
      } else {
        await page.goto(item.product_url.url);
        const data = await page.content();
        const $ = cheerio.load(data);
        solarData.push({
          id: item.id,
          title: $("div.product--info > h1.product--title").text().trim(),
          price: $("div.product--price > span.price--content").text().trim(),
          availability: {
            date: $(
              "body > div.page-wrap > section > div.content-main--inner > div.content--wrapper > div > div.product--detail-upper.block-group > div.product--buybox.block > div.productRightContainer > div.product--delivery > p > span > span"
            )
              .text()
              .trim(),
            Stock: $(
              "div.productRightContainer > div.product--delivery > p.delivery--information > span.delivery--text.delivery--text-not-available > a"
            )
              .text()
              .trim(),
          },
          articleNumber: $(
            "div.product--buybox.block > div.productLeftContainer > ul.product--base-info > li.base-info--entry.entry--sku >  span.entry--content"
          )
            .text()
            .trim(),
          link: item.product_url.url,
        });
        fs.writeFileSync("scrapped.json", JSON.stringify(solarData, null, 2));
      }
    }
    console.log("memodo scrapped".green);
    // fs.writeFileSync("final.json", JSON.stringify(final, null, 2));
    console.log(solarData.length);
  }

  res.send('starting scraping app in a bit')
});

app.get("/data", async (req, res) => {
  const data = fs.readFileSync("scrapped.json", "utf-8");
  res.send(data);
});

app.listen(8001, () => {
  console.log(`listening port ${8001}`);
});
// sliceIntoChunks(file, 50);
