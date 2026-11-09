import { Link } from "react-router-dom";
import type { TopicData } from "../types/content";
import { topicCategories } from "../data/topicCategories";
import { ContentState } from "../components/ContentState";
import { Involvement } from "../components/Involvement";
import { PageHeader } from "../components/PageHeader";
import { useContent } from "../hooks/useContent";
function TopicLinks({ topics }: { topics: TopicData[] }) {
  return (
    <ul className="lad-category-topics">
      {topics.map((topic, index) => (
        <li key={topic.id ?? `${topic.title}-${index}`}>
          <Link to={`/events?topic=${encodeURIComponent(topic.title)}`}>
            {topic.title} <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Topics() {
  const state = useContent<TopicData>("topics");
  const topics = [...state.data].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div className="lad-container">
      <PageHeader
        eyebrow="FOLLOW YOUR CURIOSITY"
        title="What have we explored?"
      >
        A different way into the archive. Pick a topic to find its talks and
        speakers.
      </PageHeader>
      <ContentState {...state} />
      <div className="lad-topic-list">
        {topicCategories.map((category) => {
          const matchingTopics = topics.filter((topic) => topic.category === category.value);
          return (
            <details className="lad-topic-category" key={category.value}>
              <summary><span aria-hidden="true">{category.emoji}</span> {category.title}</summary>
              <div className="lad-topic-category-content">
                <p>{category.description}</p>
                {matchingTopics.length ? <TopicLinks topics={matchingTopics} /> : !state.loading && !state.error && <p>No topics in this category yet.</p>}
              </div>
            </details>
          );
        })}
        {topics.some((topic) => !topicCategories.some((category) => category.value === topic.category)) && (
          <section className="lad-uncategorized-topics">
            <h2>Uncategorized topics</h2>
            <TopicLinks topics={topics.filter((topic) => !topicCategories.some((category) => category.value === topic.category))} />
          </section>
        )}
      </div>
      {!state.loading && !state.error && !topics.length && (
        <p className="lad-empty">
          Topics will appear here as talks are added to the archive.
        </p>
      )}
      <Involvement
        title="What should we talk about next?"
        text="You don’t need to be a speaker to have a good question."
        action="Suggest a topic →"
        to="/get-involved/topic"
      />
    </div>
  );
}
