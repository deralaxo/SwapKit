import type { StdFee } from '@cosmjs/amino';
import { base64 } from '@scure/base';
import type { ChainId } from '@thorswap-lib/types';

import type { CosmosSDKClientParams, TransferParams } from './types.ts';
import { getDenom, getRPC } from './util.ts';

const DEFAULT_COSMOS_FEE_MAINNET = {
  amount: [{ denom: 'uatom', amount: '500' }],
  gas: '200000',
};

export class CosmosClient {
  server: string;
  chainId: ChainId;
  prefix = '';
  rpcUrl;

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos', stagenet = false }: CosmosSDKClientParams) {
    this.rpcUrl = getRPC(chainId, stagenet);
    this.server = server;
    this.chainId = chainId;
    this.prefix = prefix;
  }

  getAddressFromMnemonic = async (mnemonic: string, derivationPath: string) => {
    const wallet = await this.#getWallet(mnemonic, derivationPath);
    const [{ address }] = await wallet.getAccounts();
    return address;
  };

  getPubKeyFromMnemonic = async (mnemonic: string, derivationPath: string) => {
    const wallet = await this.#getWallet(mnemonic, derivationPath);

    return base64.encode((await wallet.getAccounts())[0].pubkey);
  };

  checkAddress = async (address: string) => {
    if (!address.startsWith(this.prefix)) return false;

    try {
      const { normalizeBech32 } = await import('@cosmjs/encoding');
      return normalizeBech32(address) === address.toLocaleLowerCase();
    } catch (err) {
      return false;
    }
  };

  getBalance = async (address: string) => {
    const client = await this.#getClient();

    const allBalances = (await client.getAllBalances(address)) as unknown as {
      denom: string;
      amount: string;
    }[];

    return allBalances.map((balance) => ({
      ...balance,
      denom: balance.denom.includes('/') ? balance.denom.toUpperCase() : balance.denom,
    }));
  };

  getAccount = async (address: string) => {
    const client = await this.#getClient();
    return client.getAccount(address);
  };

  transfer = async ({
    from,
    recipient,
    assetValue,
    memo = '',
    fee = DEFAULT_COSMOS_FEE_MAINNET,
    signer,
  }: TransferParams) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const { SigningStargateClient } = await import('@cosmjs/stargate');
    const signingClient = await SigningStargateClient.connectWithSigner(this.rpcUrl, signer);
    const txResponse = await signingClient.sendTokens(
      from,
      recipient,
      [{ denom: getDenom(`u${assetValue.symbol}`).toLowerCase(), amount: assetValue.baseValue }],
      fee as StdFee,
      memo,
    );

    return txResponse.transactionHash;
  };

  #getClient = async () => {
    const { StargateClient } = await import('@cosmjs/stargate');
    return await StargateClient.connect(this.rpcUrl);
  };

  #getWallet = async (mnemonic: string, derivationPath: string) => {
    const { Secp256k1HdWallet } = await import('@cosmjs/amino');
    const { stringToPath } = await import('@cosmjs/crypto');

    return await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: this.prefix,
      hdPaths: [stringToPath(derivationPath)],
    });
  };
}
