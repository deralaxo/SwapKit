import { derivationPathToString } from '@swapkit/helpers';
import type { DerivationPathArray } from '@swapkit/types';
import { ChainId, NetworkDerivationPath } from '@swapkit/types';
import type { Provider } from 'ethers';

import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.ts';

export class BSCLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.BSC,
    chainId = ChainId.BinanceSmartChain,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.BinanceSmartChain;
    this.chain = 'bsc';
    this.derivationPath =
      typeof derivationPath === 'string' ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new BSCLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
