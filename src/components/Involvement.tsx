import { Link } from "react-router-dom";
export function Involvement({
  title = "Help shape the next night.",
  text = "Give a talk. Host us. Suggest an idea. Tell us how it went.",
  to = "/get-involved",
  action = "Get involved →",
}: {
  title?: string;
  text?: string;
  to?: string;
  action?: string;
}) {
  return (
    <section className="lad-involvement">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <Link className="lad-button" to={to}>
        {action}
      </Link>
    </section>
  );
}
