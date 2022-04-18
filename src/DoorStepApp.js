import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {createDoorStepClient} from './api/client';
import {Notice, Screen} from './components/Controls';
import {fallbackCatalog} from './data/fallbackCatalog';
import {AuthScreen} from './screens/AuthScreen';
import {HomeScreen} from './screens/HomeScreen';
import {OrderScreen} from './screens/OrderScreen';
import {TrackingScreen} from './screens/TrackingScreen';
import {colors} from './theme';

const navItems = [
  {key: 'home', label: 'Home'},
  {key: 'order', label: 'Order'},
  {key: 'tracking', label: 'Track'},
  {key: 'auth', label: 'Account'},
];

const BottomNav = ({active, onChange, user}) => (
  <View style={styles.nav}>
    {navItems.map(item => {
      const selected = active === item.key;
      const label = item.key === 'auth' && user ? 'Profile' : item.label;

      return (
        <TouchableOpacity
          key={item.key}
          accessibilityRole="button"
          onPress={() => onChange(item.key)}
          style={[styles.navItem, selected && styles.navItemActive]}>
          <Text style={[styles.navText, selected && styles.navTextActive]}>{label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const ProfileScreen = ({apiStatus, onLogout, user}) => (
  <Screen>
    <View style={styles.profileContent}>
      <Text style={styles.profileKicker}>Account</Text>
      <Text style={styles.profileTitle}>{user ? user.name : 'Guest customer'}</Text>
      <Text style={styles.profileBody}>
        {user
          ? `${user.email}\n${user.phone}\n${user.defaultAddress}`
          : 'Sign in to save addresses, create live orders, and track fulfillment history.'}
      </Text>
      <Notice
        title={apiStatus.connected ? 'Backend connected' : 'Backend offline'}
        body={
          apiStatus.connected
            ? 'Your mobile client is connected to the local DoorStep API.'
            : 'Start the backend to use account, quote, order, and tracking APIs.'
        }
        tone={apiStatus.connected ? 'neutral' : 'danger'}
      />
      {user ? (
        <TouchableOpacity onPress={onLogout} accessibilityRole="button" style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </Screen>
);

const DoorStepApp = () => {
  const client = useMemo(() => createDoorStepClient(), []);
  const [screen, setScreen] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    loading: true,
    message: 'Checking API',
  });
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [auth, setAuth] = useState({token: null, user: null});
  const [verification, setVerification] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback((title, body, tone = 'neutral') => {
    setNotice({title, body, tone});
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      await client.health();
      const home = await client.home();
      setCatalog({...fallbackCatalog, ...home});
      setApiStatus({connected: true, loading: false, message: 'Connected'});
    } catch (error) {
      setCatalog(fallbackCatalog);
      setApiStatus({
        connected: false,
        loading: false,
        message: error.message,
      });
    }
  }, [client]);

  const refreshOrders = useCallback(
    async token => {
      const sessionToken = token || auth.token;

      if (!sessionToken) {
        return;
      }

      setBusy('refresh');
      try {
        const result = await client.listOrders(sessionToken);
        setOrders(result.orders);
        setActiveOrder(current => current || result.orders[0] || null);
      } catch (error) {
        showNotice('Could not refresh orders', error.message, 'danger');
      } finally {
        setBusy(null);
      }
    },
    [auth.token, client, showNotice],
  );

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const completeAuth = async payload => {
    setAuth({token: payload.token, user: payload.user});
    setVerification(null);
    setAuthMode('login');
    setScreen('home');
    showNotice('Welcome to DoorStep', 'Your verified session is ready for live orders.');
    await refreshOrders(payload.token);
  };

  const handleAuthSubmit = async (mode, form) => {
    setBusy('auth');
    setNotice(null);

    try {
      const result = mode === 'register' ? await client.register(form) : await client.login(form);

      if (result.token) {
        await completeAuth(result);
        return;
      }

      setVerification({
        verificationId: result.verificationId,
        user: result.user,
        debug: result.debug,
      });
      setAuthMode('otp');
      showNotice('Verification required', 'Enter the OTP to finish account setup.');
    } catch (error) {
      showNotice('Authentication failed', error.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const handleVerifyOtp = async code => {
    if (!verification) {
      showNotice('Verification missing', 'Start sign in or registration again.', 'danger');
      return;
    }

    setBusy('auth');
    setNotice(null);

    try {
      const result = await client.verifyOtp({
        verificationId: verification.verificationId,
        code,
      });
      await completeAuth(result);
    } catch (error) {
      showNotice('Verification failed', error.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const handleQuote = async payload => {
    setBusy('quote');
    setNotice(null);

    try {
      const result = await client.quoteOrder(payload, auth.token);
      setQuote(result.quote);
      showNotice('Quote ready', `Estimated total is $${Number(result.quote.total).toFixed(2)}.`);
    } catch (error) {
      showNotice('Quote failed', error.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const handleCreateOrder = async payload => {
    setBusy('order');
    setNotice(null);

    try {
      const result = await client.createOrder(payload, auth.token);
      setOrders(current => [result.order, ...current.filter(item => item.id !== result.order.id)]);
      setActiveOrder(result.order);
      setQuote(null);
      setScreen('tracking');
      showNotice('Order confirmed', `${result.order.number} is now being tracked.`);
    } catch (error) {
      showNotice('Order failed', error.message, 'danger');
    } finally {
      setBusy(null);
    }
  };

  const requireAuth = () => {
    setAuthMode('register');
    setScreen('auth');
    showNotice('Create an account first', 'DoorStep requires a verified session before pricing and order creation.');
  };

  const handleNav = key => {
    if (key === 'order' && !auth.user) {
      requireAuth();
      return;
    }

    if (key === 'tracking' && auth.token) {
      refreshOrders(auth.token);
    }

    if (key === 'auth' && auth.user) {
      setScreen('profile');
      return;
    }

    setScreen(key);
  };

  const renderScreen = () => {
    if (screen === 'auth') {
      return (
        <AuthScreen
          apiStatus={apiStatus}
          loading={busy === 'auth'}
          mode={authMode}
          onModeChange={mode => {
            setVerification(null);
            setAuthMode(mode);
          }}
          onSubmit={handleAuthSubmit}
          onVerify={handleVerifyOtp}
          verification={verification}
        />
      );
    }

    if (screen === 'order') {
      return (
        <OrderScreen
          catalog={catalog}
          loading={busy}
          onCreateOrder={handleCreateOrder}
          onQuote={handleQuote}
          onRequireAuth={requireAuth}
          quote={quote}
          user={auth.user}
        />
      );
    }

    if (screen === 'tracking') {
      return (
        <TrackingScreen
          activeOrder={activeOrder}
          loading={busy === 'refresh'}
          onRefresh={() => refreshOrders(auth.token)}
          onSelectOrder={setActiveOrder}
          orders={orders}
        />
      );
    }

    if (screen === 'profile') {
      return (
        <ProfileScreen
          apiStatus={apiStatus}
          user={auth.user}
          onLogout={() => {
            setAuth({token: null, user: null});
            setOrders([]);
            setActiveOrder(null);
            setScreen('home');
            showNotice('Signed out', 'The local session has been cleared.');
          }}
        />
      );
    }

    return (
      <HomeScreen
        apiStatus={apiStatus}
        catalog={catalog}
        orders={orders}
        user={auth.user}
        onAuth={() => setScreen('auth')}
        onStartOrder={() => handleNav('order')}
        onTrack={() => handleNav('tracking')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
      <View style={styles.app}>
        {renderScreen()}
        {notice ? (
          <View style={styles.noticeWrap}>
            <Notice title={notice.title} body={notice.body} tone={notice.tone} />
          </View>
        ) : null}
        <BottomNav
          active={screen === 'profile' ? 'auth' : screen}
          onChange={handleNav}
          user={auth.user}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  app: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  nav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  navItem: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navText: {
    color: '#D6D1C8',
    fontSize: 12,
    fontWeight: '900',
  },
  navTextActive: {
    color: colors.white,
  },
  noticeWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
  },
  profileContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 110,
    justifyContent: 'center',
  },
  profileKicker: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  profileTitle: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '900',
    marginBottom: 10,
  },
  profileBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '900',
  },
});

export default DoorStepApp;
