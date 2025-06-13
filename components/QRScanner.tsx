import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Divider } from 'react-native-paper';
import { scanQRCodeAndGetData, type ScannedDataResult } from '@/services/tempDataService';
import { formatDate } from '@/utilities/formatDate';
import { scanQrCodeStyles as styles } from '@/styles/scanQrCode';

type ScannerState = 'requesting-permission' | 'scanning' | 'processing' | 'results' | 'error';

interface QRScannerProps {
  onBack?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onBack }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerState, setScannerState] = useState<ScannerState>('requesting-permission');
  const [scannedData, setScannedData] = useState<ScannedDataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannedRef = useRef<string | null>(null);

  useEffect(() => {
    if (permission?.granted) {
      setScannerState('scanning');
    } else if (permission && !permission.granted && !permission.canAskAgain) {
      setScannerState('error');
      setError('Potrebna je dozvola za pristup kameri');
    }
  }, [permission]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      setScannerState('scanning');
    } else {
      setScannerState('error');
      setError('Potrebna je dozvola za pristup kameri za skeniranje QR kodova');
    }
  };

  const handleQrScanned = async ({ data }: { data: string }) => {
    if (isProcessing || scannedRef.current === data) {
      return;
    }

    scannedRef.current = data;
    setIsProcessing(true);
    setScannerState('processing');

    try {
      console.log('QR Code scanned:', data);
      
      //UUID REGEX
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.trim())) {
        throw new Error('Skenirani QR kod nije valjan E-Prometna kod');
      }

      const result = await scanQRCodeAndGetData(data.trim());
      setScannedData(result);
      setScannerState('results');
      
    } catch (err: any) {
      console.error('Error processing QR code:', err);
      setError(err.message || 'Greška pri obradi QR koda');
      setScannerState('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannerState('scanning');
    setScannedData(null);
    setError(null);
    scannedRef.current = null;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (scannerState === 'requesting-permission' || !permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.permissionText}>
            Potrebna je dozvola za pristup kameri za skeniranje QR kodova
          </Text>
          <Button
            mode="contained"
            onPress={handleRequestPermission}
            style={styles.permissionButton}
          >
            Omogući pristup kameri
          </Button>
          {onBack && (
            <Button mode="outlined" onPress={onBack} style={styles.backButton}>
              Nazad
            </Button>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (scannerState === 'scanning') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleQrScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                {onBack && (
                  <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                  </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Skeniraj QR kod</Text>
              </View>

              <View style={styles.scanningArea}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>

              <View style={styles.instructions}>
                <Text style={styles.instructionText}>
                  Usmjeri kameru prema E-Prometna QR kodu
                </Text>
                <Text style={styles.instructionSubtext}>
                  QR kod će biti automatski skeniran
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </SafeAreaView>
    );
  }

  if (scannerState === 'processing') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.processingText}>Obrađujem QR kod...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (scannerState === 'results' && scannedData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.successTitle}>QR kod uspješno skeniran</Text>
            <Text style={styles.scanTime}>
              Skenirano: {formatDateTime(new Date().toISOString())}
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Title
              title="Podaci o vozilu"
              left={(props) => <Ionicons {...props} name="car" size={24} />}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Registracija:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.registration || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Marka:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.mark || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Model:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.model || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Tip vozila:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.vehicleType || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Kategorija vozila:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.vehicleCategory || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Boja vozila:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.colourOfVehicle || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Broj šasije:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.chassisNumber || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Datum prve registracije:</Text>
                <Text style={styles.dataValue}>
                  {scannedData.vehicle.summary?.dateFirstRegistration || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Vlasnik:</Text>
                <Text style={styles.dataValue}>
                  {`${scannedData.vehicle.owner.firstName} ${scannedData.vehicle.owner.lastName}`}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* {scannedData.vehicle.drivers && scannedData.vehicle.drivers.length > 0 && (
            <Card style={styles.card}>
              <Card.Title
                title="Ovlašteni vozači"
                left={(props) => <Ionicons {...props} name="people" size={24} />}
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                {scannedData.vehicle.drivers.map((driver, index) => (
                  <View key={driver.uuid} style={styles.driverItem}>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>Vozač {index + 1}:</Text>
                      <Text style={styles.dataValue}>
                        {`${driver.firstName} ${driver.lastName}`}
                      </Text>
                    </View>
                    <View style={styles.dataRow}>
                      <Text style={styles.dataLabel}>OIB:</Text>
                      <Text style={styles.dataValue}>{driver.oib}</Text>
                    </View>
                    {index < scannedData.vehicle.drivers.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          )} */}

          <Card style={styles.card}>
            <Card.Title
              title="Podaci o vozaču"
              left={(props) => <Ionicons {...props} name="person" size={24} />}
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Ime i prezime:</Text>
                <Text style={styles.dataValue}>
                  {`${scannedData.driver.firstName} ${scannedData.driver.lastName}`}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>OIB:</Text>
                <Text style={styles.dataValue}>{scannedData.driver.oib || 'N/A'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Prebivalište:</Text>
                <Text style={styles.dataValue}>{scannedData.driver.residence || 'N/A'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Datum rođenja:</Text>
                <Text style={styles.dataValue}>
                  {formatDate(scannedData.driver.birthDate) || 'N/A'}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Email:</Text>
                <Text style={styles.dataValue}>{scannedData.driver.email || 'N/A'}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Uloga:</Text>
                <Text style={styles.dataValue}>{scannedData.driver.role || 'N/A'}</Text>
              </View> 
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={resetScanner}
              style={styles.scanAgainButton}
              icon="qr-code-scanner"
            >
              Skeniraj novi QR kod
            </Button>
            {onBack && (
              <Button
                mode="outlined"
                onPress={onBack}
                style={styles.backButton}
              >
                Zatvori
              </Button>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (scannerState === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Greška</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtonContainer}>
            <Button
              mode="contained"
              onPress={resetScanner}
              style={styles.retryButton}
            >
              Pokušaj ponovno
            </Button>
            {onBack && (
              <Button
                mode="outlined"
                onPress={onBack}
                style={styles.backButton}
              >
                Nazad
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

export default QRScanner;