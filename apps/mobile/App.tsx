import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TOOLS } from '@walikelas/config';

export default function App() {
  const toolsCount = TOOLS.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>WaliKelas Remote</Text>
        <Text style={styles.subtitle}>Teacher Remote Foundation</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Shared Monorepo Connected</Text>
        </View>
        <Text style={styles.info}>{toolsCount} tools loaded from @walikelas/config</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
});
