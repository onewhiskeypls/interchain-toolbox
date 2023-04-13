export function buildMsgSignerLink(
    message: string,
    address: string,
    signature: string
): string {
    const url = process.env.REACT_APP_PUBLIC_URL;
    return encodeURI(`${url}/msgsigner?message=${message}&address=${address}&signature=${signature}`);
}
