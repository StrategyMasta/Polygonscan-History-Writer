// This Class Checks Every Minute, If There's New Data
// And Updates The Table If Needed
class Refresher {
    #timer;

    contructor() {}

    newTimer(page, sort, offset, hash) {
        this.#timer = setInterval(async () => {

            const index = offset * (page - 1);
            const offset2 = 1;
            const page2 = index + 1;

            const response = await fetch(`transactionData/${page2},${sort},${offset2}`);
            const { result } = await response.json();

            if(result[0].hash != hash) {
                this.clearTimer();
                
                const response2 = await fetch(`transactionData/${page},${sort},${offset}`);
                const { result: result2 } = await response2.json();

                fillTable(result2);
                this.newTimer(page, sort, offset, result[0].hash);
            }

        }, 60000);
    }

    clearTimer() {
        clearInterval(this.#timer);
    }
}

const refresher = new Refresher();
const content = {
    timeStamp: "date",
    from: "from",
    to: "to",
    value: "value"
};

Object.freeze(content);

// Submit Button Handler
test.onclick = async function() {
    const page = document.getElementById("pageID").value*1;
    const sort = document.getElementById("sortID").selectedOptions[0].value;
    const offset = document.getElementById("offsetID").value*1;

    const response = await fetch(`transactionData/${page},${sort},${offset}`);
    const { result } = await response.json();

    refresher.clearTimer();
    refresher.newTimer(page, sort, offset, result[0].hash);
    fillTable(result);

    // const response2 = await fetch(`test2/${page},${sort},${offset}`);
    // const result2 = await response2.json();
    // console.log(result2);
}

// This Makes A Request To The Server To Decode The Input Data
async function decodeUint256(value) {
    const response = await fetch(`decode/${value}`);
    const result = await response.json();
    return result;
}

// Fill The Table With Data
async function fillTable(result) {
    const table = document.querySelector("table");
    table.border = "1px";
    table.innerHTML = "";

    // Adding The Attributes

    const tr1 = document.createElement("tr");

    for(let attr of Object.entries(content)) {
        const td = document.createElement("td");
        td.innerText = attr[1];
        tr1.appendChild(td);
    }

    table.appendChild(tr1);


    // Adding Table Content

    for(let row of result) {
        // Decoding The Input
        const inputResponse = await decodeUint256(row.input);

        const value = inputResponse.inputs[1].hex / 10e17;
        const to = inputResponse.inputs[0];
        const time = new Date(row.timeStamp * 1000);

        const tr = document.createElement("tr");

        for(let attr of Object.entries(content)) {
            const td = document.createElement("td");

            if(attr[0] == "timeStamp") td.innerText = time.toISOString().replace("T", " ").split(".")[0];
            else if(attr[0] == "value") td.innerText = value;
            else if(attr[0] == "to") td.innerText = "0x" + to;
            else td.innerText = row[attr[0]];
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}