const {mongodb} = require("../databases");
const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const config = require('config');
const {
    TransferErc721,
    ApprovalErc721,
} = require('../data/constans')
const {updateCollectionStats} = require("./stats.service");
const Web3 = require("web3");

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const abi = require("../data/abiDiamond.json")

const web3 = new Web3(config.get("providers.bsc"));

const wethContract = new web3.eth.Contract(abi, config.get("contracts.diamondBsc"));

async function diamondRun() {
    console.log("diamond log start : ", config.get("contracts.diamondBsc"))

    const lastBlockNumber = await web3.eth.getBlockNumber();
    console.log("lastBlockNumber : ", lastBlockNumber)


    await wethContract.events.allEvents({
        fromBlock: lastBlockNumber
    }, async (error, event) => {

        console.log({r: event})

        if (!event)
            return;

        if (!event.event)
            return;

        if (event.event !== "TransferSingle")
            return;

        console.log('event : ', event)


        const tokenId = event.returnValues.id;
        const from = event.returnValues.from.toLowerCase();
        const to = event.returnValues.to.toLowerCase();
        const blockNumber = event.blockNumber;
        const transactionHash = event.transactionHash;
        const blockHash = event.blockHash;
        const transaction = await web3.eth.getTransaction(transactionHash)

        let ethValue = 0

        if (transaction.value)
            ethValue = web3.utils.fromWei(transaction.value)

        let gasPrice = 0
        if (transaction.gasPrice)
            gasPrice = web3.utils.fromWei(transaction.gasPrice)


        const diamond = await mongodb.Diamond.findOne({edition: tokenId})
        if (!diamond)
            return;

        let user2 = []
        if (from !== NULL_ADDRESS) {

            user2 = await mongodb.User.findOne({address: from});
            if (user2) {
                const oldDiamond = await mongodb.UserDiamond.findOne({userId: user2._id, diamondId: diamond._id})
                oldDiamond.deletedAt = new Date()
                await oldDiamond.save()

            }
        }

        const user = await mongodb.User.findOne({address: to});

        if (!user)
            return;

        const auction = await mongodb.Auction.findOne({userId: user._id, status: 'RESERVED', diamondId: diamond._id});

        if (auction) {

            await mongodb.UserDiamond.create({
                userId: user._id,
                diamondId: diamond._id,
                status: 'BOUGHT',
                auctionId: auction._id
            });
            auction.status = 'FINISHED'
            await auction.save();
        }


        await mongodb.Transfer.create({
            tokenId, from, to, blockNumber, transactionHash, blockHash
        })

        await mongodb.DiamondTrade.create({
            payerId: user2._id,
            payeeId: user._id,
            auctionId: auction._id,
            amount: ethValue,
            fee: gasPrice
        })
    });

}

module.exports = {
    diamondRun
}