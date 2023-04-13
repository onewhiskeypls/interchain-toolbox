import { SlButton, SlButtonGroup } from "@shoelace-style/shoelace/dist/react";

import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
//import { Tooltip } from "primereact/tooltip";
import { Tooltip } from 'react-tooltip'
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "../console/Input.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AppThunk } from "../../app/store";
import { resetState, sign, verify } from "./signingSlice";
import { useSearchParams } from "react-router-dom";
import { buildMsgSignerLink } from "../../util/common";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const MsgSigner = () => {
    const dispatch = useAppDispatch();
    const [message, setMessage] = useState("");
    const [address, setAddress] = useState("");
    const [signature, setSignature] = useState("");
    const [msgVerified, setMsgVerified] = useState<boolean | undefined>(undefined);
    const signedMsg = useAppSelector((state) => state.signing.signedMsg);
    const output = useAppSelector((state) => state.signing.output);
    let [searchParams, _] = useSearchParams();

    const [ttIsOpen, setTtIsOpen] = useState(false);

    const currentAccount = useAppSelector(
        (state) => state.accounts.currentAccount
    );

    function run(action: AppThunk<void>) {
        dispatch(action);
    }

    useLayoutEffect(() => {
        dispatch(resetState());
    }, []);

    useEffect(() => {
        if (signedMsg && signedMsg.address && signedMsg.signature) {
            setAddress(signedMsg.address);
            setSignature(signedMsg.signature);

            if (signedMsg.msg && message && signedMsg.msg !== message) {
                setMessage(signedMsg.msg);
            }
        }

        setMsgVerified(signedMsg?.verified);
    }, [signedMsg]);

    const runSignMsg = () => {
        run(sign(message));
    };

    const runVerifyMsg = () => {
        run(verify(message, address, signature));
    };

    useEffect(() => {
        if ([...searchParams.keys()].length > 0) {
            setAddress(
                decodeURIComponent(searchParams.get("address") ?? address)
            );
            setMessage(
                decodeURIComponent(searchParams.get("message") ?? message)
            );
            setSignature(
                decodeURIComponent(searchParams.get("signature") ?? signature)
            );
        }
    }, [searchParams]);

    const [copied, setCopied] = useState(false);

    const updateCopied = (e: any) => {
        setCopied(true);
        setTtIsOpen(true);

        setTimeout(() => {
            setCopied(false);
            setTtIsOpen(false);
        }, 1500);
    };

    return (
        <div className="py-2 px-4 flex flex-col h-full md:w-1/2">
            <div className="flex-none">
                <p className="text-lg">Message Sign & Verify</p>
                <Divider />
                <div className="flex-auto">
                    <label htmlFor="msgToSign" className="font-bold block mb-2">
                        Message
                    </label>
                    <div className="">
                        <InputTextarea
                            id="msgToSign"
                            placeholder="I solemnly swear that I am up to no good."
                            className="w-full h-64"
                            value={message}
                            onInput={(e) =>
                                setMessage((e.target as HTMLInputElement).value)
                            }
                        />
                    </div>
                </div>
                <div className="flex-auto pt-4">
                    <div className="">
                        <label
                            htmlFor="signingAddress"
                            className="font-bold block mb-2"
                        >
                            Signing Address
                        </label>
                        <InputText
                            id="signingAddress"
                            placeholder="juno1aeh8gqu9wr4u8ev6edlgfq03rcy6v5twfn0ja8?"
                            className="w-full"
                            value={address}
                            onInput={(e) =>
                                setAddress((e.target as HTMLInputElement).value)
                            }
                        />
                    </div>
                </div>
                <div className="flex-auto pt-4">
                    <div className="">
                        <label
                            htmlFor="signature"
                            className="font-bold block mb-2"
                        >
                            Signature
                        </label>
                        <InputText
                            id="signature"
                            placeholder="a really long string goes here"
                            className="w-full"
                            value={signature}
                            onInput={(e) =>
                                setSignature((e.target as HTMLInputElement).value)
                            }
                        />
                    </div>
                </div>
                <div className={`text-center mt-8 flex-none`}>
                    <SlButtonGroup className={styles.buttons}>
                        <Tooltip id="tt_id_1" place="top" />
                        <Tooltip id="tt_id_2" place="top" />
                        <SlButton
                            data-tooltip-id={"tt_id_1"}
                            data-tooltip-content="Using your selected account, signs a message"
                            onClick={() => {
                                if (currentAccount !== undefined) {
                                    runSignMsg();
                                }
                            }}
                            variant="neutral"
                            outline
                            disabled={currentAccount === undefined}
                        >
                            Sign
                        </SlButton>
                        <SlButton
                            data-tooltip-id={"tt_id_2"}
                            data-tooltip-content="Verifies a msg"
                            onClick={() => {
                                runVerifyMsg();
                            }}
                            variant="neutral"
                            outline
                        >
                            Verify
                        </SlButton>
                    </SlButtonGroup>
                </div>
                <Divider />
            </div>
            <div className={`pb-4`}>
                <div className="font-bold pb-2">Share me!</div>
                <Tooltip id="tt_id_3" isOpen={ttIsOpen} />
                <CopyToClipboard
                    text={buildMsgSignerLink(message, address, signature)}
                    onCopy={updateCopied}
                >
                    <div
                        className={`${
                            msgVerified === true
                                ? "bg-green-400"
                                : msgVerified === false
                                ? "bg-red-300"
                                : ""
                        } rounded-md p-1`}
                    >
                        <div className="flex">
                            <div>
                            <i
                                className={`pi ${
                                    copied ? "pi-check" : "pi-copy"
                                } pr-2`}
                            />
                            </div>
                            <div>
                            <span
                                className={`inline-block break-all`}
                                data-tooltip-id="tt_id_3"
                                data-tooltip-content="Copied!"
                                data-tooltip-place="bottom"
                            >
                                {buildMsgSignerLink(
                                    message,
                                    address,
                                    signature
                                )}
                            </span>
                            </div>
                        </div>
                    </div>
                </CopyToClipboard>
            </div>
            <div
                className={`${
                    msgVerified === true
                        ? "bg-green-400"
                        : msgVerified === false
                        ? "bg-red-300"
                        : "bg-gray-100"
                } grow rounded-lg p-2`}
            >
                <p className={`break-words`}>{output}</p>
            </div>
        </div>
    );
};
