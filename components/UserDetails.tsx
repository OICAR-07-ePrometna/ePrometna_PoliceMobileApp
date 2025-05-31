import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@/stores/authStore';
import { getLoggedInUser } from '@/services/userService';
import type { User } from '@/models/user';
import * as tokenUtils from '@/utilities/tokenUtils';

const UserDetails = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      try {
        if (await useAuthStore.getState().isAuthenticated()) {
          const userData = await getLoggedInUser();
          
          if (userData) {
            setUser(userData);
            await SecureStore.setItemAsync(tokenUtils.USER_DATA_KEY, JSON.stringify(userData));
            return;
          }
        }
      } catch (apiError) {
        console.error("Error fetching from API:", apiError);
      }
      
      //SecureStore data
      try {
        const storedUserData = await SecureStore.getItemAsync(tokenUtils.USER_DATA_KEY);
        if (storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUser(parsedUser);
          return;
        }
      } catch (storageError) {
        console.error("Error retrieving from storage:", storageError);
      }
      
      setError('Failed to load user details');
    } catch (err) {
      console.error('Error in user details component:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading user details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="red" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <Card.Title title="Moji Podaci" titleStyle={styles.cardTitle} />
          <Card.Content>
            {user ? (
              <View>
                <TextInput
                  label="Ime"
                  value={user.firstName || ''}
                  left={<TextInput.Icon icon="account-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Prezime"
                  value={user.lastName || ''}
                  left={<TextInput.Icon icon="account-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="OIB"
                  value={user.oib || ''}
                  left={<TextInput.Icon icon="card-account-details-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Prebivalište"
                  value={user.residence || ''}
                  left={<TextInput.Icon icon="home-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Datum rođenja"
                  value={user.birthDate || ''}
                  left={<TextInput.Icon icon="calendar" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="E-mail"
                  value={user.email || ''}
                  left={<TextInput.Icon icon="email-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
                
                <TextInput
                  label="Korisnička uloga"
                  value={user.role || ''}
                  left={<TextInput.Icon icon="shield-account-outline" />}
                  disabled
                  mode="outlined"
                  style={styles.input}
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="person-outline" size={48} color="#757575" />
                <Text style={styles.noDataText}>
                  {error || 'No user details available'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});

export default UserDetails;