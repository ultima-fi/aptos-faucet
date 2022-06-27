export function ListFaucets(props: { faucets: string[] }) {
  return (
    <div>
      <h3>Faucets you created</h3>
      <ul>
        {props.faucets.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
