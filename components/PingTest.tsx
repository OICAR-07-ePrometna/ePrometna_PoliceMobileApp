import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import api from '@/services/api';
import Constants from 'expo-constants';

export default function PingTest() {
    const [pingStatus, setPingStatus] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePing = async () => {
        setIsLoading(true);
        setPingStatus('Pinging...');

        try {
            //testano na random appu
            const response = await api.get(`/api/test/`);
            setPingStatus(`Connected! Server responded with: ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            setPingStatus(`Connection failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title={isLoading ? "Pinging..." : "Ping Server"}
                onPress={handlePing}
                disabled={isLoading}
            />
            {isLoading && <ActivityIndicator style={styles.loader} />}
            <Text style={[
                styles.statusText,
                pingStatus.includes('Connected') ? styles.success : pingStatus.includes('failed') ? styles.error : null
            ]}>
                {pingStatus}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    statusText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    loader: {
        marginTop: 10,
    },
    success: {
        color: 'green',
    },
    error: {
        color: 'red',
    }
});