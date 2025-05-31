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
  const { loginPolice, loading, error } = useAuthStore();
  const router = useRouter();
  const [tokenInputs, setTokenInputs] = useState<string[]>(Array(TOKEN_LENGTH).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(TOKEN_LENGTH).fill(null));

  // Clear any previous errors
  useEffect(() => {
    useAuthStore.setState({ error: null });
  }, []);

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
    
    // Auto-advance to next input if character entered
    if (text && index < TOKEN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !tokenInputs[index] && index > 0) {
      const newTokenInputs = [...tokenInputs];
      newTokenInputs[index - 1] = '';
      setTokenInputs(newTokenInputs);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async () => {
  // Validate token is complete
  if (token.length !== TOKEN_LENGTH) {
    Alert.alert('Error', 'Please enter all characters of your token');
    return;
  }

  try {
    await loginPolice(token);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    Alert.alert('Login Error', errorMessage);
  }
};

  const handlePaste = async (text: string, index: number) => {
    // If pasted text is longer than a single character, it might be the full token
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Police Login</Text>
          <Text style={styles.subtitle}>Enter your 8-character token</Text>
          
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
            onPress={handleLogin}
            disabled={loading || token.length !== TOKEN_LENGTH}
            accessibilityLabel="Login button"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
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
  },
  loginButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  }
});

export default PoliceLoginView;