import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

const TOKEN_LENGTH = 8;

const PoliceLoginView: React.FC = () => {
  const [token, setToken] = useState('');
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  const { registerPolice, loading, error, isDeviceRegistered } = useAuthStore();
  const router = useRouter();
  const [tokenInputs, setTokenInputs] = useState<string[]>(Array(TOKEN_LENGTH).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(TOKEN_LENGTH).fill(null));

  useEffect(() => {
    checkRegistrationStatus();
    useAuthStore.setState({ error: null });
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const isRegistered = await isDeviceRegistered();
      setIsFirstTime(!isRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
      setIsFirstTime(true);
    } finally {
      setCheckingRegistration(false);
    }
  };

  // Update the combined token whenever individual inputs change
  useEffect(() => {
    setToken(tokenInputs.join(''));
  }, [tokenInputs]);

  const handleInputChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.charAt(text.length - 1);
    }
    
    const newTokenInputs = [...tokenInputs];
    newTokenInputs[index] = text;
    setTokenInputs(newTokenInputs);
    
    // Auto advance polja
    if (text && index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !tokenInputs[index] && index > 0) {
      const newTokenInputs = [...tokenInputs];
      newTokenInputs[index - 1] = '';
      setTokenInputs(newTokenInputs);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTokenSubmit = async () => {
    // Validate token
    if (token.length !== TOKEN_LENGTH) {
      Alert.alert('Error', 'Please enter all 8 characters of your token');
      return;
    }

    try {
      await registerPolice(token);
      console.log('Police authentication successful');
      router.replace('/(tabs)');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      Alert.alert('Authentication Error', errorMessage);
    }
  };

  const handlePaste = async (text: string, index: number) => {
    if (text.length > 1) {
      const pastedToken = text.slice(0, TOKEN_LENGTH);
      
      // Fill in the token inputs
      const newTokenInputs = Array(TOKEN_LENGTH).fill('');
      for (let i = 0; i < pastedToken.length; i++) {
        newTokenInputs[i] = pastedToken[i];
      }
      setTokenInputs(newTokenInputs);
      
      // Focus on the last filled input or the next empty one
      const focusIndex = Math.min(pastedToken.length, TOKEN_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    } else {
      handleInputChange(text, index);
    }
  };

  if (checkingRegistration) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Provjera statusa uređaja.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Prijava Policijskog Službenika</Text>
          <Text style={styles.subtitle}>
            {isFirstTime 
              ? 'Unesi svoj token za registraciju uređaja i prijavu policijskog službenika'  
              : 'Unesi svoj token prijavu policijskog službenika'
            }
          </Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.tokenContainer}>
            {tokenInputs.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={styles.tokenInput}
                value={digit}
                onChangeText={(text) => handlePaste(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="default"
                autoCapitalize="none"
                selectTextOnFocus={true}
                accessibilityLabel={`Token character ${index + 1}`}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.loginButton,
              token.length !== TOKEN_LENGTH && styles.loginButtonDisabled
            ]} 
            onPress={handleTokenSubmit}
            disabled={loading || token.length !== TOKEN_LENGTH}
            accessibilityLabel="Access app button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isFirstTime ? 'Registriraj se' : 'Prijavi se'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  tokenContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  tokenInput: {
    width: 35,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 4,
    color: '#333',
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  }
});

export default PoliceLoginView;