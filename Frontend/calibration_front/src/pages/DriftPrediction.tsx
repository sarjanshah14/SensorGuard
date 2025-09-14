import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Calendar, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSensors } from "@/contexts/SensorContext";

const DriftPrediction = () => {
  const { sensors, readings } = useSensors();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(""); // store the unit
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [calibrationSchedule, setCalibrationSchedule] = useState(null);

  // Set initial sensor when sensors are loaded
  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].name);
      setSelectedUnit(sensors[0].unit || "");
    }
  }, [sensors, selectedSensor]);

  // Update unit whenever sensor changes
  useEffect(() => {
    const sensor = sensors.find(s => s.name === selectedSensor);
    setSelectedUnit(sensor?.unit || "");
  }, [selectedSensor, sensors]);

  // Fetch ML predictions when sensor changes
  useEffect(() => {
    if (!selectedSensor) return;

    const sensor = sensors.find(s => s.name === selectedSensor);
    if (!sensor) return;

    const fetchMLPredictions = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/ml/drift/predict/?sensor_id=${sensor.id}&future_points=5`
        );
        console.log("ML Drift Predictions:", res.data);
        setMlPredictions(res.data);
        
        // Calculate predicted calibration dates based on drift predictions
        const predictions = res.data.predictions || [];
        const currentDate = new Date();
        const calibrationDates = [];
        
        predictions.forEach((drift, index) => {
          if (Math.abs(drift) > 5) { // If drift exceeds 5%, suggest calibration
            const daysFromNow = (index + 1) * 2; // Assuming 2-day intervals
            const calibrationDate = new Date(currentDate.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
            calibrationDates.push({
              date: calibrationDate,
              reason: `Predicted drift: ${drift.toFixed(1)}%`,
              priority: Math.abs(drift) > 10 ? 'High' : 'Medium'
            });
          }
        });
        
        setCalibrationSchedule(calibrationDates);
        
        // Also fetch detailed calibration schedule from backend
        try {
          const scheduleRes = await axios.get(
            `http://127.0.0.1:8000/api/ml/calibration-schedule/?sensor_id=${sensor.id}`
          );
          console.log("Calibration Schedule:", scheduleRes.data);
          
          // Update calibration schedule with backend data if available
          if (scheduleRes.data.calibration_schedule) {
            const backendSchedule = scheduleRes.data.calibration_schedule.map(item => ({
              date: new Date(item.date),
              reason: item.reason,
              priority: item.priority,
              confidence: item.confidence
            }));
            setCalibrationSchedule(backendSchedule);
          }
        } catch (scheduleErr) {
          console.error("Failed to fetch calibration schedule:", scheduleErr);
          // Keep the frontend-calculated schedule as fallback
        }
        
      } catch (err) {
        console.error("Failed to fetch ML predictions", err);
        setMlPredictions(null);
        setCalibrationSchedule(null);
      }
    };

    fetchMLPredictions();
  }, [selectedSensor, sensors]);

  // Get readings for the selected sensor
  const selectedSensorData = sensors.find(s => s.name === selectedSensor);
  const sensorReadings = selectedSensorData ? readings[selectedSensorData.id] || [] : [];
  const latestReading = sensorReadings.length > 0 ? sensorReadings[sensorReadings.length - 1] : null;

  const getRiskColor = (status) => {
    switch (status) {
      case "online": return "bg-success text-success-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      case "critical": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Drift Prediction</h1>
            <p className="text-muted-foreground mt-1">AI-powered sensor drift forecasting and analysis</p>
          </div>
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow">
            <Target className="w-4 h-4 mr-2" /> Calibrate Selected
          </Button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Select Sensor</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSensor || ""} onValueChange={setSelectedSensor}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensors.map(sensor => (
                    <SelectItem key={sensor.id} value={sensor.name}>
                      {sensor.name} ({sensor.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Live Chart */}
        <Card className="mb-8 bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Drift Prediction Chart</span>
            </CardTitle>
            <CardDescription>
              Actual readings for {selectedSensor || "—"} ({selectedUnit})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorReadings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" type="category" />
                  <YAxis unit={` ${selectedUnit}`} />
                  <Tooltip formatter={(value) => `${value} ${selectedUnit}`} />
                  <Line
                    type="monotone"
                    dataKey="raw_value"
                    stroke="#22c55e"
                    isAnimationActive={true}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-accent" />
                <span>Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {latestReading ? (
                <>
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Current Reading</span>
                    <span className="text-lg font-bold text-primary">
                      {latestReading.raw_value} {selectedUnit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Drift</span>
                    <span className="text-sm font-bold">{latestReading.drift}%</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getRiskColor(latestReading.status)}>
                      {latestReading.status}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-warning" />
                <span>AI/ML Drift Analysis & Predictions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mlPredictions ? (
                <div className="space-y-4">
                  {/* ML Predictions Summary */}
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span>ML Drift Predictions</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Model Used:</span>
                        <p className="font-medium">{mlPredictions.model_used || 'Trained Model'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{(mlPredictions.confidence * 100 || 85).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Future Drift Predictions */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>Future Drift Forecast</span>
                    </h4>
                    <div className="space-y-2">
                      {mlPredictions.predictions?.map((drift, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">Day {(index + 1) * 2}</p>
                              <p className="text-sm text-muted-foreground">Predicted drift</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${Math.abs(drift) > 5 ? 'text-red-600' : Math.abs(drift) > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {drift > 0 ? '+' : ''}{drift.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.abs(drift) > 5 ? 'High Risk' : Math.abs(drift) > 2 ? 'Medium Risk' : 'Low Risk'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calibration Schedule */}
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span>AI-Predicted Calibration Schedule</span>
                    </h4>
                    {calibrationSchedule && calibrationSchedule.length > 0 ? (
                      <div className="space-y-2">
                        {calibrationSchedule.map((schedule, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                schedule.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                <Calendar className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium">{schedule.date.toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">{schedule.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={schedule.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                {schedule.priority} Priority
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Math.ceil((schedule.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days from now
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <Activity className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800">No Calibration Needed</p>
                            <p className="text-sm text-green-600">AI predicts stable drift within acceptable limits</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading AI/ML predictions...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Analyzing sensor data and generating drift forecasts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default DriftPrediction;
