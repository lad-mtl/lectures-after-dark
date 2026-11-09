import { safeUrl } from "../lib/siteContent";
export function Portrait({
  person,
}: {
  person: { name: string; image?: string | null; imageCredit?: string | null };
}) {
  return safeUrl(person.image) ? (
    <span className="lad-portrait-wrap">
      <img
        className="lad-portrait"
        src={safeUrl(person.image)}
        alt=""
        loading="lazy"
      />
      {person.imageCredit && <span className="lad-photo-credit">Photo: {person.imageCredit}</span>}
    </span>
  ) : (
    <span className="lad-portrait lad-initials" aria-hidden="true">
      {person.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
