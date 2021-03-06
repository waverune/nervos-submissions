/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */



import React, { FormEvent, FormEventHandler, useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { CopyToClipboard } from "react-copy-to-clipboard";


import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { PostBoardWrapper } from '../lib/contracts/PostBoardWrapper';
import { CONFIG } from '../config';
import * as CompiledContractArtifact from '../../build/contracts/ERC20.json';
import { CKETH_CONTRACT_ADDRESS, SUDT_CONTRACT_ADDRESS, SudtId } from '../config';



interface Post {
    id: number;
    content: string;
    title:string;
    
}

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        // provider rider
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };
        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();

    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<PostBoardWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [balance, setBalance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [storedValue, setStoredValue] = useState<number | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = useState<
        number | undefined
    >();
    const [content, setContent] = useState<string | undefined>("default content");
    const [title, setTitle] = useState<string | undefined>("default title");
    const [postCount, setPostCount] = useState<number | undefined>()
    const [posts,setPosts] = useState<Post[]>([])
    const [value, setValue] = useState("My copy text");
    const [copied, setCopied] = useState(false);
    const [ckethBalance, setCkethBalance] = useState<string>();
    const [sudtBalance, setSudtBalance] = useState<string>();
    const [l2Balance, setL2Balance] = useState<bigint>();

    const [L2depositAddress, setL2depositAddress] = useState<string | undefined>(""); // tryna sset L2depositAddres t8

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = await new PostBoardWrapper(web3);

        try {
            setTransactionInProgress(true);

            await _contract.deploy(account);
            setContract(_contract)
            setExistingContractAddress(_contract.address);


            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast('There was an error sending your transaction. Please check developer console.');
        } finally {
            setTimeout(()=>{console.log("deploy wait 1 sec"); getPC();console.log(_contract)},2000);



            setTransactionInProgress(false);
        }
    }

    async function getStoredValue() {
        // const value = await contract.getStoredValue(account);
        toast('Successfully read latest stored value.', { type: 'success' });

        // setStoredValue(value);
    }

    async function getPosts() {
        try {
            for (let step =0; step<postCount;step++){
            const {content,title} = await contract.readPost(step, account);
            setPosts(prevState => ([...prevState,{id:step,content:content,title:title}]))  // frontend renderei
            }


        } catch (error) {
            console.log(error)
        }finally{

            toast('loaded the first post', { type: 'success' });
        }

    };

    function addtest () {
        setPosts(prevState =>([...prevState,{id:3,content:"new",title:"new"}])) // id:3 ???
    }

    async function getPC (){
        try {
            const postCount = await contract.readPostCount(account)
            console.log(">>>>>>>>>pc");

            console.log(postCount);
            setPostCount(Number(postCount));


        } catch (error) {
            console.log(error)
        }

    }

    async function setExistingContractAddress(contractAddress: string) {
        try {
            const _contract = new PostBoardWrapper(web3);
            _contract.useDeployed(contractAddress.trim());
            console.log(_contract)

        await setContract(_contract);
            
        } catch (error) {
            console.log(error)
        }
        finally{
            setTimeout(()=>{getPC()},2000)

        }
    
    }

    async function setNewStoredValue() {

        try {
            setTransactionInProgress(true);
            // await contract.setStoredValue(newStoredNumberInputValue, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast('There was an error sending your transaction. Please check developer console.');
        } finally {
            // getPosts();
            setTransactionInProgress(false);
        }
    }

    async function setNewContent(e:FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setTimeout(()=>{console.log("wait 2 sec");},2000)
            setTransactionInProgress(true);
            // @dev hard coded endTime
            console.log("set new content called")

            await contract.createPost(100, content, title, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
                { type: 'success' }
            );
            setPostCount(prevstate => prevstate+1)
        } catch (error) {
            console.error(error);
            toast('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            //getPosts();
            setTransactionInProgress(false)
        }
    }

    async function ssetL2depositAddress(){
        const addressTranslator = new AddressTranslator();
        const L2depositAddress =  addressTranslator.getLayer2DepositAddress(web3, accounts?.[0]); // t8
        console.log((await L2depositAddress).addressString);


    }


    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setBalance(_l2Balance);
            }
        })();
    });

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
            (async ()=>{
                const l2DepositAdd = await addressTranslator.getLayer2DepositAddress(web3, accounts?.[0])
                console.log(l2DepositAdd.addressString)
                setL2depositAddress(l2DepositAdd.addressString); // t8
                
            })()
            // ssetL2depositAddress();
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    // useEffect(() => {
    //     if (accounts?.[0]) {
    //         const addressTranslator = new AddressTranslator();
    //         setL2depositAddress(addressTranslator.getLayer2DepositAddress(web3, accounts?.[0]));
    //         //ssetL2depositAddress();

    //     } else {
    //         setL2depositAddress(undefined);
    //     }
    // }, [accounts?.[0]]);
    const modifyCketh = (number: string, ndecimals: number) => {
        if (number.length > ndecimals) {
            return `${number.substring(0, number.length - ndecimals)}.${number
                .substring(number.length - ndecimals)
                .replace(/0+/, '')}`;
        }
        const nzeros = ndecimals - number.length;
        const newnumber = `0.${String('0').repeat(nzeros)}${number.replace(/0+/, '')}`;
        return newnumber;
    };

    const changeCkethBalance = async () => {
        const _contractCketh = new web3.eth.Contract(
            CompiledContractArtifact.abi as any,
            CKETH_CONTRACT_ADDRESS
        );

        const _balanceCketh = await _contractCketh.methods.balanceOf(polyjuiceAddress).call({
            from: accounts?.[0]
        });

        setCkethBalance(_balanceCketh);
    };

    const changeCkbBalance = async () => {
        const _l2Balance = BigInt(await web3.eth.getBalance(accounts?.[0]));
        setL2Balance(_l2Balance);
    };

    const changeSudtBalance = async () => {
        const _contractSudt = new web3.eth.Contract(
            CompiledContractArtifact.abi as any,
            SUDT_CONTRACT_ADDRESS
        );

        const _balanceSudt = await _contractSudt.methods.balanceOf(polyjuiceAddress).call({
            from: accounts?.[0]
        });

        setSudtBalance(_balanceSudt);
    };
    const refreshAllUserBalances = async () => {
        setCkethBalance(undefined);
        setSudtBalance(undefined);
        setL2Balance(undefined);
        await changeCkethBalance();
        await changeSudtBalance();
        await changeCkbBalance();
    };



    const LoadingIndicator = () => <span className="rotating-icon">??????</span>;

    return (
        <div className = "mainContainer">
           <div className = "midBody">Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            L2Balance: <b>{balance ? (balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br/>
            Your Polyjuice address: {polyjuiceAddress}
            <br />
            <p style={{overflowWrap: "break-word"}}>
            Your L2deposit Address: {L2depositAddress}
            </p>
            <CopyToClipboard
                options={{  message: "" }}
                text={L2depositAddress}
                onCopy={() => setCopied(true)}
            >
                <button onClick={()=>{window.open("https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000")}}>Copy to L2 Deposit Address to clipboard</button>
            </CopyToClipboard>
            <br />
            Deployed contract address: <b>{contract?.address || ' '}</b> <br />
            <br />

            ckEth balance:{' '}
            <b>
                {ckethBalance ? modifyCketh(ckethBalance.toString(), 18) : <LoadingIndicator />}{' '}
                ckETH
            </b>
            <br />
            <br />
            <br />
            SUDT balance: <b>{sudtBalance ? (sudtBalance as string) : <LoadingIndicator />}</b>
            <br />
            Sudt Id:  <b>{SudtId}</b>
            <br />
            <button onClick={refreshAllUserBalances} style={{ marginLeft: '40%' }}>
                {' '}
                Refresh Balance
            </button>
            <div className="rectangle"> </div>
            <br/>
            </div>
            <div>
                <button className = "deployContract" onClick={deployContract} disabled={!balance}>
                    Deploy contract
                </button>
                &nbsp;or&nbsp;
                <input
                    placeholder="Existing contract id"
                    onChange={e => setExistingContractIdInputValue(e.target.value)}
                />  

                &nbsp;

                <button
                    disabled={!existingContractIdInputValue || !balance}
                    onClick={() => setExistingContractAddress(existingContractIdInputValue)}
                >
                    Use existing contract
                </button>
                <br />
                <button onClick={getPosts} disabled={!contract}>
                    Get Posts
                </button>
            </div>

            <br />
        
            <form className="form" onSubmit={setNewContent}>
                <label>
                    Title: &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;
                    <input placeholder="Title" type="text" onChange={e => setTitle(e.target.value)} />
                </label>
                <br/>
                <br/>
                <label>
                    Content: &nbsp;
                    <input
                      placeholder="Content"
                      type="text" onChange={e => setContent(e.target.value)} />
                </label>
                <br/>

                <button type ="submit"  disabled={!contract}>
                    Set new post
                </button>
            </form>
            
       
            <br/>
            <div className="rectangle"> </div>
            <ol className="post-list">

                {/* <button onClick={addtest}>press this</button> */}
            {posts ? posts.map((post)=>{
                return(
                <li className="list-item" key={post.id}>
                    <p><b>Title</b>&nbsp;{post.title}</p>
                    <p><b>Content</b>&nbsp;{post.content}</p>
                </li>)
            }):<></>}
            </ol>
            <ToastContainer />
        </div>
    );
}


