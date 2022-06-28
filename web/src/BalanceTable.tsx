export function BalanceTable(props: {
  balances: { coin: string; balance: number }[];
}) {
  const balances = props.balances;

  return (
    <div>
      <p className="has-text-weight-light mb-3">
        Your balances for all coins, including standard non-faucet coins.
      </p>
      {balances.length > 0 && (
        <table className="table is-bordered is-striped">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b, i) => (
              <tr key={i}>
                <td>{b.coin}</td>
                <td>{b.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
