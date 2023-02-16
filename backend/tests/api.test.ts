import request from 'supertest';

import {createApp} from '../src/app.js';
import {MemoryRepository} from '../src/repositories/memoryRepository.js';

const createTestApp = () => createApp(new MemoryRepository());

describe('DoorStep API', () => {
  it('returns health metadata', async () => {
    const response = await request(createTestApp()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'doorstep-mobile-api'
    });
  });

  it('supports customer signup, cart, and checkout', async () => {
    const app = createTestApp();

    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Jordan Customer',
        email: 'jordan@example.com',
        password: 'Doorstep123!'
      })
      .expect(201);

    const token = signup.body.token as string;
    const restaurants = await request(app).get('/api/restaurants').expect(200);
    const restaurantId = restaurants.body.restaurants[0].id as string;
    const restaurant = await request(app).get(`/api/restaurants/${restaurantId}`).expect(200);
    const menuItemId = restaurant.body.menuItems[0].id as string;

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({menuItemId, quantity: 2})
      .expect(201);

    const checkout = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({deliveryAddress: '123 Market Street, Berlin'})
      .expect(201);

    expect(checkout.body.order).toMatchObject({
      status: 'placed',
      deliveryAddress: '123 Market Street, Berlin'
    });
    expect(checkout.body.order.items).toHaveLength(1);
  });

  it('enforces role-based access for admin endpoints', async () => {
    const app = createTestApp();

    const login = await request(app)
      .post('/api/auth/login')
      .send({email: 'customer@doorstep.dev', password: 'Doorstep123!'})
      .expect(200);

    await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(403);
  });
});
