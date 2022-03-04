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
    const { data } = await axios.get(getHighResUrl(appleId),{
        responseType: 'arraybuffer'
      }).catch(error => {
        console.error(`Faild to download ${appleId}`);
        failedIds.push(appleId)
      });
     fs.writeFileSync(`./bigApples/${appleId}.jpg`, data);
    return () => {};
}

let noErr = true;


async function getExistingAssets() {
    for (let index = 1000; index <= 9000; index++) {
        console.log(`ids that exist: ${assetIds.toString()}`);
        if(!noErr){
            break;
            return;
        }
        await axios({
            url: `https://naldc.nal.usda.gov/download/POM0000${index}/thumbnail`,
            method: 'GET',
            responseType: 'stream',
        }).then(async (resp) => {
            console.log(`${index}: ${resp.status}`); 
            assetIds.push(index);
            await downloadApple(index);

            fs.writeFileSync(`./apples/${index}.jpg`, resp.data);
        }).catch(error => {
            noErr=false;
            console.log(`Missing ID! ${index}`);
            failedIds.push(index);
            console.error(error.toString())
        });
        if(index % 15 === 0){
            fs.writeFileSync('./appleIds', assetIds.toString())
            fs.writeFileSync('./badAppleIds', failedIds.toString())
        }
        await timer(1000);
        
    }

}
getExistingAssets()