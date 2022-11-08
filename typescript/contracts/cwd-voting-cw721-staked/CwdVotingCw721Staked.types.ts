/**
* This file was automatically generated by @cosmwasm/ts-codegen@0.19.0.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the @cosmwasm/ts-codegen generate command to regenerate this file.
*/

export type Admin = {
  address: {
    addr: string;
  };
} | {
  core_module: {};
};
export type Duration = {
  height: number;
} | {
  time: number;
};
export interface InstantiateMsg {
  manager?: string | null;
  nft_address: string;
  owner?: Admin | null;
  unstaking_duration?: Duration | null;
}
export type ExecuteMsg = {
  receive_nft: Cw721ReceiveMsg;
} | {
  unstake: {
    token_ids: string[];
  };
} | {
  claim_nfts: {};
} | {
  update_config: {
    duration?: Duration | null;
    manager?: string | null;
    owner?: string | null;
  };
} | {
  add_hook: {
    addr: string;
  };
} | {
  remove_hook: {
    addr: string;
  };
};
export type Binary = string;
export interface Cw721ReceiveMsg {
  msg: Binary;
  sender: string;
  token_id: string;
}
export type QueryMsg = {
  staked_balance_at_height: {
    address: string;
    height?: number | null;
  };
} | {
  total_staked_at_height: {
    height?: number | null;
  };
} | {
  get_config: {};
} | {
  nft_claims: {
    address: string;
  };
} | {
  get_hooks: {};
} | {
  list_stakers: {
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  staked_nfts: {
    address: string;
    limit?: number | null;
    start_after?: string | null;
  };
} | {
  voting_power_at_height: {
    address: string;
    height?: number | null;
  };
} | {
  total_power_at_height: {
    height?: number | null;
  };
} | {
  info: {};
};
export interface MigrateMsg {}
export type Addr = string;
export interface Config {
  manager?: Addr | null;
  nft_address: Addr;
  owner?: Addr | null;
  unstaking_duration?: Duration | null;
}
export interface GetHooksResponse {
  hooks: string[];
}
export interface InfoResponse {
  info: ContractVersion;
}
export interface ContractVersion {
  contract: string;
  version: string;
}
export type ArrayOfAddr = Addr[];
export type Expiration = {
  at_height: number;
} | {
  at_time: Timestamp;
} | {
  never: {};
};
export type Timestamp = Uint64;
export type Uint64 = string;
export interface NftClaimsResponse {
  nft_claims: NftClaim[];
}
export interface NftClaim {
  release_at: Expiration;
  token_id: string;
}
export type Uint128 = string;
export interface StakedBalanceAtHeightResponse {
  balance: Uint128;
  height: number;
}
export type ArrayOfString = string[];
export interface TotalPowerAtHeightResponse {
  height: number;
  power: Uint128;
}
export interface TotalStakedAtHeightResponse {
  height: number;
  total: Uint128;
}
export interface VotingPowerAtHeightResponse {
  height: number;
  power: Uint128;
}