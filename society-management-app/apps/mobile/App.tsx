import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>CS</Text>
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Green Heights Co-op</Text>
            <Text style={styles.subtitle}>Resident Space</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Phase 1 Setup Success</Text>
          <Text style={styles.infoBody}>
            The React Native Expo client structure for Android & iOS is successfully configured in the monorepo workspace.
          </Text>
          <View style={styles.tagRow}>
            <Text style={styles.tag}>TypeScript</Text>
            <Text style={styles.tag}>Expo Router Ready</Text>
          </View>
        </View>

        {/* Next Steps List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modules Configured (Phase 1)</Text>
          
          <View style={styles.listItem}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.listText}>Monorepo Shared Package Linking</Text>
          </View>
          
          <View style={styles.listItem}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.listText}>PostgreSQL & Minio Docker Setup</Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.listText}>Prisma Schema with 35+ Entities</Text>
          </View>

          <View style={styles.listItem}>
            <Text style={styles.bullet}>✔</Text>
            <Text style={styles.listText}>NestJS API Bootstrap & Web Portal</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b', // Slate 800
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: '#10b981', // Emerald 500
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  logoText: {
    color: '#020617', // Slate 950
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8', // Slate 400
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#1e293b', // Slate 800
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  infoTitle: {
    color: '#10b981', // Emerald 500
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoBody: {
    color: '#cbd5e1', // Slate 300
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#34d399', // Emerald 400
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  section: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bullet: {
    color: '#10b981',
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 14,
  },
  listText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
