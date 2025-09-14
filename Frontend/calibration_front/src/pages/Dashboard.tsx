/* eslint-disable @typescript-eslint/no-explicit-any */
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Thermometer,
  Gauge,
  Zap,
  Wifi,
  RefreshCw
} from "lucide-react";
import { useSensors } from "@/contexts/SensorContext";

const Dashboard = () => {
  const { sensors, lastUpdate, refreshSensors } = useSensors();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'offline': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'offline': return <Wifi className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'Temperature': return <Thermometer className="w-5 h-5" />;
      case 'Pressure': return <Gauge className="w-5 h-5" />;
      case 'Humidity': return <Activity className="w-5 h-5" />;
      case 'Vibration': return <TrendingUp className="w-5 h-5" />;
      case 'Flow': return <Zap className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const stats = {
    total: sensors.length,
    online: sensors.filter(s => s.status === 'online').length,
    warning: sensors.filter(s => s.status === 'warning').length,
    critical: sensors.filter(s => s.status === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sensor Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your sensors in real-time • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshSensors()}
            className="border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Active monitoring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.online}</div>
              <p className="text-xs text-muted-foreground">Operating normally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.warning}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">Immediate action</p>
            </CardContent>
          </Card>
        </div>

        {/* Sensor Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Live Sensor Data</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live updates every 10s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sensors.map((sensor) => (
              <Card key={sensor.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {/* Left: Icon + Name */}
                    <div className="flex items-center space-x-2 truncate">
                      <div className="text-primary flex-shrink-0">{getSensorIcon(sensor.type)}</div>
                      <CardTitle className="text-sm font-medium truncate">{sensor.name}</CardTitle>
                    </div>

                    {/* Right: Status Badge */}
                    <Badge className={`${getStatusColor(sensor.status)} text-xs flex-shrink-0 max-w-[120px] truncate`}>
                      <div className="flex items-center space-x-1 truncate">
                        {getStatusIcon(sensor.status)}
                        <span className="capitalize truncate">{sensor.status}</span>
                      </div>
                    </Badge>
                  </div>
                  <CardDescription className="text-xs truncate">{sensor.type} Sensor</CardDescription>
                </CardHeader>


                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {sensor.value.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Current Reading</p>
                    </div>

                    <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Drift:</span>
                      <span
                        className={`ml-1 font-medium ${
                          Math.abs(Number(sensor.drift)) > 3
                            ? "text-destructive"
                            : Math.abs(Number(sensor.drift)) > 1
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {Number(sensor.drift) > 0 ? "+" : ""}
                        {Number(sensor.drift).toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(String(sensor.lastUpdated)).toLocaleTimeString()}
                    </div>
                  </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default Dashboard;
