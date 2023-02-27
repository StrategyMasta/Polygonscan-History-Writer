import express from 'express'
import fetch from 'node-fetch'
import InputDataDecoder from 'ethereum-input-data-decoder'
import dotenv from 'dotenv'

const decoder = new InputDataDecoder(`./abi.json`);
const app = express();
dotenv.config();

// The Server
const server = app.listen(3000, async () => {
    const results = [];

    // This Fetch Req Returns Up To 10000 Records, So I'm Making Sure,
    // That All Elements Get Returned By Looping The Fetch Req
    // Until It Returns Less Than 10000 Records
    for(let i = 1; results.length % 10000 == 0; i++) {
        const req = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&startblock=0&endblock=99999999&page=${i}&offset=${10000}&sort=asc&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
        const { result } = await req.json();
        results.push(...result);
    }
    // Removing The Oldest Transaction, Because It Contains The Contract Data
    // And It Makes My Code Go Brrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
    results.shift();


    // The User Chooses How He'd Like To Format The Data
    if(process.env.OPTION.trim() == "observe") display(results);
    else if(process.env.OPTION.trim() == "csv") displayCSV(results);

    // The CSV Option Also Closes The Server
    if(process.env.OPTION.trim() == "csv") server.close();
});

app.use(express.json());
app.use(express.static('public'));

// Fetch Handler For The Website
app.get('/transactionData/:data', async (request, response) => {
    const params = request.params.data.split(',');
    const [page, sort, offset] = params;

    // Fetching The Data Requested By The User
    const req = await fetch(`https://api.polygonscan.com/api?module=account&action=txlist&address=0x952bb3f00dacb912741ac3c89197e0c7696f9754&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=${sort}&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
    const data = await req.json();
  
    response.json(data);
});

// Getting The Source Code Of The Public Contract, But Its Encrypted
// app.get('/test2/:data', async (request, response) => {
//     const params = request.params.data.split(',');
//     const [page, sort, offset] = params;

//     const req = await fetch(`https://api.polygonscan.com/api?module=proxy&action=eth_getCode&address=0x1a1ec25dc08e98e5e93f1104b5e5cdd298707d31&tag=latest&apikey=H5VATIAXPU2KACWHQ2XZRKC7ESN2C8JXB2`);
//     const data = await req.json();
  
//     response.json(data);
// });


// Input Data Decoder
app.get('/decode/:data', async (request, response) => {
    const { data } = request.params;

    // Decode The Data
    const result = decoder.decodeData(data);
    response.json(result);
});

// Functions

// Display Formatted Data In The Console
function display(data) {
    for(let row of data) {
        const decodedData = decoder.decodeData(row.input);
        const date = new Date(row.timeStamp * 1000);

        //date.setUTCSeconds(row.timeStamp);

        let result = "Data: " + date.toISOString().replace("T", " ").split(".")[0];
        result += " | Od: " + row.from;
        result += " | Do: 0x" + decodedData.inputs[0];
        result += " | Ilość: " + decodedData.inputs[1]._hex / 10e17;

        console.log("-------------------------------------------------------------------------------------------------------------------------------------------------------");
        console.log(result)
    }
}

// Display The Data In The Console In A CSV Format
function displayCSV(data) {
    console.log("data,od,do,ilosc");

    for(let row of data) {
        const decodedData = decoder.decodeData(row.input);
        const date = new Date(row.timeStamp * 1000);

        const result = [];
        result.push(date.toISOString().replace("T", " ").split(".")[0]);
        result.push(row.from);
        result.push(decodedData.inputs[0]);
        result.push(decodedData.inputs[1]._hex / 10e17);

        console.log(result.join(","));
    }
}