export default function SectionHeading({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`section-heading ${className}`.trim()}>
      <div className="section-heading__copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-heading__description">{description}</p>}
      </div>
      {action && <div className="section-heading__action">{action}</div>}
    </div>
  );
}
