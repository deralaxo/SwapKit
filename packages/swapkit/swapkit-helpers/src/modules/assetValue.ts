import type { Chain } from '@thorswap-lib/types';

import { getAssetType, getCommonAssetInfo, getDecimal, isGasAsset } from '../helpers/asset.ts';

import { BaseSwapKitNumber } from './swapKitNumber.ts';

type AssetValueParams = { decimal: number; value: number | string } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

export class AssetValue extends BaseSwapKitNumber {
  address?: string;
  chain: Chain;
  isSynthetic = false;
  isGasAsset = false;
  symbol: string;
  ticker: string;
  type: ReturnType<typeof getAssetType>;
  value = 0;

  constructor(params: AssetValueParams) {
    super({ decimal: params.decimal, value: params.value });

    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;
    const assetInfo = getAssetInfo(identifier);

    this.type = getAssetType(assetInfo);
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;
  }

  /**
   * Create AssetValue from string
   * @param assetString string in format of `CHAIN.TICKER-ADDRESS`
   * @param value asset amount in number or string
   */
  static async fromIdentifier(assetString: string, value: number | string = 0) {
    const decimal = await getDecimal(getAssetInfo(assetString));
    return new AssetValue({ decimal, value, identifier: assetString });
  }

  static fromIdentifierSync(assetValue: string, value: number | string = 0) {
    // TODO (@Chillios): implement this with @thorswap-lib/tokens
    // Record<tokenIdentifier, TokenResponse>
    const tokens = {} as Record<string, { decimal: number; identifier: string }>;
    const tokenInfo = tokens[assetValue] ?? { decimal: 8, identifier: '' };

    return new AssetValue({ ...tokenInfo, value });
  }

  static fromString(assetString: 'ETH.THOR' | 'ETH.vTHOR' | Chain, value: number | string = 0) {
    return new AssetValue({ value, ...getCommonAssetInfo(assetString) });
  }

  get assetValue() {
    return `${this.value} ${this.ticker}`;
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }
}

const getAssetInfo = (identifier: string) => {
  const [chain, symbol] = identifier.split('.') as [Chain, string];
  const [ticker, address] = symbol.split('-') as [string, string?];

  return {
    chain,
    ticker,
    symbol,
    address,
    isSynthetic: symbol.includes('/'),
    isGasAsset: isGasAsset({ chain, symbol }),
  };
};
