import { TxConfigValueTypeToString } from '@polyjuice-provider/web3';
import { CLIENT_RENEG_LIMIT } from 'tls';
import Web3 from 'web3';
import * as PostBoardJSON from '../../../build/contracts/PostBoard.json';
import { PostBoard } from '../../types/PostBoard';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class PostBoardWrapper {
    web3: Web3;
    contract: PostBoard;
    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(PostBoardJSON.abi as any) as any;

        console.log(this.contract);
    }

    async createPost(endTime: number, content: string, title: string, fromAddress: string) {
        try {
            setTimeout(()=>{console.log("create post is called, hold 5 sec to fetch"),5000})
            const tx = await this.contract.methods.createPost(endTime, content, title).send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress
            });
            console.log(tx);
            return tx;

        } catch (error) {
            console.log(error)
        }finally{
            return null;
        }
    }

    async readPost(tc: number, fromAddress: string) {
        try {
            const _post = await this.contract.methods.posts(tc).call({ from: fromAddress });
            console.log(_post);

            return _post;
        } catch (e) {
            console.log(Error, e);
        } finally {
            console.log('tried to read post');
        }
    }

    async readPostCount(fromAddress: string) {
        try {
            const tc = await this.contract.methods.readPostCount().call({ from: fromAddress });
            return tc;
        } catch (e) {
            console.log(Error,e);
        }
    }

    // deploy methods


    get isDeployed() {
        return Boolean(this.address);
    }

    async deploy(fromAddress: string) {
        const contract = await (this.contract
            .deploy({
                data: PostBoardJSON.bytecode,
                arguments: ['init-greet']
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(contract.contractAddress);
        console.log(">>>>>>>>>");
        
        console.log(contract);

            //console.log(this.web3.eth.getTransactionReceipt);

        //web3.eth.getTransactionReceipt(txHash)
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }

    // async getStoredValue(fromAddress: string) {
    //     const data = await this.contract.methods.get().call({ from: fromAddress });

    //     return parseInt(data, 10);
    // }

    // async setStoredValue(value: number, fromAddress: string) {
    //     const tx = await this.contract.methods.set(value).send({
    //         ...DEFAULT_SEND_OPTIONS,
    //         from: fromAddress
    //     });

    //     return tx;
    // }

}
