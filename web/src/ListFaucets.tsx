export function ListFaucets(props: { faucets: string[] }) {
  return (
    <div>
      <p>Faucets you created</p>
      <table className="table is-bordered is-striped">
        <tbody>
          {props.faucets.map((x, i) => (
            <tr key={i}>
              <td>{x.slice(1, x.length - 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
