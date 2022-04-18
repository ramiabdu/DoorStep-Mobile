import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Metric,
  Notice,
  Panel,
  PrimaryButton,
  SectionHeader,
  StatusPill,
} from '../components/Controls';
import {colors, type} from '../theme';

const ServiceCard = ({category, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityRole="button"
    style={[styles.serviceCard, {borderTopColor: category.accent || colors.primary}]}>
    <Text style={styles.serviceName}>{category.name}</Text>
    <Text style={styles.serviceEta}>{category.etaMinutes} min avg</Text>
    <Text style={styles.serviceText}>{category.description}</Text>
  </TouchableOpacity>
);

const PartnerRow = ({partner}) => (
  <View style={styles.partnerRow}>
    <View style={styles.partnerMark}>
      <Text style={styles.partnerInitial}>{partner.name.slice(0, 1)}</Text>
    </View>
    <View style={styles.partnerInfo}>
      <Text style={styles.partnerName}>{partner.name}</Text>
      <Text style={styles.partnerMeta}>
        {partner.deliveryMinutes} min · {partner.distanceKm} km · {partner.rating} rating
      </Text>
    </View>
    <StatusPill tone={partner.open ? 'success' : 'danger'} label={partner.open ? 'Open' : 'Closed'} />
  </View>
);

export const HomeScreen = ({
  apiStatus,
  catalog,
  orders,
  user,
  onAuth,
  onStartOrder,
  onTrack,
}) => {
  const activeOrder = orders && orders.length ? orders[0] : null;
  const operations = catalog.operations || {};

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.brand}>DoorStep</Text>
          <StatusPill
            tone={apiStatus.connected ? 'success' : 'danger'}
            label={apiStatus.connected ? 'Live API' : 'Demo data'}
          />
        </View>
        <Text style={styles.heroTitle}>
          Get essentials, errands, and pickups handled with accountable delivery.
        </Text>
        <Text style={styles.heroBody}>
          A full stack doorstep platform with account verification, live catalog data,
          quotes, orders, and customer tracking.
        </Text>
        <View style={styles.heroActions}>
          <PrimaryButton label="Start an order" onPress={onStartOrder} />
          {!user ? (
            <PrimaryButton label="Sign in" variant="secondary" onPress={onAuth} />
          ) : null}
        </View>
      </View>

      {!apiStatus.connected ? (
        <Notice
          tone="danger"
          title="Running on local fallback data"
          body="Start the backend API to enable authentication, quotes, orders, and tracking persistence."
        />
      ) : null}

      <Panel style={styles.metricsPanel}>
        <Metric label="active cities" value={operations.activeCities || 8} />
        <Metric label="on-time rate" value={`${operations.onTimeRate || 97}%`} />
        <Metric label="avg handoff" value={`${operations.avgHandoffMinutes || 31}m`} />
      </Panel>

      {activeOrder ? (
        <Panel style={styles.activeOrder}>
          <SectionHeader title="Active order" action="Track" onAction={onTrack} />
          <Text style={styles.orderNumber}>{activeOrder.number}</Text>
          <Text style={styles.orderMeta}>
            {activeOrder.quote.categoryName} · {activeOrder.status.replace(/_/g, ' ')}
          </Text>
          <Text style={styles.orderAddress}>{activeOrder.dropoffAddress}</Text>
        </Panel>
      ) : null}

      <SectionHeader title="Services" />
      <View style={styles.serviceGrid}>
        {catalog.categories.map(category => (
          <ServiceCard key={category.id} category={category} onPress={onStartOrder} />
        ))}
      </View>

      <SectionHeader title="Trusted partners" />
      <Panel>
        {catalog.partners.map(partner => (
          <PartnerRow key={partner.id} partner={partner} />
        ))}
      </Panel>
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
  hero: {
    backgroundColor: colors.black,
    borderRadius: 14,
    padding: 22,
    marginTop: 16,
    marginBottom: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  brand: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heroBody: {
    color: '#D6D1C8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 20,
  },
  heroActions: {
    minHeight: 114,
    justifyContent: 'space-between',
  },
  metricsPanel: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  activeOrder: {
    marginBottom: 22,
  },
  orderNumber: {
    ...type.h2,
  },
  orderMeta: {
    color: colors.primary,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  orderAddress: {
    ...type.body,
    marginTop: 8,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    width: '48%',
    minHeight: 150,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faint,
    borderTopWidth: 4,
  },
  serviceName: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 16,
  },
  serviceEta: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    marginTop: 5,
  },
  serviceText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.faint,
  },
  partnerMark: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerInitial: {
    color: colors.primaryDark,
    fontWeight: '900',
    fontSize: 18,
  },
  partnerInfo: {
    flex: 1,
    marginRight: 8,
  },
  partnerName: {
    color: colors.ink,
    fontWeight: '900',
  },
  partnerMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
});
