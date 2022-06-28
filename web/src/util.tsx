export function explorer(hash: string) {
  return `https://explorer.devnet.aptos.dev/txn/${hash}`;
}

export function link(hash: string) {
  const url = explorer(hash);
  return (
    <a href={url} target="_blank">
      View transaction.
    </a>
  );
}
