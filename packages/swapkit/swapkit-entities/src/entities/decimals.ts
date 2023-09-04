import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BaseDecimal, Chain, ChainToRPC, erc20ABI, EVMChain } from '@thorswap-lib/types';

import { AssetEntity, isGasAsset } from './asset.js';

export const getProvider = (chain: EVMChain, customUrl?: string) => {
  return new JsonRpcProvider(customUrl || ChainToRPC[chain]);
};

const getEVMAssetDecimal = async ({ symbol, ticker, chain }: AssetEntity) => {
  if (isGasAsset(new AssetEntity(chain, symbol))) return BaseDecimal.ETH;

  const assetAddress = symbol.slice(ticker.length + 1);

  const address = getAddress(assetAddress.toLowerCase());

  const contract = new Contract(address, erc20ABI, getProvider(chain as EVMChain));

  const contractDecimals = await contract.decimals();

  return contractDecimals.toNumber() as number;
};

export const getAssetDecimal = (asset: AssetEntity) => {
  let decimal;
  getEVMAssetDecimal(asset).then((evmDecimal) => {
    switch (asset.L1Chain) {
      case Chain.Ethereum:
      case Chain.Avalanche:
      case Chain.Arbitrum:
      case Chain.Polygon:
      case Chain.Optimism:
      case Chain.BinanceSmartChain:
        decimal = evmDecimal;
      case Chain.Bitcoin:
      case Chain.Litecoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
        decimal = 8;
      case Chain.Cosmos:
        decimal = 6;
      case Chain.Binance:
      case Chain.THORChain:
        decimal = 8;
      default:
        decimal = undefined;
    }
  });
};
