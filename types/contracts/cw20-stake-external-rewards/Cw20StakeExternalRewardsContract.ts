/**
* This file was automatically generated by cosmwasm-typescript-gen@0.3.6.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the cosmwasm-typescript-gen generate command to regenerate this file.
*/

import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
export type ExecuteMsg = {
  stake_change_hook: StakeChangedHookMsg;
} | {
  claim: {
    [k: string]: unknown;
  };
} | {
  receive: Cw20ReceiveMsg;
} | {
  fund: {
    [k: string]: unknown;
  };
} | {
  update_reward_duration: {
    new_duration: number;
    [k: string]: unknown;
  };
} | {
  update_owner: {
    new_owner?: string | null;
    [k: string]: unknown;
  };
} | {
  update_manager: {
    new_manager?: string | null;
    [k: string]: unknown;
  };
};
export type StakeChangedHookMsg = {
  stake: {
    addr: Addr;
    amount: Uint128;
    [k: string]: unknown;
  };
} | {
  unstake: {
    addr: Addr;
    amount: Uint128;
    [k: string]: unknown;
  };
};
export type Addr = string;
export type Uint128 = string;
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
  [k: string]: unknown;
}
export type Denom = {
  native: string;
} | {
  cw20: Addr;
};
export interface GetPendingRewardsResponse {
  address: string;
  denom: Denom;
  last_update_block: number;
  pending_rewards: Uint128;
  [k: string]: unknown;
}
export interface InfoResponse {
  config: Config;
  reward: RewardConfig;
  [k: string]: unknown;
}
export interface Config {
  manager?: Addr | null;
  owner?: Addr | null;
  reward_token: Denom;
  staking_contract: Addr;
  [k: string]: unknown;
}
export interface RewardConfig {
  period_finish: number;
  reward_duration: number;
  reward_rate: Uint128;
  [k: string]: unknown;
}
export interface InstantiateMsg {
  manager?: string | null;
  owner?: string | null;
  reward_duration: number;
  reward_token: Denom;
  staking_contract: string;
  [k: string]: unknown;
}
export interface PendingRewardsResponse {
  address: string;
  denom: Denom;
  last_update_block: number;
  pending_rewards: Uint128;
  [k: string]: unknown;
}
export type QueryMsg = {
  info: {
    [k: string]: unknown;
  };
} | {
  get_pending_rewards: {
    address: string;
    [k: string]: unknown;
  };
};
export interface Cw20StakeExternalRewardsReadOnlyInterface {
  contractAddress: string;
  info: () => Promise<InfoResponse>;
  getPendingRewards: ({
    address
  }: {
    address: string;
  }) => Promise<GetPendingRewardsResponse>;
}
export class Cw20StakeExternalRewardsQueryClient implements Cw20StakeExternalRewardsReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.info = this.info.bind(this);
    this.getPendingRewards = this.getPendingRewards.bind(this);
  }

  info = async (): Promise<InfoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      info: {}
    });
  };
  getPendingRewards = async ({
    address
  }: {
    address: string;
  }): Promise<GetPendingRewardsResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      get_pending_rewards: {
        address
      }
    });
  };
}
export interface Cw20StakeExternalRewardsInterface extends Cw20StakeExternalRewardsReadOnlyInterface {
  contractAddress: string;
  sender: string;
  stakeChangeHook: (fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  claim: (fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: string;
    msg: string;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  fund: (fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  updateRewardDuration: ({
    newDuration
  }: {
    newDuration: number;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  updateOwner: ({
    newOwner
  }: {
    newOwner?: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  updateManager: ({
    newManager
  }: {
    newManager?: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
}
export class Cw20StakeExternalRewardsClient extends Cw20StakeExternalRewardsQueryClient implements Cw20StakeExternalRewardsInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.stakeChangeHook = this.stakeChangeHook.bind(this);
    this.claim = this.claim.bind(this);
    this.receive = this.receive.bind(this);
    this.fund = this.fund.bind(this);
    this.updateRewardDuration = this.updateRewardDuration.bind(this);
    this.updateOwner = this.updateOwner.bind(this);
    this.updateManager = this.updateManager.bind(this);
  }

  stakeChangeHook = async (fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      stake_change_hook: {}
    }, fee, memo, funds);
  };
  claim = async (fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      claim: {}
    }, fee, memo, funds);
  };
  receive = async ({
    amount,
    msg,
    sender
  }: {
    amount: string;
    msg: string;
    sender: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      receive: {
        amount,
        msg,
        sender
      }
    }, fee, memo, funds);
  };
  fund = async (fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      fund: {}
    }, fee, memo, funds);
  };
  updateRewardDuration = async ({
    newDuration
  }: {
    newDuration: number;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_reward_duration: {
        new_duration: newDuration
      }
    }, fee, memo, funds);
  };
  updateOwner = async ({
    newOwner
  }: {
    newOwner?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_owner: {
        new_owner: newOwner
      }
    }, fee, memo, funds);
  };
  updateManager = async ({
    newManager
  }: {
    newManager?: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_manager: {
        new_manager: newManager
      }
    }, fee, memo, funds);
  };
}