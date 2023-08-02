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
				name: "operator",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "approved",
				type: "bool",
			},
		],
		name: "ApprovalForAll",
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
	ApprovalEthereumWeth: {
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
	ApprovalPolygonWeth: {
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
				name: "spender",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256",
			},
		],
		name: "Approval",
		type: "event",
	},
	TransferEthereumWeth: {
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
	TransferPolygonWeth: {
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
				indexed: false,
				internalType: "uint256",
				name: "value",
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
	AllowanceWeth: {
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
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
	PolygonAllowanceWeth: {
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	OwnerOf: {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
};
