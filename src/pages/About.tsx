import type { TeamMemberData } from "../types/content";
import { ContentState } from "../components/ContentState";
import { Involvement } from "../components/Involvement";
import { PageHeader } from "../components/PageHeader";
import { Portrait } from "../components/Portrait";
import { useContent } from "../hooks/useContent";
export function About() {
  const state = useContent<TeamMemberData>("team-members");
  return (
    <div className="lad-container lad-about-page">
      <PageHeader
        eyebrow="ABOUT US / LECTURES AFTER DARK"
        title={"Taking learning\nout of the lecture hall."}
      />
      <section className="lad-about-copy">
        <p>
          Lectures After Dark brings researchers and curious people together in
          Montréal bars for talks, questions, and good conversation. It’s a way
          to keep learning without going back to school: hear a new idea, ask
          the questions on your mind, and keep the conversation going over a
          drink. No academic background needed. Curiosity is the only
          requirement.
        </p>
      </section>
      <section className="lad-section">
        <h2>The people behind the nights</h2>
        <ContentState {...state} />
        <div className="lad-team">
          {state.data.map((person) => (
            <article key={person.id}>
              <Portrait person={person} />
              <div>
                <h3>{person.name}</h3>
                {person.title && <p className="lad-eyebrow">{person.title}</p>}
                {person.description && <p>{person.description}</p>}
              </div>
            </article>
          ))}
        </div>
        {!state.loading && !state.error && !state.data.length && (
          <p>Meet the team at our next night.</p>
        )}
      </section>
      <Involvement />
    </div>
  );
}
