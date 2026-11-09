import { useState } from "react";
import type { SpeakerData } from "../types/content";
import { ContentState } from "../components/ContentState";
import { Involvement } from "../components/Involvement";
import { PageHeader } from "../components/PageHeader";
import { Portrait } from "../components/Portrait";
import { SpeakerDialog } from "../components/SpeakerDialog";
import { useContent } from "../hooks/useContent";
export function Speakers() {
  const state = useContent<SpeakerData>("speakers");
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<SpeakerData | null>(null);
  const topics = [
    ...new Set(
      state.data.flatMap((speaker) => (speaker.topic ? [speaker.topic] : [])),
    ),
  ].sort();
  const filtered = state.data.filter(
    (speaker) =>
      (!topic || topic === speaker.topic) &&
      `${speaker.name} ${speaker.topic || ""} ${speaker.bio || ""}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  return (
    <div className="lad-container">
      <PageHeader
        eyebrow="THE PEOPLE BEHIND THE IDEAS"
        title="Meet our speakers."
      >
        Researchers and practitioners who have shared their work with us.
      </PageHeader>
      <div className="lad-filters">
        <label className="lad-search">
          <span className="lad-sr-only">Search speakers</span>
          <input
            type="search"
            placeholder="Search speakers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          <span className="lad-sr-only">Topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            <option value="">Topic: All</option>
            {topics.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <ContentState {...state} />
      <div className="lad-speaker-list">
        {filtered.map((speaker) => (
          <button
            className="lad-speaker-row"
            key={speaker.id}
            onClick={() => setSelected(speaker)}
          >
            <Portrait person={speaker} />
            <span>
              <strong>{speaker.name}</strong>
              {speaker.topic && (
                <span className="lad-eyebrow">{speaker.topic}</span>
              )}
            </span>
            <span className="lad-row-action">View speaker →</span>
          </button>
        ))}
      </div>
      {!state.loading && !state.error && !filtered.length && (
        <p className="lad-empty">
          {search || topic
            ? "No speakers match your search."
            : "Speaker profiles will appear here."}
        </p>
      )}
      <Involvement
        title="Have something to share?"
        text="Pitch a talk for a curious, non-specialist audience."
        to="/get-involved/speaker"
        action="Apply to speak →"
      />
      <SpeakerDialog speaker={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
