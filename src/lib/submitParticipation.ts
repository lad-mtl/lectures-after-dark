const unconfirmed = 'We could not confirm your submission was saved. Your entries are still here. Please contact the team before retrying.';

export async function submitParticipation(body: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/participation', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
  } catch { throw new Error(unconfirmed); }
  const result = await response.json().catch(() => null) as { saved?: boolean; reference?: string; error?: string } | null;
  if (!response.ok) {
    throw new Error(typeof result?.error === 'string' ? result.error : unconfirmed);
  }
  if (result?.saved !== true || typeof result.reference !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(result.reference)) throw new Error(unconfirmed);
}
