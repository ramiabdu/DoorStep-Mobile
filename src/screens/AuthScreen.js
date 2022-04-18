import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  Notice,
  Panel,
  PrimaryButton,
  SegmentedControl,
  StatusPill,
  TextField,
} from '../components/Controls';
import {colors, type} from '../theme';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  defaultAddress: '',
};

export const AuthScreen = ({
  apiStatus,
  loading,
  mode,
  onModeChange,
  onSubmit,
  onVerify,
  verification,
}) => {
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    setOtp('');
  }, [verification && verification.verificationId]);

  const update = (key, value) => setForm(current => ({...current, [key]: value}));
  const isOtp = mode === 'otp';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <StatusPill
          tone={apiStatus.connected ? 'success' : 'danger'}
          label={apiStatus.connected ? 'API connected' : 'API offline'}
        />
        <Text style={styles.kicker}>DoorStep Account</Text>
        <Text style={type.title}>A secure customer account in under a minute.</Text>
        <Text style={[type.body, styles.headerBody]}>
          Register, verify, then create tracked doorstep deliveries from the same mobile session.
        </Text>
      </View>

      {!apiStatus.connected ? (
        <Notice
          tone="danger"
          title="Backend is not reachable"
          body="Start the API with npm run server before signing in. The catalog can still render from local fallback data."
        />
      ) : null}

      <Panel>
        {!isOtp ? (
          <SegmentedControl
            value={mode}
            onChange={onModeChange}
            options={[
              {label: 'Sign in', value: 'login'},
              {label: 'Create account', value: 'register'},
            ]}
          />
        ) : null}

        {isOtp ? (
          <View>
            <Text style={styles.panelTitle}>Verify your number</Text>
            <Text style={styles.panelBody}>
              Enter the six digit code sent to {verification && verification.user ? verification.user.phone : 'your phone'}.
            </Text>
            {verification && verification.debug ? (
              <Notice
                title="Development OTP"
                body={`Use ${verification.debug.otp} while running locally. Production hides this response.`}
              />
            ) : null}
            <TextField
              label="Verification code"
              value={otp}
              onChangeText={setOtp}
              placeholder="123456"
              keyboardType="number-pad"
            />
            <PrimaryButton
              label="Verify and continue"
              loading={loading}
              disabled={otp.length < 6}
              onPress={() => onVerify(otp)}
            />
          </View>
        ) : (
          <View>
            {mode === 'register' ? (
              <>
                <TextField
                  label="Full name"
                  value={form.name}
                  onChangeText={value => update('name', value)}
                  placeholder="Ari Customer"
                />
                <TextField
                  label="Mobile number"
                  value={form.phone}
                  onChangeText={value => update('phone', value)}
                  placeholder="+1 555 010 101"
                  keyboardType="phone-pad"
                />
              </>
            ) : null}

            <TextField
              label="Email"
              value={form.email}
              onChangeText={value => update('email', value)}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <TextField
              label="Password"
              value={form.password}
              onChangeText={value => update('password', value)}
              placeholder="At least 8 characters"
              secureTextEntry
            />

            {mode === 'register' ? (
              <TextField
                label="Default delivery address"
                value={form.defaultAddress}
                onChangeText={value => update('defaultAddress', value)}
                placeholder="221 Market Street"
                multiline
              />
            ) : null}

            <PrimaryButton
              label={mode === 'register' ? 'Create account' : 'Sign in'}
              loading={loading}
              disabled={!apiStatus.connected}
              onPress={() => onSubmit(mode, form)}
            />
          </View>
        )}
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
  header: {
    paddingTop: 18,
    marginBottom: 20,
  },
  kicker: {
    marginTop: 18,
    marginBottom: 10,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  headerBody: {
    marginTop: 12,
  },
  panelTitle: {
    ...type.h2,
    marginBottom: 8,
  },
  panelBody: {
    ...type.body,
    marginBottom: 16,
  },
});
