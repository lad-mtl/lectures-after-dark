import { submitNewsletter } from "../lib/submitNewsletter";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("pending");
    setMessage("");
    try {
      const message = await submitNewsletter({
        email: String(data.get("email") || ""),
        consent: data.get("consent") === "on",
        website: String(data.get("website") || ""),
      });
      setStatus("success");
      setMessage(message);
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.name === "Error"
        ? error.message
        : "We couldn’t confirm your signup. Please try again.");
    }
  }

  return (
    <section id="newsletter" className="lad-newsletter" aria-labelledby="newsletter-title">
      <div>
        <p className="lad-eyebrow">STAY IN THE LOOP</p>
        <h2 id="newsletter-title">Your next night out, in your inbox.</h2>
        <p>Get new talk announcements and Lectures After Dark news.</p>
      </div>
      <form onSubmit={submit} aria-label="Newsletter signup" aria-busy={status === "pending"}>
        <label htmlFor="newsletter-email">Email address</label>
        <div className="lad-newsletter-fields">
          <input id="newsletter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} required disabled={status === "pending"} />
          <button className="lad-button" type="submit" disabled={status === "pending"}>
            {status === "pending" ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        <div className="lad-sr-only" aria-hidden="true">
          <label htmlFor="newsletter-website">Leave this blank</label>
          <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <label className="lad-newsletter-consent">
          <input name="consent" type="checkbox" required disabled={status === "pending"} />
          <span>I agree to receive Lectures After Dark news and event announcements by email. Unsubscribe anytime.</span>
        </label>
        <p className="lad-newsletter-privacy">Email subscriptions are managed through Brevo. <Link to="/privacy">Privacy policy</Link>.</p>
        {message && <p className={status === "error" ? "lad-field-error" : "lad-status"} role={status === "error" ? "alert" : "status"}>{message}</p>}
      </form>
    </section>
  );
}
