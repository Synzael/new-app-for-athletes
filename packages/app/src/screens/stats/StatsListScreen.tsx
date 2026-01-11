import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../services/api';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatsScreenNavigationProp } from '../../navigation/types';

interface PerformanceStat {
  id: string;
  statName: string;
  statValue: string;
  unit: string;
  recordedDate?: string;
  eventName?: string;
}

export default function StatsListScreen() {
  const navigation = useNavigation<StatsScreenNavigationProp>();
  const { profile, hasProfile } = useProfile();
  const [stats, setStats] = useState<PerformanceStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!profile) return;

    try {
      const response = await apiClient.get(`/stats/${profile.id}`);
      setStats(response.data.stats || []);
      setError(null);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [profile, fetchStats]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const deleteStat = async (statId: string) => {
    try {
      await apiClient.delete(`/stats/${statId}`);
      setStats(stats.filter((s) => s.id !== statId));
    } catch (error) {
      // Handle error silently or show alert
    }
  };

  if (!hasProfile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-add-outline" size={64} color="#6b7280" />
        <Text style={styles.emptyTitle}>Create Profile First</Text>
        <Text style={styles.emptyText}>
          You need to create an athlete profile before adding performance stats.
        </Text>
        <Button
          title="Create Profile"
          onPress={() => navigation.navigate('CreateProfile' as never)}
        />
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading stats..." />;
  }

  const renderItem = ({ item }: { item: PerformanceStat }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statName}>{item.statName}</Text>
        <TouchableOpacity
          onPress={() => deleteStat(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.statValue}>
        <Text style={styles.valueText}>{item.statValue}</Text>
        {item.unit && <Text style={styles.unitText}>{item.unit}</Text>}
      </View>
      {(item.eventName || item.recordedDate) && (
        <View style={styles.statMeta}>
          {item.eventName && (
            <Text style={styles.metaText}>{item.eventName}</Text>
          )}
          {item.recordedDate && (
            <Text style={styles.metaText}>
              {new Date(item.recordedDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons name="stats-chart-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyListTitle}>No Stats Yet</Text>
            <Text style={styles.emptyListText}>
              Add your performance stats to showcase your abilities to coaches.
            </Text>
          </View>
        }
        ListHeaderComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddStat')}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  statCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    padding: 4,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valueText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  unitText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#3d3d5c',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyListText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
