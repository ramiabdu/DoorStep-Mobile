import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors, radius, shadow, type} from '../theme';

export const Screen = ({children}) => (
  <View style={styles.screen}>{children}</View>
);

export const Panel = ({children, style}) => (
  <View style={[styles.panel, style]}>{children}</View>
);

export const SectionHeader = ({title, action, onAction}) => (
  <View style={styles.sectionHeader}>
    <Text style={type.h2}>{title}</Text>
    {action ? (
      <TouchableOpacity onPress={onAction} accessibilityRole="button">
        <Text style={styles.link}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const StatusPill = ({label, tone = 'neutral'}) => (
  <View style={[styles.pill, tone === 'success' && styles.pillSuccess, tone === 'danger' && styles.pillDanger]}>
    <View style={[styles.pillDot, tone === 'success' && styles.pillDotSuccess, tone === 'danger' && styles.pillDotDanger]} />
    <Text style={styles.pillText}>{label}</Text>
  </View>
);

export const PrimaryButton = ({label, onPress, loading, disabled, variant = 'primary'}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    accessibilityRole="button"
    style={[
      styles.button,
      variant === 'secondary' && styles.secondaryButton,
      (disabled || loading) && styles.disabledButton,
    ]}>
    {loading ? (
      <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.white} />
    ) : (
      <Text style={[styles.buttonText, variant === 'secondary' && styles.secondaryButtonText]}>
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

export const TextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9A948A"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      style={[styles.field, multiline && styles.multilineField]}
    />
  </View>
);

export const SegmentedControl = ({options, value, onChange}) => (
  <View style={styles.segmented}>
    {options.map(option => {
      const active = option.value === value;
      return (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          accessibilityRole="button"
          style={[styles.segment, active && styles.segmentActive]}>
          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const Metric = ({label, value}) => (
  <View style={styles.metric}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

export const Notice = ({title, body, tone = 'neutral'}) => (
  <View style={[styles.notice, tone === 'danger' && styles.noticeDanger]}>
    <Text style={styles.noticeTitle}>{title}</Text>
    <Text style={styles.noticeBody}>{body}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faint,
    ...shadow,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  link: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillSuccess: {
    backgroundColor: '#E0F1EA',
  },
  pillDanger: {
    backgroundColor: '#F6E2DF',
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    marginRight: 6,
    backgroundColor: colors.muted,
  },
  pillDotSuccess: {
    backgroundColor: colors.primary,
  },
  pillDotDanger: {
    backgroundColor: colors.danger,
  },
  pillText: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 12,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    ...type.label,
    marginBottom: 7,
  },
  field: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.faint,
    backgroundColor: '#FFFCF7',
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 15,
  },
  multilineField: {
    minHeight: 86,
    paddingTop: 12,
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  segmentTextActive: {
    color: colors.ink,
  },
  metric: {
    flex: 1,
    backgroundColor: '#FFFCF7',
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.faint,
  },
  metricValue: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  notice: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: '#EAF2EE',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C8E1D5',
    marginBottom: 14,
  },
  noticeDanger: {
    backgroundColor: '#F7E8E5',
    borderColor: '#E8C2BC',
  },
  noticeTitle: {
    color: colors.ink,
    fontWeight: '900',
    marginBottom: 4,
  },
  noticeBody: {
    color: colors.muted,
    lineHeight: 20,
    fontSize: 13,
  },
});
