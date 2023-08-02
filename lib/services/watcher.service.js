/*
| Author : Mohammad Ali Ghazi
| Email  : mohamadalghazy@gmail.com
| Date   : Thu Jun 02 2022
| Time   : 1:03:42 PM
 */

const {mongodb} = require("../databases");
const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const config = require('config');
const {
    TransferErc721,
    ApprovalErc721,
    ERC721OrderCancelled,
    ERC721OrderFilled,
    ApprovalEthereumWeth,
    ApprovalPolygonWeth,
    TransferEthereumWeth,
    TransferPolygonWeth,
    DepositWeth,
    WithdrawalWeth,
    BalanceWeth,
    PolygonBalanceWeth,
    OwnerOf,
    AllowanceWeth,
    PolygonAllowanceWeth,
} = require('../data/constans')
const {updateCollectionStats} = require("./stats.service");
const Web3 = require("web3");

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const abi = require("../data/abi721.json")

class Handler {

    constructor(web3, chain) {

        this.web3 = web3;

        this.chain = chain;

        this.wethContract = new web3.eth.Contract(abi, config.get("contracts.bsc"));

        // encode events and create signature
        this.TransferErc721Signature = web3.eth.abi.encodeEventSignature(TransferErc721);
        this.ApprovalErc20Signature = web3.eth.abi.encodeEventSignature(ApprovalErc721);
        /*this.ERC721OrderCancelledSignature = web3.eth.abi.encodeEventSignature(ERC721OrderCancelled);
        this.ERC721OrderFilledSignature = web3.eth.abi.encodeEventSignature(ERC721OrderFilled);
        this.ApprovalEthereumWethSignature = web3.eth.abi.encodeEventSignature(ApprovalEthereumWeth);
        // this.ApprovalPolygonWethSignature = web3.eth.abi.encodeEventSignature(ApprovalPolygonWeth);
        this.DepositWethSignature = web3.eth.abi.encodeEventSignature(DepositWeth);
        this.WithdrawalWethSignature = web3.eth.abi.encodeEventSignature(WithdrawalWeth);
        this.TransferEthereumWethSignature = web3.eth.abi.encodeEventSignature(TransferEthereumWeth);
        this.TransferPolygonWethSignature = web3.eth.abi.encodeEventSignature(TransferPolygonWeth);*/

    }

    async init() {

        console.log("Watching on contract : ", config.get("contracts.bsc"))

        /*let lastCheckedBlockNumber = await mongodb.EventBlockNumber.findOne(
            {key: "BLOCK_NUMBER"},
        );*/
        const lastBlockNumber = await this.web3.eth.getBlockNumber();

        /*if(lastCheckedBlockNumber){
            lastCheckedBlockNumber = parseInt(lastCheckedBlockNumber.value);

            console.log({lastBlockNumber , lastCheckedBlockNumber})

            if(lastCheckedBlockNumber < lastBlockNumber){
                // this.getLastBlock(lastCheckedBlockNumber , lastBlockNumber)
            }
        }*/

        await this.wethContract.events.allEvents({
            fromBlock: lastBlockNumber
        }, async (error, event) => {

            console.log({r: event})

            if(!event)
                return;

            const fromAddress = event.returnValues.from.toLowerCase();
            const toAddress = event.returnValues.to.toLowerCase();
            const tokenId = event.returnValues.tokenId.toLowerCase();

            if(event.event === "Transfer"){
                //MINT or transfer
                if(fromAddress === NULL_ADDRESS){
                    //MINT
                    await this.Transfer(event);
                } else if(toAddress === NULL_ADDRESS){
                    //BURN
                    await this.Transfer(event);
                } else {
                    // TRANSFER from one address to another
                    await this.Transfer(event);
                }
            }

        });

        /*this.wethContract.events.Transfer({
            fromBlock: lastBlockNumber
        }, async (error, event) => {

            console.log({r: event})

            if (!event)
                return;

            const tokenId = event.returnValues.tokenId;

            console.log("Transfer received", {tokenId, from: event.returnValues.from, to: event.returnValues.to})

            await this.Transfer(event);
        });
*/
        /*this.web3.eth.subscribe("newBlockHeaders")
            .on("data", async (block) => {

                console.log("getting block: ", block.number)

                let data = await this.web3.eth.getBlock(block.number, true);

                console.log("Hash: ", data?.hash)

                await this.startProcess(data);

            })
            .on("error", (err) => {

                console.log(this.chain + " ws error: ", err);

            })
            .on("connected", () => {

                console.log(this.chain + " ws connected");

            });
*/
    }

    async getLastBlock(fromBlock, toBlock) {
        if (fromBlock > toBlock)
            return;
        console.log("getting lost block: ", fromBlock)

        const block = await this.web3.eth.getBlock(fromBlock)

        // let receipt = await this.web3.eth.getTransactionReceipt("0x09e3a27e43264a52be6c135c35d10e937ec28c62f5e8ac61ad3f59587e4fc708");

        console.log("Hash: ", block?.hash)
        // console.log({block})

        await this.startProcess(block);

        setTimeout(() => {
            this.getLastBlock(++fromBlock, toBlock)
        }, 100)
    }

    /**
     * handle all transaction
     * @param {*} data
     * @returns
     */
    startProcess(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let result = await mongodb.ContractAddress.find({status: "ACTIVE", chain: this.chain}, {
                    address: 1,
                    _id: 0,
                    type: 1
                });

                let addressList = [], extraData = {};
                for (const item of result) {

                    addressList.push(item.address?.toLowerCase());

                    extraData[item.address?.toLowerCase()] = item.type;

                }

                // proccess all transaction in this block
                for (const item of data?.transactions ?? []) {

                    if (!item.to)
                        continue;

                    // check contract address is exist in db
                    if (!addressList.includes(item.to?.toLowerCase()))
                        continue;

                    // get transaction receipt
                    let receipt = await this.web3.eth.getTransactionReceipt(item.hash);

                    // proccess all logs in this transaction
                    for (const log of receipt?.logs ?? []) {

                        // exctract current event signature
                        let eventSignature = log.topics?.shift();

                        try {

                            if (eventSignature === this.TransferErc721Signature &&
                                (extraData[receipt.to?.toLowerCase()] === "ERC721" || extraData[receipt.to?.toLowerCase()] === "ERC1155")) {

                                let returnValues = this.web3.eth.abi.decodeLog(TransferErc721.inputs, log.data, log.topics);

                                console.log("Running transfer")
                                console.log({returnValues})

                                await this.Transfer({returnValues, ...receipt});
                            }

                            /* if (eventSignature === this.ApprovalErc20Signature) {

                                 let returnValues = this.web3.eth.abi.decodeLog(ApprovalErc721.inputs, log.data, log.topics);

                                 await this.ApprovalForAll({returnValues, ...receipt});
                             }*/

                            /*if (eventSignature === this.ERC721OrderCancelledSignature) {

                                let returnValues = this.web3.eth.abi.decodeLog(ERC721OrderCancelled.inputs, log.data, log.topics);

                                await this.ERC721OrderCancelledFN({ returnValues, ...receipt })
                            }

                            if (eventSignature === this.ERC721OrderFilledSignature) {

                                let returnValues = this.web3.eth.abi.decodeLog(ERC721OrderFilled.inputs, log.data, log.topics);

                                await this.ERC721OrderFilledFN({ returnValues, ...receipt })
                            }

                            let ApprovalWethSignature = this.ApprovalEthereumWethSignature ;

                            if (eventSignature === ApprovalWethSignature) {

                                let ApprovalWeth = ApprovalEthereumWeth;

                                let returnValues = this.web3.eth.abi.decodeLog(ApprovalWeth.inputs, log.data, log.topics);

                                await this.ApprovalWethFN({ returnValues, ...receipt });
                            }

                            if (eventSignature === this.DepositWethSignature) {

                                let returnValues = this.web3.eth.abi.decodeLog(DepositWeth.inputs, log.data, log.topics);

                                await this.DepositWethFN({ returnValues, ...receipt });
                            }

                            let TransferWethSignature = this.TransferEthereumWethSignature;

                            if (eventSignature === TransferWethSignature && extraData[item.to?.toLowerCase()] === "BEP20") {

                                let TransferWeth = TransferEthereumWeth;

                                let returnValues = this.web3.eth.abi.decodeLog(TransferWeth.inputs, log.data, log.topics);

                                await this.TransferWethFN({ returnValues, ...receipt });
                            }

                            if (eventSignature === this.WithdrawalWethSignature) {

                                let returnValues = this.web3.eth.abi.decodeLog(WithdrawalWeth.inputs, log.data, log.topics);

                                await this.WithdrawalWethFN({ returnValues, ...receipt });
                            }*/

                        } catch (error) {

                        }
                    }
                }

                await mongodb.EventBlockNumber.findOneAndUpdate(
                    {key: "BLOCK_NUMBER"},
                    {key: "BLOCK_NUMBER", value: data?.number?.toString()},
                    {upsert: true}
                );


            } catch (error) {

                console.log(error, "error " + this.chain);

            }

            return resolve();
        });
    }

    /**
     * set transfer transaction and update databse
     * @param {*} data
     * @returns
     */
    Transfer(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let {
                    returnValues: {from, to, tokenId},
                    transactionHash,
                    blockHash,
                    blockNumber,
                } = data;

                console.log("Got " + tokenId)
                console.log("from " + from)
                console.log("to " + to)

                let usertoken = await mongodb.UserToken.findOne({serialId: tokenId});

                if (!usertoken) return resolve();

                let assignedToken,
                    receiver,
                    type = "MINT";

                // mint nft event
                if (from === NULL_ADDRESS) {
                    assignedToken = await mongodb.UserAssignedToken.findOneAndUpdate(
                        {tokenId: usertoken.id, status: "PENDING"},
                        {status: "FREE"},
                    );

                    //update collection stats
                    updateCollectionStats(usertoken.collectionId, null, null, null, 1);

                    //save tokens name in explorers table
                    await mongodb.UserExplore.create({
                        name: usertoken.name,
                        type: "TOKENS",
                        typeId: usertoken.id,
                        tokenImage: usertoken?.thumbnail?.[0]?.location,
                    });
                } else if (to === NULL_ADDRESS) {
                    // burn nft event
                    type = "BURN";

                    // change token status
                    assignedToken = await this.UpdateTokenStatus(usertoken.id, "BURNED");

                    //update collection stats
                    updateCollectionStats(usertoken.collectionId, null, null, null, -1);

                    // remove token from explorer
                    await mongodb.UserExplore.findOneAndUpdate(
                        {deletedAt: null, type: "TOKENS", typeId: usertoken.id},
                        {$set: {deletedAt: new Date()}},
                    );
                } else {
                    // transfer nft between address

                    type = "TRANSFER";

                    // change token status
                    assignedToken = await this.UpdateTokenStatus(usertoken.id, "TRANSFERRED");

                    // check receiver address is exist
                    receiver = await mongodb.User.findOneAndUpdate({address: to.toLowerCase()}, {address: to.toLowerCase()}, {
                        upsert: true,
                        new: true
                    });

                    // transfer token to new receiver
                    await mongodb.UserAssignedToken.create({
                        tokenId: usertoken.id,
                        userId: receiver.id,
                        collectionId: usertoken.collectionId,
                        status: "FREE",
                    });

                    //update collection stats
                    updateCollectionStats(usertoken.collectionId, null, null, 1, null);

                }

                // save this event in user activity
                await mongodb.UserActivity.create({
                    from: assignedToken?.userId,
                    to: receiver?.id,
                    type,
                    tokenId: usertoken.id,
                    collectionId: usertoken.collectionId,
                    transactionHash,
                    blockHash,
                    blockNumber,
                });

            } catch (error) {

                console.log("Transfer Error", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     * update user token and auction status
     * @param {*} tokenId
     * @param {*} status
     * @returns
     */
    UpdateTokenStatus(tokenId, status) {
        return new Promise(async (resolve, reject) => {
            // change token status
            let assignedToken = await mongodb.UserAssignedToken.findOneAndUpdate(
                {tokenId, status: {$in: ["FREE", "IN_AUCTION"]}},
                {status},
            );

            await mongodb.UserAuctions.findOneAndUpdate(
                {assignTokenId: assignedToken._id, status: {$in: ["ACTIVE"]}},
                {status: 'FINISH', deletedAt: new Date()},
            );

            return resolve(assignedToken);
        });
    }

    /**
     * set approval for all update
     * @param {*} data
     * @returns
     */
    ApprovalForAll(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let {
                    returnValues: {owner, approved},
                } = data;

                let user = await mongodb.User.findOneAndUpdate(
                    {address: owner.toLowerCase()},
                    {[this.chain?.toLowerCase() + "ApprovedNft"]: approved},
                );

                if (!approved) {

                    let auctions = await mongodb.UserAuctions.findOne({userId: user.id, status: "ACTIVE"}).populate({
                        path: "assignTokenId",
                        populate: {
                            path: "tokenId",
                            match: {chain: this.chain},
                        },
                    });

                    for (const auction of auctions)
                        if (auction?.assignTokenId?.tokenId) auction.update({status: "FINISH"});
                }

            } catch (error) {

                console.log("ApprovalForAll Error", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     * handle cancel erc721 events
     * @param {*} data
     * @returns
     */
    ERC721OrderCancelledFN(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let {
                    returnValues: {nonce},
                    transactionHash,
                    blockHash,
                    blockNumber,
                } = data;

                let result = await mongodb.UserAuctions.findOneAndUpdate(
                    {"signature.nonce": nonce},
                    {status: "FINISH", signature: null},
                );

                if (result) {

                    let assignedToken = await mongodb.UserAssignedToken.findOneAndUpdate(
                        {_id: result.assignTokenId, userId: result.userId},
                        {status: "FREE"},
                    );

                    //save CANCEL event in user activity
                    await mongodb.UserActivity.create({
                        from: result.userId,
                        type: "CANCEL",
                        tokenId: assignedToken.tokenId,
                        collectionId: assignedToken.collectionId,
                        transactionHash,
                        blockHash,
                        blockNumber,
                    });

                } else {

                    let offer = await mongodb.UserAuctionOffer.findOneAndUpdate(
                        {"signature.nonce": nonce},
                        {status: "CANCEL", signature: null},
                    );

                    if (offer) {

                        //decrement amount offer in user approval
                        let approval = await mongodb.UserApproval.findOne({userId: offer.userId});

                        let oldAmountOffers = this.web3.utils.toBN(approval.amountOffers),
                            amountBN = this.web3.utils.toBN(this.web3.utils.toWei(offer.amount.toString(), "ether")),
                            newAmountOffers = oldAmountOffers.sub(amountBN);

                        await approval.update({amountOffers: newAmountOffers});

                    }
                }

            } catch (error) {

                console.log("ERC721OrderCancelledFN", error);

            } finally {

                return resolve();
            }
        });
    }

    /**
     * handle filling erc721 order
     * @param {*} data
     * @returns
     */
    ERC721OrderFilledFN(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let {
                    returnValues: {erc20TokenAmount, erc721TokenId, taker, maker, nonce},
                    transactionHash,
                    blockHash,
                    blockNumber,
                } = data;

                // check token is exist
                let userToken = await mongodb.UserToken.findOne({serialId: erc721TokenId});

                if (!userToken) return resolve();

                // check collection is exist
                let userAssignedToken = await mongodb.UserAssignedToken.findOne({tokenId: userToken.id});

                if (!userAssignedToken) return resolve();

                let result = await mongodb.UserAuctions.findOneAndUpdate(
                    {"signature.nonce": nonce},
                    {status: "FINISH", signature: null},
                );

                if (!result) {

                    let offer = await mongodb.UserAuctionOffer.findOneAndUpdate(
                        {"signature.nonce": nonce},
                        {status: "ACCEPTED", signature: null},
                    );

                    if (offer) {

                        //decrement amount offer in user approval
                        let approval = await mongodb.UserApproval.findOne({userId: offer.userId});

                        let oldAmountOffers = this.web3.utils.toBN(approval.amountOffers),
                            amountBN = this.web3.utils.toBN(erc20TokenAmount),
                            newAmountOffers = oldAmountOffers.sub(amountBN);

                        await approval.update({amountOffers: newAmountOffers});

                    }

                }

                // convert to ether value
                let amount = this.web3.utils.fromWei(erc20TokenAmount, "ether");

                //update collection stats
                updateCollectionStats(userAssignedToken.collectionId, +amount);

                let makerUser = await mongodb.User.findOneAndUpdate({address: maker.toLowerCase()}, {address: maker.toLowerCase()}, {
                    upsert: true,
                    new: true
                });

                let takerUser = await mongodb.User.findOneAndUpdate({address: taker.toLowerCase()}, {address: taker.toLowerCase()}, {
                    upsert: true,
                    new: true
                });

                //save SALE event in user activity
                await mongodb.UserActivity.create({
                    from: makerUser?.id,
                    to: takerUser?.id,
                    type: "SALE",
                    price: +amount,
                    tokenId: userAssignedToken.tokenId,
                    collectionId: userAssignedToken.collectionId,
                    transactionHash,
                    blockHash,
                    blockNumber,
                });

            } catch (error) {

                console.log("ERC721OrderFilledFN", error);

            } finally {

                return resolve();
            }
        });
    }

    /**
     * set approval for wallets
     * @param {*} data
     * @returns
     */
    ApprovalWethFN(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let owner, spender, value;

                if (this.chain === "ETHEREUM") {

                    let {
                        returnValues: {src, guy, wad},
                    } = data;

                    owner = src;
                    spender = guy;
                    value = wad;

                } else {

                    let {returnValues} = data;

                    owner = returnValues.owner;
                    spender = returnValues.spender;
                    value = returnValues.value;

                }

                if (this.chain === "ETHEREUM" && spender?.toLowerCase() !== config.get("contracts.ethExchange").toLowerCase())
                    return resolve();

                if (this.chain === "POLYGON" && spender?.toLowerCase() !== config.get("contracts.polygonExchange").toLowerCase())
                    return resolve();

                let user = await mongodb.User.findOne({address: owner.toLowerCase()});

                if (!user) return resolve();

                user[this.chain?.toLowerCase() + "ApprovedWallet"] = value == 0 ? false : true;

                await user.save();

                let balance = await this.wethContract.methods.balanceOf(owner).call();

                let approval = await mongodb.UserApproval.findOne({userId: user.id, chain: this.chain});

                if (!approval) {

                    approval = await mongodb.UserApproval.create({
                        userId: user.id,
                        chain: this.chain,
                        amountApproved: value,
                        balance,
                    });

                } else {

                    approval.amountApproved = value;

                    approval.balance = balance;

                    await approval.save();

                }

                this.CheckUserOffer(approval);

                return resolve();

            } catch (error) {

                console.log("Approval Error", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     *
     * @param {*} data
     * @returns
     */
    DepositWethFN(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let {
                    returnValues: {dst},
                } = data;

                let user = await mongodb.User.findOne({
                    address: dst.toLowerCase(),
                    [this.chain?.toLowerCase() + "ApprovedWallet"]: true
                });

                if (!user) return resolve();

                let approval = await mongodb.UserApproval.findOne({userId: user.id, chain: this.chain});

                if (approval) return resolve();

                let balance = await this.wethContract.methods.balanceOf(dst).call();

                approval.balance = balance;

                await approval.save();

                this.CheckUserOffer(approval);

            } catch (error) {

                console.log("DepositWethFN:", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     * transfer event eth
     * @param {*} data
     * @returns
     */
    TransferWethFN(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let from, to;

                if (this.chain === "ETHEREUM") {

                    let {
                        returnValues: {src, dst},
                    } = data;

                    from = src;
                    to = dst;

                } else {

                    let {returnValues} = data;

                    from = returnValues.from;
                    to = returnValues.to;

                }

                let userSender = await mongodb.User.findOne({
                    address: from.toLowerCase(),
                    [this.chain?.toLowerCase() + "ApprovedWallet"]: true,
                });

                let userReceiver = await mongodb.User.findOne({
                    address: to.toLowerCase(),
                    [this.chain?.toLowerCase() + "ApprovedWallet"]: true,
                });

                let approval;

                if (userSender) {

                    let balance = await this.wethContract.methods.balanceOf(from).call();

                    approval = await mongodb.UserApproval.findOne({
                        userId: userSender.id,
                        chain: this.chain,
                    });

                    if (approval) {

                        approval.balance = balance;

                        await approval.save();
                    }
                }

                if (userReceiver) {

                    let balance = await this.wethContract.methods.balanceOf(to).call();

                    approval = await mongodb.UserApproval.findOne({
                        userId: userReceiver.id,
                        chain: this.chain,
                    });

                    if (approval) {

                        approval.balance = balance;

                        await approval.save();
                    }
                }

                if (approval) this.CheckUserOffer(approval);

            } catch (error) {

                console.log("TransferWeth Error:", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     * set withdraw event for user
     * @param {*} data
     * @returns
     */
    WithdrawalWethFN(data) {
        return new Promise(async (resolve, reject) => {

            try {

                let {
                    returnValues: {src},
                } = data;

                let user = await mongodb.User.findOne({
                    address: src.toLowerCase(),
                    [this.chain?.toLowerCase() + "ApprovedWallet"]: true
                });

                if (!user) return resolve();

                let approval = await mongodb.UserApproval.findOne({userId: user.id, chain: this.chain});

                if (approval) return resolve();

                let balance = await this.wethContract.methods.balanceOf(src).call();

                approval.balance = balance;

                await approval.save();

                this.CheckUserOffer(approval);

                return resolve();

            } catch (error) {

                console.log("WithdrawalWethFN:", error);

            } finally {

                return resolve();

            }
        });
    }

    /**
     * check user approval status for offers
     * @param {*} approvalEntity
     * @returns
     */
    CheckUserOffer(approvalEntity) {
        return new Promise(async (resolve, reject) => {

            let amountApproved = this.web3.utils.toBN(approvalEntity.amountApproved),
                amountOffers = this.web3.utils.toBN(approvalEntity.amountOffers),
                balance = this.web3.utils.toBN(approvalEntity.balance);

            if (amountApproved.gte(amountOffers) && balance.gte(amountOffers)) return resolve();

            let maximum;

            if (amountApproved.gt(balance) || amountApproved.eq(balance)) maximum = balance;

            if (amountApproved.lt(balance)) maximum = amountApproved;

            let offers = await mongodb.UserAuctionOffer.find({
                userId: approvalEntity.userId,
                status: "REGISTER",
                expiresAt: {$gt: Date.now()},
                signature: {$ne: null},
            }).sort({createdAt: "asc"});

            let total = {value: maximum, offers: amountOffers};

            for (const offer of offers) {

                let amountOffer = this.web3.utils.toBN(this.web3.utils.toWei(offer.amount.toString(), "ether"));

                let remaining = total.value.sub(amountOffer),
                    remainingOffer = total.offers.sub(amountOffer);

                await offer.update({status: "CANCEL", signature: null});

                await approvalEntity.update({amountOffers: remainingOffer.toString()});

                if (remaining.lte(total.value)) break;

                total.value = remaining;

                total.offers = remainingOffer;
            }

            return resolve();
        });
    }
}

// call eth and polygon cron
/*
if (parseInt(process.env.NODE_APP_INSTANCE) === 0) {

	const ethWeb3 = createAlchemyWeb3(config.get("providers.ethereum"));

	const handler = new Handler(ethWeb3, "ETHEREUM");

	handler.init();
}
*/

const web3 = new Web3(config.get("providers.bsc"));

// const bscWeb3 = createAlchemyWeb3(config.get("providers.bsc"));

const handler = new Handler(web3, "BSC");

handler.init();


/**
 * scan pending nfts
 * @param {Number} start
 * @param {Number} end
 * @returns
 */
/*function checkTokenStatus(start, end) {
	return new Promise(async (resolve, reject) => {

		const ethWeb3 = createAlchemyWeb3(config.get("providers.ethereum"));

		const polygonWeb3 = createAlchemyWeb3(config.get("providers.polygon"));

		let ethContract = new ethWeb3.eth.Contract([OwnerOf], config.get("contracts.ethErc721"));

		let polygonContract = new polygonWeb3.eth.Contract([OwnerOf], config.get("contracts.polygonErc721"));

		let pendingToken = await mongodb.UserAssignedToken.find({ status: "PENDING" }).populate(["tokenId", "userId"]);



		for (const item of pendingToken) {

			let contract = item?.tokenId?.chain === "ETHEREUM" ? ethContract : polygonContract;

			try {

				let owner = await contract.methods.ownerOf(item?.tokenId?.serialId).call();

				if (owner?.toLowerCase() !== item?.userId?.address) continue;

				await mongodb.UserAssignedToken.findOneAndUpdate(
					{ tokenId: item?.tokenId?.id, status: "PENDING" },
					{ status: "FREE" },
				);

				//update collection stats
				updateCollectionStats(item.collectionId, null, null, null, 1);

				//save tokens name in explorers table
				await mongodb.UserExplore.create({
					name: item?.tokenId?.name,
					type: "TOKENS",
					typeId: item?.tokenId?.id,
					tokenImage: item?.tokenId?.thumbnail?.[0]?.location,
				});

				// save this event in user activity
				await mongodb.UserActivity.create({
					from: item?.userId?.id,
					// to: receiver?.id,
					type: "MINT",
					tokenId: item?.tokenId?.id,
					collectionId: item.collectionId,
				});

				console.log('====================================');
				console.log(owner, item?.tokenId?.serialId, item?.tokenId?.chain);
				console.log('====================================');

			} catch (error) {

				continue;
			}

		}

	});
}

/!**
 * check user balance and update user approval
 * @returns 
 *!/
function checkUserBalance() {
	return new Promise(async (resolve, reject) => {

		// const ethWeb3 = createAlchemyWeb3(config.get("providers.ethereum"));

		const polygonWeb3 = createAlchemyWeb3(config.get("providers.polygon"));

		// let ethContract = new ethWeb3.eth.Contract([BalanceWeth, AllowanceWeth], config.get("contracts.ethereumWeth"));

		let polygonContract = new polygonWeb3.eth.Contract([PolygonBalanceWeth, PolygonAllowanceWeth], config.get("contracts.polygonWeth"));

		let users = await mongodb.User.find();

		for (const user of users) {

			let balance = await polygonContract.methods.balanceOf(user.address).call();
			let amountApproved = await polygonContract.methods.allowance(user.address, "0xdef1c0ded9bec7f1a1670819833240f027b25eff").call();

			await mongodb.UserApproval.findOneAndUpdate(
				{ userId: user.id, chain: "POLYGON" },
				{ userId: user.id, chain: "POLYGON", amountApproved, balance },
				{ upsert: true }
			);

		}

		console.log("end");
	});
}*/
