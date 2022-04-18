const {badRequest, forbidden, notFound} = require('../lib/errors');
const {orderNumber, randomId} = require('../lib/id');

const money = value => Number(value.toFixed(2));

const statuses = [
  {key: 'confirmed', label: 'Confirmed'},
  {key: 'assigned', label: 'Courier assigned'},
  {key: 'picked_up', label: 'Picked up'},
  {key: 'out_for_delivery', label: 'Out for delivery'},
  {key: 'delivered', label: 'Delivered'},
];

class OrderService {
  constructor(store) {
    this.store = store;
  }

  quote(input) {
    const payload = this.normalizeRequest(input);
    const data = this.store.snapshot();
    const category = data.categories.find(item => item.id === payload.categoryId);

    if (!category) {
      throw badRequest('Selected service category is not available');
    }

    const urgencyFee = payload.priority === 'express' ? 4.75 : 0;
    const itemFee = Math.max(payload.items.length - 1, 0) * 1.2;
    const subtotal = 6.5 + category.serviceFee + urgencyFee + itemFee;
    const serviceTax = subtotal * 0.08;

    return {
      id: randomId('qte'),
      categoryId: category.id,
      categoryName: category.name,
      currency: 'USD',
      subtotal: money(subtotal),
      serviceTax: money(serviceTax),
      total: money(subtotal + serviceTax),
      etaMinutes: Math.max(18, category.etaMinutes - (payload.priority === 'express' ? 8 : 0)),
      priority: payload.priority,
      createdAt: new Date().toISOString(),
    };
  }

  create(user, input) {
    const quote = this.quote(input);
    const payload = this.normalizeRequest(input);
    const now = new Date().toISOString();

    return this.store.transact(data => {
      const order = {
        id: randomId('ord'),
        number: orderNumber(),
        userId: user.id,
        customer: {
          name: user.name,
          phone: user.phone,
        },
        pickupAddress: payload.pickupAddress,
        dropoffAddress: payload.dropoffAddress,
        notes: payload.notes,
        items: payload.items,
        deliveryWindow: payload.deliveryWindow,
        paymentMethod: payload.paymentMethod,
        quote,
        status: 'confirmed',
        timeline: statuses.map((status, index) => ({
          ...status,
          completedAt: index === 0 ? now : null,
        })),
        createdAt: now,
        updatedAt: now,
      };

      data.orders.unshift(order);
      return order;
    });
  }

  listForUser(user) {
    return this.store
      .snapshot()
      .orders.filter(order => order.userId === user.id)
      .map(order => this.publicOrder(order));
  }

  getForUser(user, orderId) {
    const order = this.store
      .snapshot()
      .orders.find(record => record.id === orderId);

    if (!order) {
      throw notFound('Order was not found');
    }

    if (order.userId !== user.id) {
      throw forbidden();
    }

    return this.publicOrder(order);
  }

  publicOrder(order) {
    return {
      ...order,
      trackingUrl: `/orders/${order.id}`,
    };
  }

  normalizeRequest(input) {
    const pickupAddress = String(input.pickupAddress || '').trim();
    const dropoffAddress = String(input.dropoffAddress || '').trim();
    const categoryId = String(input.categoryId || '').trim();
    const priority = input.priority === 'express' ? 'express' : 'standard';
    const deliveryWindow = String(input.deliveryWindow || 'ASAP - 25 to 40 minutes');
    const paymentMethod = String(input.paymentMethod || 'card');
    const notes = String(input.notes || '').trim();
    const items = Array.isArray(input.items)
      ? input.items
          .map(item => String(item).trim())
          .filter(Boolean)
      : String(input.items || '')
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);

    if (!pickupAddress || !dropoffAddress || !categoryId || items.length === 0) {
      throw badRequest('Pickup, dropoff, service category, and at least one item are required');
    }

    return {
      pickupAddress,
      dropoffAddress,
      categoryId,
      priority,
      deliveryWindow,
      paymentMethod,
      notes,
      items,
    };
  }
}

module.exports = {
  OrderService,
};
