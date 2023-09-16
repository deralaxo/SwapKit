import type { MultisigThresholdPubkey, Pubkey, Secp256k1HdWallet } from '@cosmjs/amino';
import type { OfflineDirectSigner, Registry } from '@cosmjs/proto-signing';
import type { Account as CosmosAccount, AminoTypes } from '@cosmjs/stargate';
import type { AssetValue } from '@thorswap-lib/swapkit-helpers';
import type { Asset, ChainId, Fees } from '@thorswap-lib/types';
import type { curve } from 'elliptic';

import type { BNBTransaction } from '../../binanceUtils/transaction.ts';
import type { Account } from '../../index.ts';
import type { Signer, TransferParams } from '../../types.ts';

enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

type Tx = {
  asset: Asset; // asset
  from: { from: string }[]; // list of "from" txs. BNC will have one `TxFrom` only, `BTC` might have many transactions going "in" (based on UTXO)
  to: { to: string }[]; // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date; // timestamp of tx
  type: TxType; // type
  hash: string; // Tx hash
};

export type NodeUrl = {
  node: string;
  rpc: string;
};

export type DepositParam = {
  signer?: OfflineDirectSigner;
  walletIndex?: number;
  assetValue: AssetValue;
  memo: string;
};

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>;

/**
 * Response from `thorchain/constants` endpoint
 */
export type ThorchainConstantsResponse = {
  int_64_values: {
    // We are in fee interested only - ignore all other values
    NativeTransactionFee: number;
  };
};

/**
 * Response of `/cosmos/base/tendermint/v1beta1/node_info`
 * Note: We are interested in `network` (aka chain id) only
 */
export type NodeInfoResponse = {
  default_node_info: {
    network: string;
  };
};

export type BaseCosmosToolboxType = {
  getAccount: (address: string) => Promise<CosmosAccount | null>;
  getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
  getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
  validateAddress: (address: string) => Promise<boolean>;
  getAddressFromMnemonic: (phrase: string) => Promise<string>;
  getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  getBalance: (address: string) => Promise<AssetValue[]>;
  transfer: (params: TransferParams) => Promise<string>;
  getFeeRateFromThorswap?: (chainId: ChainId) => Promise<number | undefined>;
};

export type CommonCosmosToolboxType = {
  getFees: () => Promise<Fees>;
};

export type ThorchainToolboxType = BaseCosmosToolboxType &
  CommonCosmosToolboxType & {
    deposit: (params: DepositParam & { from: string }) => Promise<string>;
    createDefaultRegistry: () => Promise<Registry>;
    createDefaultAminoTypes: () => Promise<AminoTypes>;
    createMultisig: (pubKeys: string[], threshold: number) => Promise<MultisigThresholdPubkey>;
    importSignature: (signature: string) => Uint8Array;
    secp256k1HdWalletFromMnemonic: (
      mnemonic: string,
      path?: string,
      isStagenet?: boolean,
    ) => Promise<Secp256k1HdWallet>;
    signMultisigTx: (
      wallet: Secp256k1HdWallet,
      tx: string,
    ) => Promise<{ signature: string; bodyBytes: Uint8Array }>;
    broadcastMultisigTx: (
      tx: string,
      signers: Signer[],
      threshold: number,
      bodyBytes: Uint8Array,
      isStagenet?: boolean,
    ) => Promise<string>;
    pubkeyToAddress: (pubkey: Pubkey, prefix: string) => Promise<string>;
    loadAddressBalances: (address: string) => Promise<AssetValue[]>;
  };

export type GaiaToolboxType = BaseCosmosToolboxType & CommonCosmosToolboxType;

export type BinanceToolboxType = Omit<BaseCosmosToolboxType, 'getAccount'> &
  CommonCosmosToolboxType & {
    createKeyPair: (phrase: string) => Promise<Uint8Array>;
    transfer: (params: TransferParams) => Promise<string>;
    getAccount: (address: string) => Promise<Account>;
    sendRawTransaction: (signedBz: string, sync: boolean) => Promise<any>;
    createTransactionAndSignMsg: (params: TransferParams) => Promise<{
      transaction: BNBTransaction;
      signMsg: {
        inputs: {
          address: string;
          coins: {
            amount: number;
            denom: string;
          }[];
        }[];
        outputs: {
          address: string;
          coins: {
            amount: number;
            denom: string;
          }[];
        }[];
      };
    }>;
    getPublicKey: (publicKey: string) => curve.base.BasePoint;
  };
