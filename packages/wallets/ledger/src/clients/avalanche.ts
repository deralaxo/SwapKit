import type { Provider } from '@ethersproject/providers';
import { derivationPathToString } from '@thorswap-lib/swapkit-helpers';
import type { DerivationPathArray } from '@thorswap-lib/types';
import { ChainId, NetworkDerivationPath } from '@thorswap-lib/types';

import { EthereumLikeLedgerInterface } from '../interfaces/EthereumLikeLedgerInterface.ts';

export class AvalancheLedger extends EthereumLikeLedgerInterface {
  constructor({
    provider,
    derivationPath = NetworkDerivationPath.AVAX,
    chainId = ChainId.Avalanche,
  }: {
    provider: Provider;
    derivationPath?: DerivationPathArray | string;
    chainId?: ChainId;
  }) {
    super(provider);

    this.chainId = chainId || ChainId.Avalanche;
    this.chain = 'avax';
    this.derivationPath =
      typeof derivationPath === 'string' ? derivationPath : derivationPathToString(derivationPath);
  }

  connect = (provider: Provider) =>
    new AvalancheLedger({
      provider,
      derivationPath: this.derivationPath,
      chainId: this.chainId,
    });
}
