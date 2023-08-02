module.exports = {
	TransferErc721: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
		],
		name: "Transfer",
		type: "event",
	},
	ApprovalErc721: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "approved",
				type: "address",
			},
			{
				indexed: true,
				internalType: "uint256",
				name: "tokenId",
				type: "uint256",
			},
		],
		name: "Approval",
		type: "event",
	},
	ERC721OrderCancelled: {
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: "address", name: "maker", type: "address" },
			{ indexed: false, internalType: "uint256", name: "nonce", type: "uint256" },
		],
		name: "ERC721OrderCancelled",
		type: "event",
	},
	ERC721OrderFilled: {
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "enum LibNFTOrder.TradeDirection",
				name: "direction",
				type: "uint8",
			},
			{ indexed: false, internalType: "address", name: "maker", type: "address" },
			{ indexed: false, internalType: "address", name: "taker", type: "address" },
			{ indexed: false, internalType: "uint256", name: "nonce", type: "uint256" },
			{
				indexed: false,
				internalType: "contract IERC20TokenV06",
				name: "erc20Token",
				type: "address",
			},
			{ indexed: false, internalType: "uint256", name: "erc20TokenAmount", type: "uint256" },
			{
				indexed: false,
				internalType: "contract IERC721Token",
				name: "erc721Token",
				type: "address",
			},
			{ indexed: false, internalType: "uint256", name: "erc721TokenId", type: "uint256" },
			{ indexed: false, internalType: "address", name: "matcher", type: "address" },
		],
		name: "ERC721OrderFilled",
		type: "event",
	},
	ApprovalWeth: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address",
			},
			{
				indexed: true,
				name: "guy",
				type: "address",
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256",
			},
		],
		name: "Approval",
		type: "event",
	},
	TransferWeth: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address",
			},
			{
				indexed: true,
				name: "dst",
				type: "address",
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256",
			},
		],
		name: "Transfer",
		type: "event",
	},
	DepositWeth: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "dst",
				type: "address",
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256",
			},
		],
		name: "Deposit",
		type: "event",
	},
	WithdrawalWeth: {
		anonymous: false,
		inputs: [
			{
				indexed: true,
				name: "src",
				type: "address",
			},
			{
				indexed: false,
				name: "wad",
				type: "uint256",
			},
		],
		name: "Withdrawal",
		type: "event",
	},
	BalanceWeth: {
		constant: true,
		inputs: [
			{
				name: "",
				type: "address",
			},
		],
		name: "balanceOf",
		outputs: [
			{
				name: "",
				type: "uint256",
			},
		],
		payable: false,
		stateMutability: "view",
		type: "function",
	},
	PolygonBalanceWeth: {
		inputs: [
			{
				internalType: "address",
				name: "account",
				type: "address",
			},
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
};
