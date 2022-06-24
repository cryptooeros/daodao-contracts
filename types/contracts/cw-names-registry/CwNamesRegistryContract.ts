/**
* This file was automatically generated by cosmwasm-typescript-gen@0.3.4.
* DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
* and run the cosmwasm-typescript-gen generate command to regenerate this file.
*/

import { CosmWasmClient, ExecuteResult, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Coin, StdFee } from "@cosmjs/amino";
export type Addr = string;
export type PaymentInfo = {
  native_payment: {
    payment_amount: Uint128;
    token_denom: string;
    [k: string]: unknown;
  };
} | {
  cw20_payment: {
    payment_amount: Uint128;
    token_address: string;
    [k: string]: unknown;
  };
};
export type Uint128 = string;
export interface ConfigResponse {
  admin: Addr;
  payment_info: PaymentInfo;
  [k: string]: unknown;
}
export type ExecuteMsg = {
  receive: Cw20ReceiveMsg;
} | {
  register_name: {
    name: string;
    [k: string]: unknown;
  };
} | {
  update_config: {
    new_admin?: string | null;
    new_payment_info?: PaymentInfo | null;
    [k: string]: unknown;
  };
} | {
  reserve: {
    name: string;
    [k: string]: unknown;
  };
} | {
  transfer_reservation: {
    dao: string;
    name: string;
    [k: string]: unknown;
  };
} | {
  revoke: {
    name: string;
    [k: string]: unknown;
  };
};
export type Binary = string;
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
  [k: string]: unknown;
}
export interface InstantiateMsg {
  admin: string;
  payment_info: PaymentInfo;
  [k: string]: unknown;
}
export interface IsNameAvailableToRegisterResponse {
  reserved: boolean;
  taken: boolean;
  [k: string]: unknown;
}
export interface LookUpDaoByNameResponse {
  dao?: Addr | null;
  [k: string]: unknown;
}
export interface LookUpNameByDaoResponse {
  name?: string | null;
  [k: string]: unknown;
}
export type QueryMsg = {
  config: {
    [k: string]: unknown;
  };
} | {
  look_up_name_by_dao: {
    dao: string;
    [k: string]: unknown;
  };
} | {
  look_up_dao_by_name: {
    name: string;
    [k: string]: unknown;
  };
} | {
  is_name_available_to_register: {
    name: string;
    [k: string]: unknown;
  };
};
export interface CwNamesRegistryReadOnlyInterface {
  contractAddress: string;
  config: () => Promise<ConfigResponse>;
  lookUpNameByDao: ({
    dao
  }: {
    dao: string;
  }) => Promise<LookUpNameByDaoResponse>;
  lookUpDaoByName: ({
    name
  }: {
    name: string;
  }) => Promise<LookUpDaoByNameResponse>;
  isNameAvailableToRegister: ({
    name
  }: {
    name: string;
  }) => Promise<IsNameAvailableToRegisterResponse>;
}
export class CwNamesRegistryQueryClient implements CwNamesRegistryReadOnlyInterface {
  client: CosmWasmClient;
  contractAddress: string;

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client;
    this.contractAddress = contractAddress;
    this.config = this.config.bind(this);
    this.lookUpNameByDao = this.lookUpNameByDao.bind(this);
    this.lookUpDaoByName = this.lookUpDaoByName.bind(this);
    this.isNameAvailableToRegister = this.isNameAvailableToRegister.bind(this);
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {}
    });
  };
  lookUpNameByDao = async ({
    dao
  }: {
    dao: string;
  }): Promise<LookUpNameByDaoResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      look_up_name_by_dao: {
        dao
      }
    });
  };
  lookUpDaoByName = async ({
    name
  }: {
    name: string;
  }): Promise<LookUpDaoByNameResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      look_up_dao_by_name: {
        name
      }
    });
  };
  isNameAvailableToRegister = async ({
    name
  }: {
    name: string;
  }): Promise<IsNameAvailableToRegisterResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      is_name_available_to_register: {
        name
      }
    });
  };
}
export interface CwNamesRegistryInterface extends CwNamesRegistryReadOnlyInterface {
  contractAddress: string;
  sender: string;
  receive: ({
    amount,
    msg,
    sender
  }: {
    amount: string;
    msg: string;
    sender: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  registerName: ({
    name
  }: {
    name: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  updateConfig: ({
    newAdmin,
    newPaymentInfo
  }: {
    newAdmin?: string;
    newPaymentInfo?: PaymentInfo;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  reserve: ({
    name
  }: {
    name: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  transferReservation: ({
    dao,
    name
  }: {
    dao: string;
    name: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
  revoke: ({
    name
  }: {
    name: string;
  }, fee?: number | StdFee | "auto", memo?: string, funds?: readonly Coin[]) => Promise<ExecuteResult>;
}
export class CwNamesRegistryClient extends CwNamesRegistryQueryClient implements CwNamesRegistryInterface {
  client: SigningCosmWasmClient;
  sender: string;
  contractAddress: string;

  constructor(client: SigningCosmWasmClient, sender: string, contractAddress: string) {
    super(client, contractAddress);
    this.client = client;
    this.sender = sender;
    this.contractAddress = contractAddress;
    this.receive = this.receive.bind(this);
    this.registerName = this.registerName.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.reserve = this.reserve.bind(this);
    this.transferReservation = this.transferReservation.bind(this);
    this.revoke = this.revoke.bind(this);
  }

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
  registerName = async ({
    name
  }: {
    name: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      register_name: {
        name
      }
    }, fee, memo, funds);
  };
  updateConfig = async ({
    newAdmin,
    newPaymentInfo
  }: {
    newAdmin?: string;
    newPaymentInfo?: PaymentInfo;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      update_config: {
        new_admin: newAdmin,
        new_payment_info: newPaymentInfo
      }
    }, fee, memo, funds);
  };
  reserve = async ({
    name
  }: {
    name: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      reserve: {
        name
      }
    }, fee, memo, funds);
  };
  transferReservation = async ({
    dao,
    name
  }: {
    dao: string;
    name: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      transfer_reservation: {
        dao,
        name
      }
    }, fee, memo, funds);
  };
  revoke = async ({
    name
  }: {
    name: string;
  }, fee: number | StdFee | "auto" = "auto", memo?: string, funds?: readonly Coin[]): Promise<ExecuteResult> => {
    return await this.client.execute(this.sender, this.contractAddress, {
      revoke: {
        name
      }
    }, fee, memo, funds);
  };
}