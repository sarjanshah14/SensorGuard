import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Zap, Target, CheckCircle, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useSensors } from "@/contexts/SensorContext";

const Calibration = () => {
  const { sensors } = useSensors();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [calibrationMethod, setCalibrationMethod] = useState("auto");
  const [isCalibrating, setIsCalibrating] = useState(false);
  const { toast } = useToast();

  // Set initial sensor when sensors are loaded
  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].name);
    }
  }, [sensors, selectedSensor]);

  // Fetch latest anomaly for selected sensor
  useEffect(() => {
    if (!selectedSensor) return;
  
    const fetchAnomalyData = async () => {
      try {
        console.log("Fetching anomalies for sensor:", selectedSensor);
  
        const res = await axios.get(`http://127.0.0.1:8000/api/anomalies/?sensor_name=${selectedSensor}`);
        console.log("Filtered anomalies fetched:", res.data);
  
        if (res.data.length === 0) {
          console.log("No anomalies found for this sensor");
          setCurrentData(null);
          return;
        }
  
        const latest = res.data[0]; // API already returns latest first
        const newData = {
          measured: latest.value, 
          ideal: latest.expected,
          corrected: latest.expected,
          offset: (latest.expected - latest.value).toFixed(2),
          accuracy: 100,
          status: "Ready",
          lastCalibration: latest.calibration_date || "Not Calibrated Yet",
          unit: latest.unit || "",
        };
  
        console.log("Setting current data:", newData);
        setCurrentData(newData);
      } catch (err) {
        console.error("Failed to fetch anomaly data", err);
        setCurrentData(null);
      }
    };
  
    fetchAnomalyData();
  }, [selectedSensor]);
  
  

  const getStatusColor = (status) => {
    switch (status) {
      case "Ready": return "bg-success text-success-foreground";
      case "Needs Calibration": return "bg-warning text-warning-foreground";
      case "Critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleMLCalibration = async () => {
    if (!selectedSensor || !currentData) return;

    const sensor = sensors.find(s => s.name === selectedSensor);
    if (!sensor) return;

    try {
      // Use enhanced ML calibration
      const response = await axios.post('http://127.0.0.1:8000/api/ml/calibration/apply/', {
        sensor_id: sensor.id,
        raw_value: currentData.measured
      });

      console.log("ML Calibration Result:", response.data);
      
      // Update current data with ML-corrected value
      setCurrentData(prev => ({
        ...prev,
        corrected: response.data.corrected_value,
        offset: (response.data.corrected_value - prev.measured).toFixed(2),
        status: "ML Calibrated"
      }));

      toast({
        title: "ML Calibration Applied",
        description: `Corrected value: ${response.data.corrected_value.toFixed(2)}`,
      });
    } catch (error) {
      console.error("ML calibration failed:", error);
      toast({
        title: "Error",
        description: "ML calibration failed",
        variant: "destructive"
      });
    }
  };

  const handleCalibration = async () => {
    if (!currentData || !selectedSensor) return;
    setIsCalibrating(true);
    console.log("Starting calibration for sensor:", selectedSensor);
  
    try {
      // Find the selected sensor's ID
      const sensorObj = sensors.find(s => s.name === selectedSensor);
      if (!sensorObj) throw new Error("Selected sensor not found");
  
      // Call backend API to apply calibration
      await axios.post("http://127.0.0.1:8000/api/calibration/apply/", {
        sensor: sensorObj.id,
        method: "linear",  // "auto" is not valid in your model choices
        corrected_value: parseFloat(currentData.corrected),
      });
      
  
      // Update current data: measured now becomes ideal
      const updatedData = {
        ...currentData,
        measured: currentData.ideal,   // measured reading now matches ideal
        corrected: currentData.ideal,  // corrected stays the same
        offset: 0,                     // offset zeroed after calibration
        status: "Ready",
        lastCalibration: new Date().toLocaleString(),
      };
  
      console.log("Calibration successful, updating current data:", updatedData);
      setCurrentData(updatedData);
  
      toast({
        title: "Calibration Complete",
        description: `Sensor successfully calibrated using ${calibrationMethod} method.`,
      });
    } catch (err) {
      console.error("Calibration failed", err);
      toast({
        title: "Calibration Failed",
        description: err.response?.data?.detail || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsCalibrating(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sensor Calibration</h1>
            <p className="text-muted-foreground mt-1">
              Calibrate and correct sensor readings for optimal accuracy
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow"
              onClick={handleCalibration}
              disabled={isCalibrating || !currentData}
            >
              {isCalibrating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Calibrating...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Apply Auto-Calibration
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleMLCalibration}
              disabled={isCalibrating || !currentData}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Brain className="w-4 h-4 mr-2" />
              <span>ML Calibration</span>
            </Button>
          </div>
        </div>

        {/* Sensor Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Select Sensor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedSensor || ""}
                onValueChange={val => {
                  console.log("Sensor selected:", val);
                  setSelectedSensor(val);
                }}
              >
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map(sensor => (
                    <SelectItem key={sensor.name} value={sensor.name}>
                      {sensor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Calibration Method */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Calibration Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={calibrationMethod} onValueChange={setCalibrationMethod}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-Calibration</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-2">
              <Badge className={getStatusColor(currentData?.status)}>
                {currentData?.status || "—"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Calibration Values */}
        {currentData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Current Readings</span>
                </CardTitle>
                <CardDescription>
                  Measured, ideal, and corrected values for sensor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Measured</p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentData.measured.toFixed(2)} {currentData.unit}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Ideal</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentData.ideal.toFixed(2)} {currentData.unit}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Corrected</p>
                    <p className="text-2xl font-bold text-success">
                      {currentData.corrected.toFixed(2)} {currentData.unit}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calibration Settings */}
            <Card className="bg-card border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-accent" />
                  <span>Calibration Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Calibration Status</span>
                  </h4>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success">
                      {currentData.status === 'Ready'
                        ? 'Sensor is within acceptable calibration parameters'
                        : currentData.status === 'Needs Calibration'
                        ? 'Calibration recommended to improve accuracy'
                        : 'Immediate calibration required - sensor drift detected'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default Calibration;
