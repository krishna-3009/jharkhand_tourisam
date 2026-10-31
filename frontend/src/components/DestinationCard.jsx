import { Link } from 'react-router-dom';
import fallbackImage from '../assets/jharkhand-landscape.svg';

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function DestinationCard({ destination, featured = false }) {
  return (
    <Link
      className={`destination-card${featured ? ' destination-card--featured' : ''}`}
      to={`/destinations/${slug(destination.name)}`}
    >
      <img
        loading="lazy"
        decoding="async"
        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
        src={destination.image}
        alt={`${destination.name}, Jharkhand`}
      />
      <span className="destination-card__index" aria-hidden="true">Explore</span>
      <div className="destination-card__copy">
        <span className="destination-card__name">{destination.name}</span>
        <span className="destination-card__tagline">{destination.tagline}</span>
      </div>
      <span className="destination-card__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}
