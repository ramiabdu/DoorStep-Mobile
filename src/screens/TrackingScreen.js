import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Notice,
  Panel,
  PrimaryButton,
  SectionHeader,
  StatusPill,
} from '../components/Controls';
import {colors, type} from '../theme';

const Timeline = ({timeline}) => (
  <View style={styles.timeline}>
    {timeline.map((step, index) => {
      const done = Boolean(step.completedAt);
      return (
        <View key={step.key} style={styles.timelineItem}>
          <View style={styles.timelineRail}>
            <View style={[styles.timelineDot, done && styles.timelineDotDone]} />
            {index < timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={styles.timelineBody}>
            <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>
              {step.label}
            </Text>
            <Text style={styles.timelineTime}>
              {done ? new Date(step.completedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Pending'}
            </Text>
          </View>
        </View>
      );
    })}
  </View>
);

const OrderSelector = ({order, selected, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    style={[styles.selector, selected && styles.selectorActive]}>
    <Text style={styles.selectorNumber}>{order.number}</Text>
    <Text style={styles.selectorMeta}>
      {order.quote.categoryName} · ${Number(order.quote.total).toFixed(2)}
    </Text>
  </TouchableOpacity>
);

export const TrackingScreen = ({activeOrder, loading, onRefresh, onSelectOrder, orders}) => {
  const order = activeOrder || (orders && orders[0]);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Operations Tracking</Text>
        <Text style={type.title}>Know exactly where the order stands.</Text>
        <Text style={[type.body, styles.headerBody]}>
          Orders are loaded from the backend session and rendered with a simple customer timeline.
        </Text>
      </View>

      <PrimaryButton
        label="Refresh orders"
        loading={loading}
        onPress={onRefresh}
        variant="secondary"
      />

      {!orders || !orders.length ? (
        <Notice
          title="No tracked orders yet"
          body="Create your first order and it will appear here with a fulfillment timeline."
        />
      ) : (
        <View style={styles.selectorList}>
          {orders.map(item => (
            <OrderSelector
              key={item.id}
              order={item}
              selected={order && item.id === order.id}
              onPress={() => onSelectOrder(item)}
            />
          ))}
        </View>
      )}

      {order ? (
        <Panel style={styles.detailPanel}>
          <View style={styles.detailTop}>
            <View style={styles.detailTitleWrap}>
              <Text style={styles.orderNumber}>{order.number}</Text>
              <Text style={styles.orderMeta}>
                {order.quote.categoryName} · {order.quote.etaMinutes} minute estimate
              </Text>
            </View>
            <StatusPill tone="success" label={order.status.replace(/_/g, ' ')} />
          </View>

          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressText}>{order.pickupAddress}</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Dropoff</Text>
            <Text style={styles.addressText}>{order.dropoffAddress}</Text>
          </View>

          <SectionHeader title="Timeline" />
          <Timeline timeline={order.timeline} />
        </Panel>
      ) : null}
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
    paddingBottom: 110,
  },
  header: {
    paddingTop: 18,
    marginBottom: 18,
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
  selectorList: {
    marginTop: 16,
    marginBottom: 16,
  },
  selector: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.faint,
    marginBottom: 10,
  },
  selectorActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFCF7',
  },
  selectorNumber: {
    color: colors.ink,
    fontWeight: '900',
  },
  selectorMeta: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
  },
  detailPanel: {
    marginTop: 4,
  },
  detailTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  detailTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  orderNumber: {
    ...type.h2,
  },
  orderMeta: {
    color: colors.muted,
    marginTop: 4,
  },
  addressBlock: {
    marginBottom: 14,
  },
  addressLabel: {
    ...type.label,
    marginBottom: 4,
  },
  addressText: {
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 20,
  },
  timeline: {
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 58,
  },
  timelineRail: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: colors.faint,
    marginTop: 3,
  },
  timelineDotDone: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.faint,
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    color: colors.muted,
    fontWeight: '800',
  },
  timelineLabelDone: {
    color: colors.ink,
  },
  timelineTime: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
});
