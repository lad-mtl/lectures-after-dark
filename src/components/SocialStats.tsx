export interface SocialStat {
  label: string;
  value: string;
  href: string;
}

interface SocialStatsProps {
  stats: SocialStat[];
}

export function SocialStats({ stats }: SocialStatsProps) {
  return (
    <section className="lad-social-stats" aria-label="Our community in numbers">
      <dl>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              <a href={stat.href} target="_blank" rel="noreferrer">
                {stat.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
