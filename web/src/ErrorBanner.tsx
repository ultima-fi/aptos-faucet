export function ErrorBanner() {
  return (
    <div className="is-danger notification">
      You must{" "}
      <a
        href="https://aptos.dev/tutorials/building-wallet-extension/"
        target="_blank"
      >
        install the Aptos wallet extension{" "}
      </a>
      to use this
    </div>
  );
}
