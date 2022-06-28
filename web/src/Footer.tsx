import { FAUCET_MODULE } from "./env";

export function Footer() {
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          Aptos <strong>Coin Emporium</strong> by thomas@ultimalabs.xyz. The
          source code is
          <a href="https://github.com/ultima-fi/aptos-faucet" target="_blank">
            &nbsp;here
          </a>
        </p>

        <p style={{ overflowWrap: "anywhere" }}>
          Program account: {FAUCET_MODULE}
        </p>
      </div>
    </footer>
  );
}
