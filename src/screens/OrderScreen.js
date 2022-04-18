import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Notice,
  Panel,
  PrimaryButton,
  SectionHeader,
  SegmentedControl,
  TextField,
} from '../components/Controls';
import {colors, type} from '../theme';

const formatMoney = amount => `$${Number(amount || 0).toFixed(2)}`;

const CategoryOption = ({category, selected, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    style={[
      styles.categoryOption,
      selected && styles.categoryOptionActive,
      selected && {borderColor: category.accent || colors.primary},
    ]}>
    <Text style={[styles.categoryName, selected && styles.categoryNameActive]}>
      {category.name}
    </Text>
    <Text style={styles.categoryEta}>{category.etaMinutes} min</Text>
  </TouchableOpacity>
);

export const OrderScreen = ({
  catalog,
  loading,
  onCreateOrder,
  onQuote,
  onRequireAuth,
  quote,
  user,
}) => {
  const [categoryId, setCategoryId] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [items, setItems] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryWindow, setDeliveryWindow] = useState(catalog.deliveryWindows[0]);

  useEffect(() => {
    if (!categoryId && catalog.categories.length) {
      setCategoryId(catalog.categories[0].id);
    }
  }, [catalog.categories, categoryId]);

  const payload = {
    categoryId,
    pickupAddress,
    dropoffAddress: dropoffAddress || (user && user.defaultAddress) || '',
    items,
    notes,
    priority,
    paymentMethod,
    deliveryWindow,
  };

  const hasCoreDetails =
    Boolean(categoryId) &&
    Boolean(payload.pickupAddress.trim()) &&
    Boolean(payload.dropoffAddress.trim()) &&
    Boolean(payload.items.trim());

  const submitQuote = () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    onQuote(payload);
  };

  const submitOrder = () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    onCreateOrder(payload);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>New DoorStep Request</Text>
        <Text style={type.title}>Create a priced, trackable delivery.</Text>
        <Text style={[type.body, styles.headerBody]}>
          The app calls the backend for quote calculation and stores confirmed orders for tracking.
        </Text>
      </View>

      {!user ? (
        <Notice
          title="Account required"
          body="Sign in or create an account to request a live quote and confirm the delivery."
        />
      ) : null}

      <SectionHeader title="Service type" />
      <View style={styles.categoryGrid}>
        {catalog.categories.map(category => (
          <CategoryOption
            key={category.id}
            category={category}
            selected={category.id === categoryId}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </View>

      <Panel>
        <TextField
          label="Pickup address or store"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="FreshLane Market, Main Street"
        />
        <TextField
          label="Dropoff address"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
          placeholder={(user && user.defaultAddress) || '221 Market Street'}
          multiline
        />
        <TextField
          label="Items"
          value={items}
          onChangeText={setItems}
          placeholder="Coffee, milk, bakery box"
          multiline
        />
        <TextField
          label="Courier notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Gate code, substitution preferences, handoff notes"
          multiline
        />

        <Text style={styles.inputGroupLabel}>Priority</Text>
        <SegmentedControl
          value={priority}
          onChange={setPriority}
          options={[
            {label: 'Standard', value: 'standard'},
            {label: 'Express', value: 'express'},
          ]}
        />

        <Text style={styles.inputGroupLabel}>Payment</Text>
        <SegmentedControl
          value={paymentMethod}
          onChange={setPaymentMethod}
          options={[
            {label: 'Card', value: 'card'},
            {label: 'Cash', value: 'cash'},
          ]}
        />

        <Text style={styles.inputGroupLabel}>Delivery window</Text>
        {catalog.deliveryWindows.map(window => (
          <TouchableOpacity
            key={window}
            onPress={() => setDeliveryWindow(window)}
            accessibilityRole="button"
            style={[styles.windowRow, deliveryWindow === window && styles.windowRowActive]}>
            <Text style={[styles.windowText, deliveryWindow === window && styles.windowTextActive]}>
              {window}
            </Text>
          </TouchableOpacity>
        ))}
      </Panel>

      <Panel style={styles.quotePanel}>
        <SectionHeader title="Quote" />
        {quote ? (
          <>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Subtotal</Text>
              <Text style={styles.quoteValue}>{formatMoney(quote.subtotal)}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Service tax</Text>
              <Text style={styles.quoteValue}>{formatMoney(quote.serviceTax)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(quote.total)}</Text>
            </View>
            <Text style={styles.quoteEta}>Estimated handoff in {quote.etaMinutes} minutes</Text>
          </>
        ) : (
          <Text style={styles.emptyQuote}>
            Add request details and ask the backend for a live operational quote.
          </Text>
        )}
      </Panel>

      <View style={styles.actions}>
        <PrimaryButton
          label="Get live quote"
          loading={loading === 'quote'}
          disabled={!hasCoreDetails}
          onPress={submitQuote}
          variant="secondary"
        />
        <PrimaryButton
          label="Confirm order"
          loading={loading === 'order'}
          disabled={!hasCoreDetails || !quote}
          onPress={submitOrder}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: 20,
    paddingBottom: 122,
  },
  header: {
    paddingTop: 18,
    marginBottom: 20,
  },
  kicker: {
    marginBottom: 10,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  headerBody: {
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryOption: {
    width: '48%',
    minHeight: 78,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.faint,
    padding: 12,
    marginBottom: 12,
  },
  categoryOptionActive: {
    backgroundColor: '#FFFCF7',
  },
  categoryName: {
    color: colors.ink,
    fontWeight: '900',
  },
  categoryNameActive: {
    color: colors.primaryDark,
  },
  categoryEta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  inputGroupLabel: {
    ...type.label,
    marginBottom: 8,
  },
  windowRow: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.faint,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  windowRowActive: {
    backgroundColor: '#EAF2EE',
    borderColor: colors.primary,
  },
  windowText: {
    color: colors.muted,
    fontWeight: '700',
  },
  windowTextActive: {
    color: colors.primaryDark,
  },
  quotePanel: {
    marginTop: 16,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quoteLabel: {
    color: colors.muted,
  },
  quoteValue: {
    color: colors.ink,
    fontWeight: '800',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.faint,
  },
  totalLabel: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 16,
  },
  totalValue: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
  },
  quoteEta: {
    color: colors.muted,
    marginTop: 10,
  },
  emptyQuote: {
    ...type.body,
  },
  actions: {
    minHeight: 116,
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
