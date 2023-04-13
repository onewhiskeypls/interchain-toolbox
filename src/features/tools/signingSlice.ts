import { BaseAccount } from "cosmjs-types/cosmos/auth/v1beta1/auth";
import { Secp256k1HdWallet } from "@cosmjs/launchpad";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../../app/store";
import { selectedAccount, AccountType } from "../accounts/accountsSlice";
import { StdSignature } from "@cosmjs/amino";
import { getKeplr } from "../accounts/useKeplr";
import { makeADR36AminoSignDoc } from "../../util/adr36";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import connectionManager from "../connection/connectionManager";
import { fromBase64 } from "@cosmjs/encoding";

class ConsoleError extends Error {}

export interface SigningState {
    signedMsg: SignedMsg;
    output: string;
}

export interface SignedMsg {
    verified?: boolean;
    address?: string;
    signature?: string;
    msg?: string;
}

const initialState: SigningState = {
    signedMsg: {},
    output: "",
};

export const sign =
    (msg: string): AppThunk =>
    (dispatch, getState) => {
        dispatch(
            run(async () => {
                const account = selectedAccount(getState());
                if (!account) throw new Error("No account selected");

                const signDoc = makeADR36AminoSignDoc(account.address, msg);

                let stdSig: StdSignature;

                if (account.type === AccountType.Keplr) {
                    const keplr = await getKeplr();
                    const chainId = getState().connection.config["chainId"];

                    stdSig = await keplr.signArbitrary(
                        chainId,
                        account.address,
                        msg
                    );
                } else if (account.type === AccountType.Basic) {
                    const wallet = await Secp256k1HdWallet.fromMnemonic(
                        account.mnemonic,
                        {
                            prefix: getState().connection.config[
                                "addressPrefix"
                            ],
                        }
                    );

                    stdSig = (await wallet.signAmino(account.address, signDoc))
                        .signature;
                } else {
                    throw new Error("Invalid account type");
                }

                const { signature } = stdSig;
                return {
                    address: account.address,
                    msg,
                    signature,
                } as SignedMsg;
            })
        );
    };

// https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32
// https://github.com/cosmos/cosmos-sdk/blob/main/types/bech32/bech32.go
// https://github.com/cosmos/cosmjs/issues/1053
// (prefix)(optional secondary prefix)(1)(6 alphanumeric)
// separator is "1"
// data is 6 chars alpha numeric excluding 1, b, i, o
// ^(.*?)(pub|valoper|valoperpub|valcons|valconspub)?(1)([02-9ac-hj-np-z]{6,})$
// need to extract and store secondary prefix

export const verify =
    (msg: string, address: string, signature: string): AppThunk =>
    (dispatch, getState) => {
        dispatch(
            run(async () => {
                const conn = await connectionManager.getQueryClient(
                    getState().connection.config
                );
                let account = await conn?.accountQueryService?.Account({
                    address,
                });

                if (account && account?.account?.value) {
                    let baseAccount = BaseAccount.decode(
                        account?.account?.value
                    );

                    if (baseAccount.pubKey) {
                        try {
                            // baseAccount.pubKey.value is in "/cosmos.crypto.secp256k1.PubKey" format, to get to
                            // "tendermint/PubKeySecp256k1" format we just have to trim the first 2 bytes off
                            // the first 2 bytes repesent 0xEB which indicates the secp256k1 curve and the 2nd byte
                            // is the key type which could be either 0x02 or 0x03
                            const tmPubkeyBase =
                                baseAccount.pubKey.value.slice(2);
                            const data = verifyADR36Amino(
                                getState().connection.config["addressPrefix"],
                                address,
                                msg,
                                tmPubkeyBase,
                                fromBase64(signature)
                            );

                            return {
                                verified: data,
                            };
                        } catch (e) {
                            throw e;
                        }
                    }
                }

                return {
                    address: "",
                    msg,
                    signature,
                } as SignedMsg;
            })
        );
    };

const run = createAsyncThunk(
    "signing/run",
    async (command: () => Promise<SignedMsg>): Promise<SignedMsg> => {
        let result: SignedMsg = {};
        try {
            result = await command();
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new ConsoleError(`Invalid JSON: ${e.message}`);
            } else if (e instanceof Error) {
                throw new ConsoleError(`Error: ${e.message}`);
            } else {
                throw new ConsoleError(`Unknown error: ${e}`);
            }
        }

        return result;
    }
);

export const signingSlice = createSlice({
    name: "signing",
    initialState,
    reducers: {
        setOutput: (state, action: PayloadAction<string>) => {
            state.output = action.payload;
        },
        resetState: (state) => {
            state.output = "Awaiting orders"
            state.signedMsg = initialState.signedMsg;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(run.pending, (state) => {
                state.signedMsg = {};
                state.output = "Processing...";
            })
            .addCase(run.fulfilled, (state, action) => {
                if (action.payload.verified === undefined) {
                    state.output = "Message signed!";
                    state.signedMsg = action.payload;
                } else {
                    let outputMsg =
                        "The message does not match the signature for this address.";

                    if (action.payload.verified === true) {
                        outputMsg = "The message and signature match!";
                    }
                    state.output = outputMsg;
                    state.signedMsg = action.payload;
                }
            })
            .addCase(run.rejected, (state, action) => {
                state.output = action.error.message ?? "Error";
            });
    },
});

export const { resetState, setOutput } = signingSlice.actions;

export default signingSlice.reducer;
