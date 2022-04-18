class CatalogService {
  constructor(store) {
    this.store = store;
  }

  home() {
    const data = this.store.snapshot();

    return {
      categories: data.categories,
      partners: data.partners.filter(partner => partner.open),
      deliveryWindows: data.deliveryWindows,
      operations: {
        activeCities: 8,
        onTimeRate: 97,
        avgHandoffMinutes: 31,
      },
    };
  }

  categories() {
    return this.store.snapshot().categories;
  }

  partners({categoryId} = {}) {
    const partners = this.store.snapshot().partners;

    if (!categoryId) {
      return partners;
    }

    return partners.filter(partner => partner.categoryId === categoryId);
  }
}

module.exports = {
  CatalogService,
};
