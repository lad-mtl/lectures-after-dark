import type { ReactNode } from "react";
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="lad-page-header">
      <p className="lad-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="lad-lead">{children}</p>}
    </header>
  );
}
