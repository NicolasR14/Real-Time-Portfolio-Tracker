const axios = require("axios");

async function test(){
    const id = '"total"';
    const res = await axios.post("https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    {"variables":{},"query":"{\n  glpStats(\n where: {id: "+id+"}\n) {\n    id\n    aumInUsdg\n    glpSupply\n }\n}\n"})
    .then(res => console.log(res.data.data.glpStats[0]))
}

async function test2(){
    const id = '"hourly"';
    const res = await axios.post("https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    {"variables":{},"query":"{\n  tokenStats(\n orderBy: timestamp\n orderDirection: desc\n where: {period: daily}\n) {\n    timestamp\n    poolAmountUsd\n    poolAmount\n period\n token\n}\n}\n"})
    .then(res => {
        const data = res.data.data.tokenStats;
        var total_usd = 0;
        for (const a of data){
            if(a.timestamp === data[0].timestamp){
                total_usd+=parseInt(a.poolAmountUsd);
            }
        }
        for (const a of data){
            if(a.timestamp === data[0].timestamp){
            console.log(parseInt(a.poolAmountUsd)/total_usd, a.token);
        }
        }

    })
}

async function test3(){
    const res = await axios.get("https://tofunft.com/collection/blueberryclub/activities")
        .then(res => console.log())
    
}
test3()

//{"variables":{},"query":"{\n  glpStats(\n    first: 1000\n    orderBy: id\n    orderDirection: desc\n    where: {period: daily, id_gte: 1630382400, id_lte: 1651930481}\n  ) {\n    id\n    aumInUsdg\n    glpSupply\n    distributedUsd\n    distributedEth\n    __typename\n  }\n}\n"})