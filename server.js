import express from 'express'
import fetch from 'node-fetch'
import InputDataDecoder from 'ethereum-input-data-decoder'
import dotenv from 'dotenv'

const app = express();
dotenv.config();

const server = app.listen(3000, async () => {
    // console.log(`Starting server at Port: 3000`);

    const req = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&startblock=0&endblock=99999999&page=${1}&offset=${10000}&sort=asc&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    const { result } = await req.json();
    result.shift();
    if(process.env.OPTION.trim() == "observe") display(result);
    else if(process.env.OPTION.trim() == "csv") displayCSV(result);

    server.close();
});

app.use(express.json());
app.use(express.static('public'));

app.get('/test/:data', async (request, response) => {
    const params = request.params.data.split(',');
    // console.log(params);
    const page = params[0];
    const sort = params[1];
    const offset = params[2];
    // console.log(`Page: ${page}, Sort: ${sort}, Offset: ${offset}`);

    const req = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=${sort}&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    const data = await req.json();

    // const reqABI = await fetch(`https://api.polygonscan.com/api?module=contract&action=getabi&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    // const data2 = await reqABI.json();

    // abi = data2.result;
  
    response.json(data);
});

app.get('/test2/:data', async (request, response) => {
    const params = request.params.data.split(',');
    // console.log(params);
    const page = params[0];
    const sort = params[1];
    const offset = params[2];
    // console.log(`Page: ${page}, Sort: ${sort}, Offset: ${offset}`);

    //const req = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=${sort}&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    const req = await fetch(`https://api.polygonscan.com/api?module=proxy&action=eth_getCode&address=0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31&tag=latest&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    const data = await req.json();

    // const reqABI = await fetch(`https://api.polygonscan.com/api?module=contract&action=getabi&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    // const data2 = await reqABI.json();

    // abi = data2.result;
  
    response.json(data);
});

app.get('/decode/:data', async (request, response) => {
    const { data } = request.params;
    const decoder = new InputDataDecoder(`./abi.json`);
    // const decoder = new InputDataDecoder(abi);
    const result = decoder.decodeData(data);
    response.json(result);
});

// Functions

function display(result) {
    for(let row of result) {
        // const response = await fetch(`decode/${row.input}`);
        // const decodedData = await response.json();
        const decodedData = decodeInput(row.input);
        const data = new Date(0);
        data.setUTCSeconds(row.timeStamp);

        // console.log("dane: ");
        // console.log(decodedData.inputs[1]._hex / 10e17);

        let result = "Data: " + data.toISOString().replace("T", " ").split(".")[0];
        result += " | Od: " + row.from;
        result += " | Do: 0x" + decodedData.inputs[0];
        result += " | Ilość: " + decodedData.inputs[1]._hex / 10e17;

        console.log("-------------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log(result)
    }
}

function decodeInput(input) {
    const decoder = new InputDataDecoder(`./abi.json`);
    const result = decoder.decodeData(input);
    return result;
}

function displayCSV(result) {
    console.log("data,od,do,ilosc");

    for(let row of result) {
        // const response = await fetch(`decode/${row.input}`);
        // const decodedData = await response.json();
        const decodedData = decodeInput(row.input);
        const data = new Date(row.timeStamp * 1000);
        // data.setUTCSeconds(row.timeStamp);

        // console.log("dane: ");
        // console.log(decodedData.inputs[1]._hex / 10e17);

        const result = [];
        result.push(data.toISOString().replace("T", " ").split(".")[0]);
        result.push(row.from);
        result.push(decodedData.inputs[0]);
        result.push(decodedData.inputs[1]._hex / 10e17);

        console.log(result.join(","));
    }
}