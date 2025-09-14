import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";

interface Sensor {
  id: number;
  name: string;
  type: string;
  value: number;
  status: string;
  drift: number;
}

interface ModelInfo {
  filename: string;
  model_type: string;
  sensor_name: string;
  created_at: string;
  size_kb: number;
}

interface MLStats {
  totalModels: number;
  activeModels: number;
  avgAccuracy: number;
  totalPredictions: number;
  anomalyDetectionRate: number;
  driftPredictionAccuracy: number;
  calibrationImprovement: number;
}

interface RecentPrediction {
  sensor_name: string;
  prediction_type: string;
  result: any;
  timestamp: string;
  confidence: number;
}

const MLAnalytics: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo[]>([]);
  const [mlStats, setMlStats] = useState<MLStats>({
    totalModels: 0,
    activeModels: 0,
    avgAccuracy: 0,
    totalPredictions: 0,
    anomalyDetectionRate: 0,
    driftPredictionAccuracy: 0,
    calibrationImprovement: 0
  });
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMLData();
    const interval = setInterval(fetchMLData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMLData = async () => {
    try {
      const [sensorsRes, analyticsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/sensors/'),
        axios.get('http://127.0.0.1:8000/api/ml/analytics/')
      ]);

      setSensors(sensorsRes.data);
      
      // Use real analytics data from backend
      const analytics = analyticsRes.data;
      setModelInfo(analytics.model_info || []);
      
      setMlStats({
        totalModels: analytics.total_models || 0,
        activeModels: analytics.active_models || 0,
        avgAccuracy: analytics.anomaly_detection_rate || 0,
        totalPredictions: analytics.total_readings || 0,
        anomalyDetectionRate: analytics.anomaly_detection_rate || 0,
        driftPredictionAccuracy: analytics.drift_prediction_accuracy || 0,
        calibrationImprovement: analytics.calibration_improvement || 0
      });

      setRecentPredictions(analytics.recent_predictions || []);

    } catch (error) {
      console.error('Failed to fetch ML data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ML analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'drift': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'calibration': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'anomaly': return 'bg-red-100 text-red-800';
      case 'drift': return 'bg-blue-100 text-blue-800';
      case 'calibration': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPredictionTypeColor = (type: string) => {
    switch (type) {
      case 'anomaly': return 'text-red-600';
      case 'drift': return 'text-blue-600';
      case 'calibration': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ML Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{mlStats.totalModels}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Models</p>
                <p className="text-2xl font-bold text-green-600">{mlStats.activeModels}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold">{mlStats.avgAccuracy.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Predictions</p>
                <p className="text-2xl font-bold">{mlStats.totalPredictions.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Performance
            </CardTitle>
            <CardDescription>
              Current performance metrics of your AI/ML models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Anomaly Detection Rate</span>
                <span>{mlStats.anomalyDetectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={mlStats.anomalyDetectionRate} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Drift Prediction Accuracy</span>
                <span>{mlStats.driftPredictionAccuracy.toFixed(1)}%</span>
              </div>
              <Progress value={mlStats.driftPredictionAccuracy} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Calibration Improvement</span>
                <span>{mlStats.calibrationImprovement.toFixed(1)}%</span>
              </div>
              <Progress value={mlStats.calibrationImprovement} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Predictions
            </CardTitle>
            <CardDescription>
              Latest AI/ML predictions and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentPredictions.length > 0 ? (
              <div className="space-y-3">
                {recentPredictions.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {prediction.result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{prediction.sensor_name}</p>
                        <p className={`text-sm ${getPredictionTypeColor(prediction.prediction_type)}`}>
                          {prediction.prediction_type} prediction
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{prediction.confidence.toFixed(0)}%</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(prediction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent predictions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trained Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Trained Models
          </CardTitle>
          <CardDescription>
            AI/ML models currently deployed for your sensors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelInfo.length > 0 ? (
            <div className="space-y-3">
              {modelInfo.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getModelTypeIcon(model.model_type)}
                    <div>
                      <p className="font-medium">{model.sensor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {model.model_type} model • {model.size_kb}KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getModelTypeColor(model.model_type)}>
                      {model.model_type}
                    </Badge>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{new Date(model.created_at).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(model.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trained models found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Models are automatically trained in the background when sufficient data is available
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MLAnalytics;
