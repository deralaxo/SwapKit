import { AssetValue } from '@swapkit/helpers';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, FeeOption, RPCUrl } from '@swapkit/types';
import type { BrowserProvider, JsonRpcProvider, Provider, Signer } from 'ethers';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import { getProvider } from '../provider.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (api: CovalentApiType, address: string) => {
  const provider = getProvider(Chain.Arbitrum);
  const tokenBalances = await api.getBalance(address);

  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    new AssetValue({
      chain: Chain.Arbitrum,
      symbol: Chain.Arbitrum,
      value: evmGasTokenBalance.toString(),
      decimal: BaseDecimal.ARB,
    }),
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.ArbitrumHex,
  chainName: 'Arbitrum One',
  nativeCurrency: { name: 'Ethereum', symbol: Chain.Ethereum, decimals: BaseDecimal.ETH },
  rpcUrls: [RPCUrl.Arbitrum],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Arbitrum]],
});

const estimateGasPrices = async (provider: Provider) => {
  try {
    const { gasPrice } = await provider.getFeeData();

    if (!gasPrice) throw new Error('No fee data available');

    return {
      [FeeOption.Average]: { gasPrice },
      [FeeOption.Fast]: { gasPrice },
      [FeeOption.Fastest]: { gasPrice },
    };
  } catch (error) {
    throw new Error(
      `Failed to estimate gas price: ${(error as any).msg ?? (error as any).toString()}`,
    );
  }
};

export const ARBToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const arbApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Arbitrum });
  const baseToolbox = BaseEVMToolbox({ provider, signer, isEIP1559Compatible: false });

  return {
    ...baseToolbox,
    getNetworkParams,
    estimateGasPrices: () => estimateGasPrices(provider),
    getBalance: (address: string) => getBalance(arbApi, address),
  };
};
