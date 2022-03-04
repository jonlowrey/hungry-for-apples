const axios = require('axios');
var fs = require('fs');



// Identify every thumbnail by iterating
const timer = ms => new Promise(res => setTimeout(res, ms))

const assetIds = [];
const failedIds = [];

const getHighResUrl = (appleId) => {
    return `https://naldc.nal.usda.gov/download_image/master_image/POM0000${appleId}`
}

async function downloadApple(appleId) {
    console.log(`Attempting to download Apple #${appleId}`);
    axios({
        url: getHighResUrl(appleId),
        method: 'GET',
        responseType: 'stream',
    }).then(resp => {
        console.log(`${appleId}: status code ${resp.status}`); 

        //uncomment when youre ready to save
        resp.data.pipe(fs.createWriteStream(`./bigApples/${appleId}.jpg`))
    }).catch(error => {
        console.error(`Faild to download ${appleId}`);
    });
}


async function getExistingAssets() {
    for (let index = 1000; index < 1003; index++) {
        console.log(`ids that exist: ${assetIds.toString()}`);
        axios({
            url: `https://naldc.nal.usda.gov/download/POM0000${index}/thumbnail`,
            method: 'GET',
            responseType: 'stream',
        }).then(resp => {
            console.log(`${index}: ${resp.status}`); 
            assetIds.push(index);
            downloadApple(index);

            //uncomment when youre ready to save
            resp.data.pipe(fs.createWriteStream(`./apples/${index}.jpg`))
        }).catch(error => {
            console.log(`Missing ID! ${index}`);
            failedIds.push(index);
        });
        fs.writeFileSync('./appleIds', assetIds.toString())
        fs.writeFileSync('./badAppleIds', failedIds.toString())
        await timer(3000);
        
    }

}
getExistingAssets()