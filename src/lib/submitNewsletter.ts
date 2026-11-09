interface NewsletterRequest {
  email: string;
  consent: boolean;
  website: string;
}

export async function submitNewsletter(input: NewsletterRequest): Promise<string> {
  const response = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: input.email, consent: input.consent, website: input.website }),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null) as { success?: boolean; message?: string; error?: string } | null;
  if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "Signup is temporarily unavailable. Please try again.");
  if (result?.success === false || typeof result?.message !== "string" || !result.message.trim()) {
    throw new Error("We couldn’t confirm your signup. Please try again.");
  }
  return result.message;
}
