console.log('Hello People');

const serverUrl = "https://ddab2dfsfjms.usemoralis.com:2053/server";
const appId = "8b8p3so3slIDR9W2PTJgPM5ocvG9lTb4ClXoGvir";
Moralis.start({ serverUrl, appId });

let homepage = "http://127.0.0.1:5500/index.html";
if (Moralis.User.current() == null && window.location.href != homepage){
    document.querySelector('body').style.display='none';
    window.location.href = "index.html"; //redirect to login
}

login = async() =>{
    await Moralis.authenticate().then(async function (user) {
        console.log(user.get('ethAddress'));
        console.log(Moralis.User.current());

        user.set("name",document.getElementById('user-username').value);
        user.set("email",document.getElementById('user-email').value);
        await user.save();

        window.location.href = "dashboard.html"; //redirect to dashboard
    });  
}

logout = async () =>{
    await Moralis.User.logOut();
    window.location.href = "index.html"; //redirect to login
}

getTransactions = async () =>{
    console.log('get-transactions clicked');
    const options = { chain: "rinkeby", address: "0xa5e4f1dA02ae1326F2Fb03A3dd5DE8379BC52540" };
    const transactions = await Moralis.Web3API.account.getTransactions(options);
    console.log(transactions);

    if(transactions.total > 0){
        let table = `
        <table class="table">
        <thead>
            <tr>
                <th scope="col">Transaction</th>
                <th scope="col">Block Number</th>
                <th scope="col">Age</th>
                <th scope="col">Type</th>
                <th scope="col">Fee</th>
                <th scope="col">Value</th>
            </tr>
        </thead>
        <tbody id="theTransactions">
        </tbody>
        </table>
        `
        document.querySelector('#tableOfTransactions').innerHTML = table;

        transactions.result.forEach(t => {
            let content =`
            <tr>
                <td><a href="https://rinkeby.etherscan.io/tx/${t.hash}"  target="_blank" rel="noopener norefferer">${t.hash}</a></td>
                <td><a href="https://rinkeby.etherscan.io/block/${t.block_number}"  target="_blank" rel="noopener norefferer">${t.block_number}</a></td>
                <td>${millisecondToTime(Date.parse(new Date()) - Date.parse((t.block_timestamp)))}</td>
                <td>${t.from_address == Moralis.User.current().get('ethaddress') ? 'Outgoing' : 'Incoming'}</td>
                <td>${((t.gas * t.gas_price)/1e18).toFixed(5)} ETH</td>
                <td>${(t.value / 1e18).toFixed(5)}</td>
            </tr>
            `
            theTransactions.innerHTML += content;
        });
    }

}

getBalances = async () => {
    console.log("Clicked get-balances");
    const ethBalance = await Moralis.Web3API.account.getNativeBalance({address: "0xa5e4f1dA02ae1326F2Fb03A3dd5DE8379BC52540"});
    const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "ropsten" , address: "0xa5e4f1dA02ae1326F2Fb03A3dd5DE8379BC52540"});
    const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "rinkeby" , address: "0xa5e4f1dA02ae1326F2Fb03A3dd5DE8379BC52540" });
    console.log((ethBalance.balance / 1e18 ).toFixed(5) + "ETH");
    console.log((ropstenBalance.balance / 1e18 ).toFixed(5) + "ETH");
    console.log((rinkebyBalance.balance / 1e18 ).toFixed(5) + "ETH");

    let content = document.querySelector('#userBalances').innerHTML = `
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Chain</th>
                <th scope="col">Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>Ether</th>
                <td>${(ethBalance.balance / 1e18 ).toFixed(5)} ETH</td>
                <th>Ropsten</th>
                <td>${(ropstenBalance.balance / 1e18 ).toFixed(5)} ETH</td>
                <th>Rinkeby</th>
                <td>${(rinkebyBalance.balance / 1e18 ).toFixed(5)} ETH</td>
            </tr>
        </tbody>
        </table>
    `
}

getNFTs = async () =>{
    console.log("Clicked get-nfts");
    let nfts = await Moralis.Web3API.account.getNFTs({chain : 'rinkeby', address: "0xe711c3Ef1556e068941504D02d7FF46BbF721ED4"});;
    console.log(nfts);
    if(nfts.result.length > 0){
        nfts.result.forEach(n =>{
            console.log(n.metadata);
        })
    }
}

millisecondToTime = (ms) =>{
    let minutes = Math.floor(ms/(1000*60));
    let hours = Math.floor(ms/(1000*60*60));
    let days = Math.floor(ms/(1000*60*60*24));

    if(days < 1){
        if(hours < 1){ 
        if(minutes < 1){ 
                return `less than a minute ago`;
            } return `${minutes} minute(s) ago`;
        } return `${hours} hour(s) ago`;
    } else return `${days} day (s) ago`;
}

if(document.querySelector('#btn-login') != null){
    document.querySelector('#btn-login').onclick = login;
}
if(document.querySelector('#btn-logout') != null){
    document.querySelector('#btn-logout').onclick = logout;
}
if(document.querySelector('#get-transactions-link') != null){
    document.querySelector('#get-transactions-link').onclick = getTransactions;
}
if(document.querySelector('#get-balances-link') != null){
    document.querySelector('#get-balances-link').onclick = getBalances;
}
if(document.querySelector('#get-nfts-link') != null){
    document.querySelector('#get-nfts-link').onclick = getNFTs;
}

// get-transactions-link
// get-balances-link
// get-nfts-link