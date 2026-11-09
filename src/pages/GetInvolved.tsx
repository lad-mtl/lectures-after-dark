import { useRef, useState, type FormEvent } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import { ContentState } from "../components/ContentState";
import { PageHeader } from "../components/PageHeader";
import { submitParticipation } from "../lib/submitParticipation";
import { useEvents } from "../hooks/useContent";
import {
  participationForms,
  validateParticipation,
  type ParticipationKind,
} from "../data/participation";

export default function GetInvolved() {
  const { kind = "speaker" } = useParams();
  const [params] = useSearchParams();
  const validKind = Object.hasOwn(participationForms, kind)
    ? (kind as ParticipationKind)
    : "speaker";
  return (
    <ParticipationForm
      key={validKind}
      kind={validKind}
      eventId={params.get("event") || ""}
    />
  );
}
function ParticipationForm({
  kind,
  eventId,
}: {
  kind: ParticipationKind;
  eventId: string;
}) {
  const spec = participationForms[kind];
  const events = useEvents();
  const [values, setValues] = useState<Record<string, string>>({ eventId });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [failure, setFailure] = useState("");
  const form = useRef<HTMLFormElement>(null);
  function update(name: string, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const problems = validateParticipation(kind, values);
    if (
      kind === "feedback" &&
      !events.events.some((item) => item.id === values.eventId && item.isPast)
    )
      problems.eventId = "Choose an available past event.";
    setErrors(problems);
    if (Object.keys(problems).length) {
      form.current
        ?.querySelector<HTMLElement>(`[name="${Object.keys(problems)[0]}"]`)
        ?.focus();
      return;
    }
    const payload: Record<string, string> = { kind, name: "", email: "" };
    for (const field of spec.fields)
      payload[field.name] = (values[field.name] || "").trim();
    const body = JSON.stringify(payload);
    if (new TextEncoder().encode(body).length > 12000) {
      setFailure("Please shorten your answers before submitting.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await submitParticipation(body);
      setStatus("success");
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "We could not save your submission. Please retry.",
      );
      setStatus("error");
    }
  }
  return (
    <div className="lad-container">
      <PageHeader
        eyebrow={`GET INVOLVED / ${spec.label.toUpperCase()}`}
        title={spec.title}
      >
        {spec.description}
      </PageHeader>
      <div className="lad-form-layout">
        <nav className="lad-form-nav" aria-label="Ways to get involved">
          {(Object.keys(participationForms) as ParticipationKind[]).map(
            (item) => (
              <NavLink
                key={item}
                to={`/get-involved/${item}`}
                className={kind === item ? "active" : ""}
              >
                {participationForms[item].label}
                <span aria-hidden="true">{kind === item ? "→" : ""}</span>
              </NavLink>
            ),
          )}
        </nav>
        {status === "success" ? (
          <section className="lad-success" role="status">
            <p className="lad-eyebrow">THANK YOU</p>
            <h2>Saved for review.</h2>
            <p>
              Your{" "}
              {kind === "speaker"
                ? "proposal"
                : kind === "venue" || kind === "volunteer"
                  ? "inquiry"
                  : kind === "topic"
                    ? "suggestion"
                    : "feedback"}{" "}
              has been saved in Notion for review by the team.
            </p>
            <p>This does not subscribe you to a newsletter.</p>
            <button
              className="lad-button"
              onClick={() => {
                setValues({});
                setStatus("idle");
              }}
            >
              Send another response
            </button>
          </section>
        ) : (
          <form ref={form} noValidate onSubmit={submit} className="lad-form">
            <p className="lad-required">* Required fields</p>
            {kind === "feedback" && <ContentState {...events} />}
            {spec.fields.map((field) => (
              <div className="lad-field" key={field.name}>
                {field.type === "rating" ? (
                  <fieldset>
                    <legend>{field.label} *</legend>
                    <div className="lad-rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating}>
                          <input
                            type="radio"
                            name={field.name}
                            value={rating}
                            checked={values.rating === String(rating)}
                            onChange={(event) =>
                              update(field.name, event.target.value)
                            }
                            aria-invalid={Boolean(errors[field.name])}
                            aria-describedby={
                              errors[field.name]
                                ? `${field.name}-error`
                                : undefined
                            }
                          />
                          <span>
                            {rating}
                            {rating === 1
                              ? " Poor"
                              : rating === 5
                                ? " Excellent"
                                : ""}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <>
                    <label htmlFor={field.name}>
                      {field.label}
                      {field.required ? " *" : " (optional)"}
                    </label>
                    {field.type === "event" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={values[field.name] || ""}
                        onChange={(event) =>
                          update(field.name, event.target.value)
                        }
                        required
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name] ? `${field.name}-error` : undefined
                        }
                      >
                        <option value="">Choose an event</option>
                        {events.events
                          .filter((item) => item.isPast)
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.title}
                            </option>
                          ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={values[field.name] || ""}
                        onChange={(event) =>
                          update(field.name, event.target.value)
                        }
                        required={field.required}
                        maxLength={2000}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name] ? `${field.name}-error` : undefined
                        }
                      />
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        value={values[field.name] || ""}
                        onChange={(event) =>
                          update(field.name, event.target.value)
                        }
                        required={field.required}
                        maxLength={300}
                        min={field.type === "number" ? 1 : undefined}
                        autoComplete={
                          field.name === "email"
                            ? "email"
                            : field.name === "name"
                              ? "name"
                              : undefined
                        }
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={
                          errors[field.name] ? `${field.name}-error` : undefined
                        }
                      />
                    )}
                  </>
                )}
                {errors[field.name] && (
                  <p
                    className="lad-field-error"
                    id={`${field.name}-error`}
                    role="alert"
                  >
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
            <p className="lad-form-privacy">
              {spec.privacy}
            </p>
            {status === "error" && (
              <p role="alert" className="lad-field-error">
                {failure}
              </p>
            )}
            <button
              className="lad-button"
              type="submit"
              disabled={status === "sending" || (kind === "feedback" && (events.loading || events.error))}
            >
              {status === "sending"
                ? "Saving…"
                : status === "error"
                  ? "Retry submission"
                  : spec.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
