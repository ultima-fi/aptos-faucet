export function explorer(hash: string) {
  return `https://explorer.devnet.aptos.dev/txn/${hash}`;
}

export function link(hash: string) {
  const url = explorer(hash);
  return (
    <a rel="noreferrer" href={url} target="_blank">
      View transaction.
    </a>
  );
}

export const addressRegex = "0x[A-Fa-f0-9]{1,64}";
export function validAddress(address: string) {
  // ex: 0xd929c7ef372f9aa71f35b4bbc482cbf48077e2076a5e09769f7ccea14041b1be

  return new RegExp(`^${addressRegex}$`).test(address);
}

export function validType(s: string) {
  return new RegExp(`^${addressRegex}::[A-Z][A-Za-z]*::[A-Z][A-Za-z]*`).test(s);
}
