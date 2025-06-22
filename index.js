// const StellarSdk = require('stellar-sdk');
// const axios = require('axios');

// const server = new StellarSdk.Server('https://api.mainnet.minepi.com');
// const senderSecret = 'SC3JUXMQEJZIWVHBO2RIAXHMGRQTKD3YNTP5NSGGEFQ3XU5FFMFMVUCX'; // YOUR SENDER SECRET
// const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
// const senderPublic = senderKeypair.publicKey();
// const apiUrl = `https://api.mainnet.minepi.com/accounts/${senderPublic}`;
// const recipient = 'GBQGBQSQRORPBDC7YCPL6JKABCMVZ5OXF7IGEIT34V4WJH52IBP2T2AS';

// async function sendPi(po) {
//     console.log(po);
//     try {
//         console.log('🔐 Sender Public Key:', senderPublic);
//         const account = await server.loadAccount(senderPublic);
//         const fee = (await server.fetchBaseFee()).toString();
//         // console.log(fee) // 100000
//         console.log(typeof fee); // string

//         const res = await axios.get(apiUrl);
//         const amount1 = res.data.balances[0].balance; // '0.9815688'
//         console.log(typeof amount1) // string
//         console.log(`Pi Balance : ${res.data.balances[0].balance}`);

//         // const withdrawAmount = Number(amount1) - Number("0.01")
//          const withdrawAmount = Number("348");
//         console.log(`Withdraw Amount: ${withdrawAmount}`);
//         console.log(typeof withdrawAmount.toString())

//         const tx = new StellarSdk.TransactionBuilder(account, {
//             fee,
//             networkPassphrase: 'Pi Network',
//         })
//             .addOperation(StellarSdk.Operation.payment({
//                 destination: recipient,
//                 asset: StellarSdk.Asset.native(),
//                 amount: withdrawAmount.toString(),
//             }))
//             .setTimeout(30)
//             .build();

//         tx.sign(senderKeypair);
//         const result = await server.submitTransaction(tx);
//         console.log("Tx Hash:", result.hash);
//         console.log("View Tx:", `https://api.mainnet.minepi.com/transactions/${result.hash}`);
//     } catch (e) {
//         console.error('❌ Error:', e.response?.data?.extras?.result_codes || e);
//     }
// }


// // Send every 3 seconds
// setInterval(() => {
//     sendPi("Hi1");
// }, 1000);


// // Send every 3 seconds
// setInterval(() => {
//     sendPi("hi2");
// }, 2000);

// setInterval(() => {
//     sendPi("Hi3");
// }, 3000);


// // // Send every 3 seconds
// // setInterval(() => {
// //     sendPi("hi2");
// // }, 4000);
// // setInterval(() => {
// //     sendPi("Hi3");
// // }, 3000);


// // // Send every 3 seconds
// // setInterval(() => {
// //     sendPi("hi4");
// // }, 5000);

// // setInterval(() => {
// //     sendPi("Hi5");
// // }, 500);


// // // Send every 3 seconds
// // setInterval(() => {
// //     sendPi("hi6");
// // }, 700);

// // setInterval(() => {
// //     sendPi("Hi7");
// // }, 900);


// // // Send every 3 seconds
// // setInterval(() => {
// //     sendPi("hi8");
// // }, 900);

// // setInterval(() => {
// //     sendPi("Hi9");
// // }, 6000);


// // // Send every 3 seconds
// // setInterval(() => {
// //     sendPi("hi10");
// // }, 1500);


const StellarSdk = require('stellar-sdk');
const ed25519 = require('ed25519-hd-key');
const bip39 = require('bip39');
const axios = require('axios');
require("dotenv").config();

async function getPiWalletAddressFromSeed(mnemonic) {
    // Validate seed phrase
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic");
    }

    // Get seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Pi Wallet (like Stellar) uses path m/44'/314159'/0'
    const derivationPath = "m/44'/314159'/0'";
    const { key } = ed25519.derivePath(derivationPath, seed.toString('hex'));

    // Create Stellar keypair from derived private key
    const keypair = StellarSdk.Keypair.fromRawEd25519Seed(key);

    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    console.log("🚀 Public Key (Sender Pi Wallet Address):", keypair.publicKey());

    return { publicKey, secretKey };
}

async function sendPi() {
    const server = new StellarSdk.Server('https://api.mainnet.minepi.com');
    // const mnemonic = process.env.MNEMONIC;
    // const recipient = process.env.RECEIVER_ADDRESS;
    const mnemonic = "model thank pet stone hello better always kingdom once mountain yellow belt vintage layer father soda jewel cross rich oyster vast upset narrow figure";
    const recipient = "GBQGBQSQRORPBDC7YCPL6JKABCMVZ5OXF7IGEIT34V4WJH52IBP2T2AS";
    const wallet = await getPiWalletAddressFromSeed(mnemonic);
    const senderSecret = wallet.secretKey;
    const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecret);
    const senderPublic = wallet.publicKey;
    const apiUrl = `https://api.mainnet.minepi.com/accounts/${senderPublic}`;
    try {
        // console.log('🔐 Sender:', senderPublic);

        const account = await server.loadAccount(senderPublic);

        const baseFee = await server.fetchBaseFee();
        const fee = (baseFee * 2).toString(); // Dynamically doubled gas fee
        console.log(`⛽ Base Fee: ${baseFee / 1e7}, Doubled Fee: ${fee / 1e7}`);

        const res = await axios.get(apiUrl);
        const balance = res.data.balances[0].balance;
        console.log(`Pi Balance: ${balance}`);

        // const withdrawAmount = Number(balance) - 2;
         const withdrawAmount = 2;
        if (withdrawAmount <= 0) {
            console.log("⚠️ Not enough Pi to send. Skipping...");
            console.log(`-------------------------------------------------------------------------------------`)
        } else {
            const formattedAmount = withdrawAmount.toFixed(7).toString();
            console.log(`➡️ Sending: ${formattedAmount} Pi`);

            const tx = new StellarSdk.TransactionBuilder(account, {
                fee,
                networkPassphrase: 'Pi Network',
            })
                .addOperation(StellarSdk.Operation.payment({
                    destination: recipient,
                    asset: StellarSdk.Asset.native(),
                    amount: formattedAmount,
                }))
                .setTimeout(30)
                .build();

            tx.sign(senderKeypair);

            const result = await server.submitTransaction(tx);

            if (result && result.transaction_hash !== false) {
                console.log("✅ Tx Hash:", result);
                console.log(`🔗 View Tx: https://api.mainnet.minepi.com/transactions/${result.hash}`);
                console.log(`-------------------------------------------------------------------------------------`)
            } else {
                console.log("⚠️ Transaction submitted but not confirmed successful:", result);
                console.log(`-------------------------------------------------------------------------------------`)
            }
        }
    } catch (e) {
        console.error('❌ Error:', e.response?.data?.extras?.result_codes || e.message || e);
        console.log(`-------------------------------------------------------------------------------------`)
    } finally {
        setTimeout(sendPi, 499); // Run again after 999 ms
    }
}

sendPi(); // Start the loop


