import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";

import { chains } from "chain-registry";
import { useEffect, useState } from "react";

import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { AddressComponent } from "./address_component";
import { Chain } from "@chain-registry/types";

export const BechConverter = () => {
    const [fromAddress, setFromAddress] = useState("");
    const [addresses, setAddresses] = useState<JSX.Element[]>([]);
    const [targetChainPrefix, setTargetChainPrefix] = useState("");
    const [targetChainResult, setTargetChainResult] = useState<
        JSX.Element | undefined
    >(undefined);

    useEffect(() => {
        if (fromAddress) {
            let newAddresses: JSX.Element[] = [];
            try {
                let decoded = fromBech32(fromAddress, Infinity);

                let chainAddresses: Map<string, Chain> = new Map();

                chains.forEach((chain) => {
                    if (
                        chain &&
                        chain.bech32_prefix &&
                        chain.bech32_prefix.length > 0
                    ) {
                        let newChainAddr = toBech32(
                            chain.bech32_prefix,
                            decoded.data,
                            Infinity
                        );

                        if (!chainAddresses.has(newChainAddr)) {
                            chainAddresses.set(newChainAddr, chain);
                        }
                    }
                });

                if ([...chainAddresses.keys()].length > 0) {
                    let validAddresses = [...chainAddresses.keys()].sort();

                    newAddresses = validAddresses.map((key) => {
                        let chain = chainAddresses.get(key)!;

                        return (
                            <AddressComponent
                                key={key}
                                chain={chain}
                                address={key}
                            />
                        );
                    });
                }

                setAddresses(newAddresses);

                if (targetChainPrefix && targetChainPrefix.length > 0) {
                    let newChainAddr = toBech32(
                        targetChainPrefix,
                        decoded.data,
                        Infinity
                    );

                    setTargetChainResult(
                        <AddressComponent
                            key={"E1CEA4F15B3CF2E83D4F2539E2D51"}
                            showFullAddress={true}
                            customHeader={"Prefix Input"}
                            address={newChainAddr}
                            bech32_prefix={targetChainPrefix}
                            chain_name={targetChainPrefix}
                        />
                    );
                } else {
                    setTargetChainResult(undefined);
                }
            } catch (e) {}
        }
    }, [fromAddress, targetChainPrefix]);

    return (
        <div className="py-2 px-4">
            <p className="text-lg">Bech Converter</p>
            <Divider />
            <div className="flex gap-4">
                <div className="flex-auto">
                    <label
                        htmlFor="fromAddress"
                        className="font-bold block mb-2"
                    >
                        From Address
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-angle-double-down"></i>
                        </span>
                        <InputText
                            id={"fromAddress"}
                            placeholder="From Address"
                            value={fromAddress}
                            onInput={(e) =>
                                setFromAddress(
                                    (e.target as HTMLInputElement).value
                                )
                            }
                        />
                    </div>
                </div>
                <div className="flex-auto">
                    <label htmlFor="toPrefix">
                        <div className="block mb-2">
                            <span className="font-bold">Target Prefix</span>{" "}
                            <span className="text-xs">(optional)</span>
                        </div>
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-bolt"></i>
                        </span>
                        <InputText
                            id={"toPrefix"}
                            placeholder="To prefix"
                            value={targetChainPrefix}
                            onInput={(e) =>
                                setTargetChainPrefix(
                                    (e.target as HTMLInputElement).value
                                )
                            }
                        />
                    </div>
                </div>
            </div>
            <Divider />
            {targetChainResult && (
                <div className="pb-1">
                    <div className="mb-2">
                        <span className="text-md ">Target Prefix</span>
                    </div>
                    {targetChainResult}
                    <Divider />
                </div>
            )}
            {addresses && addresses.length > 0 ? (
                <>
                    <div className="mb-2">
                        <span className="text-md ">All chains in registry</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">{addresses}</div>
                </>
            ) : (
                "Enter a valid address"
            )}
        </div>
    );
};
