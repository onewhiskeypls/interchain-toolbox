import { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Chain } from "@chain-registry/types";
import { Tooltip } from "primereact/tooltip";

export const AddressComponent = (props: {
    address: string;
    customHeader?: string;
    showFullAddress?: boolean;
    chain?: Chain;
    bech32_prefix?: string;
    chain_name?: string;
}) => {
    const [copied, setCopied] = useState(false);

    const updateCopied = () => {
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    };

    return (
        <div className="border rounded-md">
            <Tooltip target={`#id_${props.address.replace(/[\W_]+/g, "")}`} />
            <div className="flex p-1">
                <div className="flex flex-none place-items-center">
                    <span className="inline-block">
                        <CopyToClipboard
                            text={props.address}
                            onCopy={() => updateCopied()}
                        >
                            <i
                                className={`pi ${
                                    copied ? "pi-check" : "pi-copy"
                                } pr-2`}
                            />
                        </CopyToClipboard>
                    </span>
                </div>
                <div className="grow">
                    <div>
                        <span className="pr-1">
                            {props.customHeader ?? "Chain"}:
                        </span>
                        <span className="font-bold">
                            {props.chain_name ?? props.chain?.chain_name}
                        </span>
                    </div>
                    <div>
                        {props.showFullAddress ? (
                            <>
                                <span className="font-bold">
                                    {props.bech32_prefix ??
                                        props.chain?.bech32_prefix}
                                </span>
                                <span>
                                    {props.address.replace(
                                        props.bech32_prefix ??
                                            props.chain?.bech32_prefix ??
                                            "",
                                        ""
                                    )}
                                </span>
                            </>
                        ) : (
                            <div
                                id={`id_${props.address.replace(
                                    /[\W_]+/g,
                                    ""
                                )}`}
                                className="w-fit"
                                data-pr-tooltip={`${props.address}`}
                            >
                                <span className="">
                                    {props.bech32_prefix ??
                                        props.chain?.bech32_prefix}
                                </span>
                                <span>
                                    {props.address
                                        .replace(
                                            props.bech32_prefix ??
                                                props.chain?.bech32_prefix ??
                                                "",
                                            ""
                                        )
                                        .substring(0, 7)}
                                    ...
                                    {props.address
                                        .replace(
                                            props.bech32_prefix ??
                                                props.chain?.bech32_prefix ??
                                                "",
                                            ""
                                        )
                                        .substring(
                                            props.address.replace(
                                                props.bech32_prefix ??
                                                    props.chain
                                                        ?.bech32_prefix ??
                                                    "",
                                                ""
                                            ).length - 6,
                                            props.address.replace(
                                                props.bech32_prefix ??
                                                    props.chain
                                                        ?.bech32_prefix ??
                                                    "",
                                                ""
                                            ).length
                                        )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
