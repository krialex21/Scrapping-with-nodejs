const fs = require('fs');
const puppeteer = require('puppeteer');
const https = require('https');

const dir = './images';



/* ============================================================
  Promise-Based Download Function
============================================================ */

const download = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https.get(url, response => {
        response.pipe(file);

        file.on('finish', () => {
            file.close(resolve(true));
        });
    }).on('error', error => {
        fs.unlink(destination);

        reject(error.message);
    });
});


(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1800,
        deviceScaleFactor: 1,
    });
    await page.emulate(puppeteer.devices['iPhone 6']);
    await page.goto('https://comicpunch.net/readme/index.php?title=guardians-of-the-galaxy-2020&chapter=1');

    await page.click("button.button4");
    console.log("'Full Chapter' button has been clicked!");

    const issueSrcs = await page.evaluate(() => {
        const srcs = Array.from(document.querySelectorAll("a > p > img.comicpic")).map(image => image.getAttribute("src"));

        return srcs;

    })

    for (let i = 0; i < issueSrcs.length; i++) {

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0766, function (err) {
                if (err) {
                    console.log(err);
                    // echo the result back
                    response.send("ERROR! Can't make the directory! \n");
                }
            });
        }

        result = await download(issueSrcs[i], `images/image-${i}.png`);

        if (result === true) {
            console.log('Success:', issueSrcs[i], 'has been downloaded successfully.');
        } else {
            console.log('Error:', issueSrcs[i], 'was not downloaded.');
            console.error(result);
        }
    }
    //console.log(JSON.stringify(issueSrcs));
    //await download(issueSrcs, 'image.png');
    //fs.writeFileSync("./data.json", JSON.stringify(issueSrcs));

    await browser.close();
})();