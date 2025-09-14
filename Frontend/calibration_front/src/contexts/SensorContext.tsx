import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface Sensor {
  id: number;
  name: string;
  type: string;
  unit: string;
  value: number;
  drift: number;
  status: string;
  lastUpdated: string;
}

interface SensorContextType {
  sensors: Sensor[];
  readings: { [sensorId: number]: any[] };
  lastUpdate: Date;
  isLoading: boolean;
  error: string | null;
  refreshSensors: () => Promise<void>;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
};

interface SensorProviderProps {
  children: ReactNode;
}

export const SensorProvider: React.FC<SensorProviderProps> = ({ children }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<{ [sensorId: number]: any[] }>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sensors
  const fetchSensors = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/sensors/");
      setSensors(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch sensors", err);
      setError("Failed to fetch sensors");
    }
  };

  // Fetch readings for a specific sensor
  const fetchReadings = async (sensorId: number, sensorName: string) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/readings/history/?sensor_name=${sensorName}`
      );
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        setReadings(prev => ({
          ...prev,
          [sensorId]: [...(prev[sensorId] || []), latest].slice(-50) // Keep last 50 readings
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch readings for sensor ${sensorId}`, err);
    }
  };

  // Update sensor values with simulated data
  const updateSensorValues = async () => {
    try {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => {
          const baseline = parseFloat(sensor.value.toString()) || 1; // avoid divide by zero
          // Reduced variation: smaller random change (0.1 instead of 2)
          const newValue = parseFloat(
            (baseline + (Math.random() - 0.5) * 0.1).toFixed(2)
          );

          const newDrift = parseFloat(
            (((newValue - baseline) / baseline) * 100).toFixed(2)
          );

          // POST reading to backend
          axios.post("http://127.0.0.1:8000/api/readings/", {
            sensor: sensor.id,
            raw_value: newValue,
          }).catch(err => console.error("Failed to post reading", err));

          // Use enhanced ML anomaly detection
          axios.post("http://127.0.0.1:8000/api/ml/anomaly/detect/", {
            sensor_id: sensor.id,
            reading_value: newValue,
          }).then(response => {
            if (response.data.is_anomaly) {
              console.log(`ML detected anomaly for ${sensor.name}:`, response.data);
            }
          }).catch(err => console.error("ML anomaly detection failed", err));

          // Fetch readings for this sensor
          fetchReadings(sensor.id, sensor.name);

          return {
            ...sensor,
            value: newValue,
            drift: newDrift,
            lastUpdated: new Date().toISOString(),
          };
        })
      );

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error updating sensors", err);
      setError("Error updating sensors");
    }
  };

  // Refresh sensors manually
  const refreshSensors = async () => {
    setIsLoading(true);
    await fetchSensors();
    setIsLoading(false);
  };

  // Initialize sensors and start intervals
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchSensors();
      setIsLoading(false);
    };

    initializeData();

    // Update sensor values every 10 seconds
    const sensorInterval = setInterval(updateSensorValues, 10000);

    return () => {
      clearInterval(sensorInterval);
    };
  }, []);

  const value: SensorContextType = {
    sensors,
    readings,
    lastUpdate,
    isLoading,
    error,
    refreshSensors,
  };

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};
