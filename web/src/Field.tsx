export function Field(props: {
  label: string;
  children: JSX.Element;
  help?: JSX.Element;
}) {
  return (
    <div className="field">
      <label htmlFor="" className="label">
        {props.label}
      </label>
      <div className="control">{props.children}</div>
      {props.help && props.help}
    </div>
  );
}
