import type { AssetValue } from '@thorswap-lib/swapkit-helpers';
import type { FeeOption, UTXOChain } from '@thorswap-lib/types';
import type { Psbt } from 'bitcoinjs-lib';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '../index.ts';
import type { UTXOScriptType } from '../utils/index.ts';

export type TransactionType = {
  toHex(): string;
};

export type TargetOutput =
  | { address: string; value: number; script?: Buffer }
  | { script: Buffer; value: number };

export type TransactionBuilderType = {
  inputs: any[];
  sign(
    vin: number,
    keyPair: { getAddress: (index?: number) => string },
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void;
  build(): TransactionType;
};

export type Witness = {
  value: number;
  script: Buffer;
};

export type UTXOBaseToolboxParams = {
  apiClient: BlockchairApiType;
  chain: UTXOChain;
};

export type UTXOToolbox = ReturnType<
  typeof BTCToolbox | typeof BCHToolbox | typeof DOGEToolbox | typeof LTCToolbox
>;

export type UTXOType = {
  hash: string;
  index: number;
  value: number;
  txHex?: string;
  witnessUtxo?: Witness;
};

export type UTXOInputWithScriptType = UTXOType & { type: UTXOScriptType; address: string };

export type UTXOCalculateTxSizeParams = {
  inputs: (UTXOInputWithScriptType | UTXOType)[];
  outputs?: TargetOutput[];
  feeRate: number;
};

export type UTXOBuildTxParams = {
  assetValue: AssetValue;
  recipient: string;
  memo?: string;
  feeRate: number;
  sender: string;
  fetchTxHex?: boolean;
  apiClient: BlockchairApiType;
  chain: UTXOChain;
};

export type UTXOTransferParams = {
  apiClient: BlockchairApiType;
  broadcastTx: (txHex: string) => Promise<string>;
  chain: UTXOChain;
  feeOptionKey?: FeeOption;
  feeRate?: number;
  from: string;
  recipient: string;
  signTransaction: (psbt: Psbt) => Promise<Psbt>;
  assetValue: AssetValue;
};

export type UTXOWalletTransferParams<T, U> = UTXOTransferParams & {
  signTransaction: (params: T) => Promise<U>;
};
