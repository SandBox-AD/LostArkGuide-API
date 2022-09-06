var express = require('express');
var router = express.Router();
require('dotenv').config();
const translate = require('translate');
const translateFR = require('translate');
const puppeteer = require('puppeteer');
// const cache = require('./../caches');
var cacheService = require('express-api-cache');
var cache = cacheService.cache;

async function scrap() {
    const brower = await puppeteer.launch({
        headless: true
    });
    const page = await brower.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto("https://lost-ark.maxroll.gg/build-guides/demonic-impulse-shadowhunter-raid-guide");
    const tables = await page.evaluate(async () => {
        let data = {
            "skills": {
                "name": [],
                "level": [],
                "picture":[],
            },
            "gameplayEn": [],
            "stats": [],
            "Engravings": {
                "Starter": [],
                "Endgame": [],
                "Advanced": [],
            },
            "Gear Sets": {
                "Tier1": [],
                "Tier2": [],
                "Tier3": [],
            },
            "Runes": {
                "Skills": {
                    "Name": [],
                    "Picture":[]
                },
                "Runes": {
                    "Name": [],
                    "Picture":[]
                },

            },
            "Gems": {
                "Attacks": [],
                "Cooldown": [],
                "Picture":[],
            },
            "Card_Sets": {
                "Budget_Card": {
                    "Card": [],
                    "Effect": [],
                    "Picture": [],
                },
                "Optimal_Damage_Card": {
                    "Card": [],
                    "Effect": [],
                },
            },
            "Error": [],
            "PictuireSkills":[]
        };

        try {
            document.querySelector("#advgb-col-a2526fce-a0c3-4cc8-a21c-f16383fe89c2 > div > figure > div > div > div > div > div > div.lap-body > div.lap-skills").textContent.split(/(\d+)/).forEach(element => {
                if (element.length > 0) {
                    if (!element.match(/(\d+)/)) {
                        data['skills']['name'].push(element)
                    } else {
                        data['skills']['level'].push(element)
                    }
                }
            });
            document.querySelector("#ftwp-postcontent > ul:nth-child(24)").innerText.split("\n").forEach(element => {
                data['gameplayEn'].push(element);
            });
            document.querySelector("#ftwp-postcontent > p:nth-child(30)").innerText.split("\n").forEach(element => {
                data["stats"].push(element);
            });
            document.querySelector("#ftwp-postcontent > ul:nth-child(31)").innerText.split("\n").forEach(element => {
                data["stats"].push(element);
            });
            document.querySelector("#ftwp-postcontent > p:nth-child(32)").innerText.replace(" \n", "\n").split("\n").forEach(element => {
                data["stats"].push(element);
            });
            document.querySelector("#ftwp-postcontent > ul:nth-child(40)").innerText.split("\n").forEach(element => {
                data["Engravings"]["Starter"].push(element);
            });
            document.querySelector("#ftwp-postcontent > ul:nth-child(42)").innerText.split("\n").forEach(element => {
                data["Engravings"]["Endgame"].push(element);
            });
            document.querySelector("#ftwp-postcontent > ul:nth-child(45)").innerText.split("\n").forEach(element => {
                data["Engravings"]["Advanced"].push(element);
            });
            document.querySelector("#advgb-cols-9901f6c9-e6a1-493b-8b7a-5d237a4043a8 > div > div").textContent.replace(/^\s+|\s+$/gm, ',').split(",").forEach(element => {
                if (element.length > 0) {
                    data["Gear Sets"]["Tier1"].push(element); 
                }
            });
            document.querySelector("#advgb-cols-403265ae-2b09-4bd9-a713-343f18d43b1c > div > div").textContent.replace(/^\s+|\s+$/gm, ',').split(",").forEach(element => {
                if (element.length > 0) {
                    data["Gear Sets"]["Tier2"].push(element);
                }
            });
            document.querySelector("#advgb-cols-746ee974-5fdd-444e-af4c-db20e6e31753 > div > div").textContent.replace(/^\s+|\s+$/gm, ',').split(",").forEach(element => {
                if (element.length > 0) {
                    data["Gear Sets"]["Tier3"].push(element);
                }
            });
            document.querySelector("#advgb-col-eeb17e9e-2d0d-45d3-9961-f0b7a571195c > div > table > tbody").innerText.replace(/^\s+|\s+$/gm, '/').replace('\t', '\n').split("\n").forEach((element, index) => {
                if (index >= 2) {
                    if (index % 2 == 0) {
                        data["Runes"]["Skills"]['Name'].push(element.replace('/', ''));
    
                    } else {
                        data["Runes"]["Runes"]['Name'].push(element.replaceAll('//',' / '));
                    }
                }
            });
            data['Gems']['Attacks'].push(document.querySelector("#advgb-col-c0cbd474-146a-43e0-a2b7-34fe910ec593 > div > p > span > span > span.lap-skill-name").innerText);
            data['Gems']['Cooldown'].push(document.querySelector("#advgb-col-15c1bdd2-c5fd-4727-b4c9-0fc16de1c9bf > div > p > span > span > span.lap-skill-name").innerText);
            
            document.querySelector("#ftwp-postcontent > figure:nth-child(78) > div > div > div > div").innerText.split("\n").forEach((element, index) => {
                if (index <=5) {
                    data["Card_Sets"]["Budget_Card"]["Card"].push(element);
                }
                else {
                    data["Card_Sets"]["Budget_Card"]["Effect"].push(element);
                }
            });
            document.querySelector("#ftwp-postcontent > figure:nth-child(80) > div > div > div > div").innerText.split("\n").forEach((element, index) => {
                if (index <=5) {
                    data["Card_Sets"]["Optimal_Damage_Card"]["Card"].push(element);
                }
                else {
                    data["Card_Sets"]["Optimal_Damage_Card"]["Effect"].push(element);
                }
            });
            for (let index = 1; index <= document.querySelector("#advgb-col-a2526fce-a0c3-4cc8-a21c-f16383fe89c2 > div > figure > div > div > div > div > div > div.lap-body > div.lap-skills").childNodes.length; index++) {
                let url = document.querySelector("#advgb-col-a2526fce-a0c3-4cc8-a21c-f16383fe89c2 > div > figure > div > div > div > div > div > div.lap-body > div.lap-skills > div:nth-child(" + index + ") > div.lap-skill-icon").outerHTML;
                data['skills']['picture'].push(url.substring(url.indexOf('https'), url.indexOf('.png')+4))            
            };

            for (let index = 1; index <= document.querySelector("#advgb-col-eeb17e9e-2d0d-45d3-9961-f0b7a571195c > div > table > tbody").children.length; index++) {
                let url = document.querySelector("#advgb-col-eeb17e9e-2d0d-45d3-9961-f0b7a571195c > div > table > tbody > tr:nth-child(" + index + ")").outerHTML;
                let urlRunes = document.querySelector("#advgb-col-eeb17e9e-2d0d-45d3-9961-f0b7a571195c > div > table > tbody > tr:nth-child(" + index + ") > td:nth-child(2)").outerHTML;
                if (url.includes('https')) {
                    data['Runes']['Skills']['Picture'].push(url.substring(url.indexOf('https'), url.indexOf('.png')+4))
                    data['Runes']['Runes']['Picture'].push(urlRunes.substring(urlRunes.indexOf('https'), urlRunes.indexOf('.png')+4))
                }
                
            }
            let url = document.querySelector("#advgb-col-c0cbd474-146a-43e0-a2b7-34fe910ec593 > div > p > span > span > span.lap-skill-icon").outerHTML;
            data['Gems']['Picture'].push(url.substring(url.indexOf('https'), url.indexOf('.png') + 4))
            document.querySelector("#ftwp-postcontent > figure:nth-child(78) > div > div > div > div > div.lap-CardList").outerHTML.split('img').forEach((element) => {
                if (element.includes('https')) {
                    data['Card_Sets']['Budget_Card']['Picture'].push(element.substring(element.indexOf('https'), element.indexOf('.png') + 4))
                }
            });

        } catch (error) {
            console.log(error);
            data.Error.push(error.message)
        }

        return data;
    });
    await brower.close();
    return tables;
}
/* GET home page. */
router.get('/', cache("10 minutes"), (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    scrap().then((result) => {
        res.json(
            result
        )
    });
});

module.exports = router;