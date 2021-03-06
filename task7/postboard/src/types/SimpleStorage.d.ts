/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export interface SimpleStorage extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): SimpleStorage;
  clone(): SimpleStorage;
  methods: {
    posts(
      arg0: number | string | BN
    ): NonPayableTransactionObject<{
      uuid: string;
      content: string;
      title: string;
      0: string;
      1: string;
      2: string;
    }>;

    postsEndTime(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    /**
     * methods
     */
    createPost(
      _endTime: number | string | BN,
      _content: string,
      _title: string
    ): NonPayableTransactionObject<void>;

    getEndTimeArray(): NonPayableTransactionObject<string[]>;

    readPostCount(): NonPayableTransactionObject<string>;

    setGreet(_greet: string): NonPayableTransactionObject<void>;

    getGreet(): NonPayableTransactionObject<string>;
  };
  events: {
    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };
}
