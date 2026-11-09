import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { SpeakerData } from "../types/content";
import { safeUrl } from "../lib/siteContent";
import { Portrait } from "./Portrait";
export function SpeakerDialog({
  speaker,
  onClose,
}: {
  speaker: SpeakerData | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (speaker) dialog.current?.showModal();
    else dialog.current?.close();
  }, [speaker]);
  return (
    <dialog
      className="lad-speaker-dialog"
      ref={dialog}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const items = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="speaker-title"
    >
      {speaker && (
        <div>
          <button
            className="lad-dialog-close"
            aria-label="Close speaker details"
            onClick={onClose}
          >
            ×
          </button>
          <p className="lad-eyebrow">THE PEOPLE BEHIND THE IDEAS</p>
          <div className="lad-speaker-heading">
            <Portrait person={speaker} />
            <h2 id="speaker-title">{speaker.name}</h2>
          </div>
          {speaker.topic && <p className="lad-eyebrow">{speaker.topic}</p>}
          <p className="lad-bio">
            {speaker.bio || "Explore their ideas and past talks."}
          </p>
          <div className="lad-actions">
            {safeUrl(speaker.website) && (
              <a
                href={safeUrl(speaker.website)}
                target="_blank"
                rel="noreferrer"
              >
                Website ↗
              </a>
            )}
            {safeUrl(speaker.linkedin) && (
              <a
                href={safeUrl(speaker.linkedin)}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn ↗
              </a>
            )}
          </div>
          <Link
            className="lad-button"
            to={`/events?search=${encodeURIComponent(speaker.name)}`}
            onClick={onClose}
          >
            Browse past talks →
          </Link>
        </div>
      )}
    </dialog>
  );
}
