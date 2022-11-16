import {ArrowRight, Clock, MapPin, ShieldCheck, Star, Truck} from 'lucide-react';
import {Link} from 'react-router-dom';

import {API_URL} from '../api/client';
import {Card} from '../components/ui';

const stats = [
  {label: 'Average delivery', value: '28 min'},
  {label: 'Partner rating', value: '4.8/5'},
  {label: 'Operations uptime', value: '99.9%'}
];

export const LandingPage = () => (
  <>
    <section className="landing-hero">
      <div className="hero-content">
        <span className="eyebrow">DoorStep Mobile Platform</span>
        <h1>Delivery ordering, dispatch, and tracking in one production-ready stack.</h1>
        <p>
          A full-stack portfolio delivery product with customer checkout, driver workflows,
          admin operations, JWT authentication, and deployable frontend and backend surfaces.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/restaurants">
            Explore restaurants <ArrowRight size={16} />
          </Link>
          <Link className="button button-secondary" to="/auth">
            Open demo account
          </Link>
        </div>
      </div>
    </section>

    <section className="ops-strip">
      {stats.map((stat) => (
        <div key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>

    <section className="section-grid">
      <div>
        <span className="eyebrow">Built for real operations</span>
        <h2>Everything a delivery marketplace needs to feel credible.</h2>
        <p>
          Customers can browse restaurants, build a cart, checkout, and track order status.
          Admins can see operations health, while drivers have a focused delivery queue.
        </p>
      </div>
      <div className="feature-grid">
        <Card>
          <Clock size={22} />
          <h3>Order lifecycle</h3>
          <p>Placed, assigned, picked up, and delivered states map to real dispatch work.</p>
        </Card>
        <Card>
          <Truck size={22} />
          <h3>Driver flow</h3>
          <p>Drivers can review assigned orders and update the delivery status from the web app.</p>
        </Card>
        <Card>
          <ShieldCheck size={22} />
          <h3>Role security</h3>
          <p>JWT authentication protects customer, driver, and admin routes.</p>
        </Card>
        <Card>
          <MapPin size={22} />
          <h3>API ready</h3>
          <p>Backend URL is configured through environment variables: {API_URL}</p>
        </Card>
      </div>
    </section>

    <section className="section-grid reverse">
      <div className="delivery-visual" aria-label="Live delivery operations preview">
        <div className="map-card">
          <span className="map-pin pin-a" />
          <span className="map-pin pin-b" />
          <span className="map-pin pin-c" />
          <div className="route-line" />
          <div className="dispatch-card">
            <Star size={16} />
            <div>
              <strong>Urban Pizza Works</strong>
              <span>Driver assigned in 4 min</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <span className="eyebrow">Senior-level delivery</span>
        <h2>Clean architecture from browser to database.</h2>
        <p>
          The app is separated into frontend, backend, docs, Docker, and CI workflows so it
          looks polished on GitHub and can be deployed without manual rewrites.
        </p>
      </div>
    </section>
  </>
);
