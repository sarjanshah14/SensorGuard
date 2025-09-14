/* eslint-disable @typescript-eslint/no-explicit-any */
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Download, 
  Filter, 
  Search,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

// ✅ Replace mock data with backend fetch
const Anomalies = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [visibleCount, setVisibleCount] = useState(20); // 🔹 Show only 20 initially

  // Fetch anomalies from Django backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/anomalies/") // adjust if using a different backend URL
      .then((res) => res.json())
      .then((data) => {
        setAnomalies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching anomalies:", err);
        setLoading(false);
      });
  }, []);

  const filteredAnomalies = anomalies.filter((anomaly) => {
    const matchesSearch =
      anomaly.sensor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || anomaly.type === filterType;
    const matchesSeverity = filterSeverity === "all" || anomaly.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "High":
        return "bg-orange-500 text-white";
      case "Critical":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    total: anomalies.length,
    resolved: anomalies.filter((a) => a.resolved).length,
    critical: anomalies.filter((a) => a.severity === "Critical").length,
    lastHour: anomalies.filter(
      (a) => new Date().getTime() - new Date(a.timestamp).getTime() < 3600000
    ).length,
  };

  // --- CSV Export ---
  const handleExportCSV = () => {
    if (anomalies.length === 0) return;

    const headers = [
      "Timestamp",
      "Sensor",
      "Type",
      "Value",
      "Expected",
      "Deviation",
      "Severity",
      "Status",
    ];

    const rows = anomalies.map((a) => [
      `${new Date(a.timestamp).toLocaleDateString()} ${new Date(a.timestamp).toLocaleTimeString()}`,
      a.sensor_name,
      a.type,
      a.value,
      a.expected,
      a.deviation.toFixed(2) + "%",
      a.severity,
      a.resolved ? "Resolved" : "Active",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "anomalies_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PDF Export ---
  const handleExportPDF = () => {
    if (anomalies.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Anomalies Report", 10, 10);

    const tableRows = anomalies.map((a) => [
      `${new Date(a.timestamp).toLocaleDateString()} ${new Date(a.timestamp).toLocaleTimeString()}`,
      a.sensor_name,
      a.type,
      a.value,
      a.expected,
      a.deviation.toFixed(2) + "%",
      a.severity,
      a.resolved ? "Resolved" : "Active",
    ]);

    let y = 20;
    doc.setFontSize(10);
    tableRows.forEach((row) => {
      doc.text(row.join(" | "), 10, y);
      y += 8;
      if (y > 280) { // new page
        doc.addPage();
        y = 10;
      }
    });

    doc.save("anomalies_report.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading anomalies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Anomaly Detection</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze sensor anomalies across your network
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time detections</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.resolved / stats.total) * 100).toFixed(1)}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Hour</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.lastHour}</div>
              <p className="text-xs text-muted-foreground">Recent detections</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sensors or types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Drift">Drift</SelectItem>
                  <SelectItem value="Spike">Spike</SelectItem>
                  <SelectItem value="Dropout">Dropout</SelectItem>
                  <SelectItem value="Noise">Noise</SelectItem>
                  <SelectItem value="Calibration Error">Calibration Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="bg-background/50 border-border">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Anomalies Table */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>
              Showing {Math.min(visibleCount, filteredAnomalies.length)} of {filteredAnomalies.length} anomalies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Sensor</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Value</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Expected</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Deviation</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Severity</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnomalies.slice(0, visibleCount).map((anomaly) => (
                    <tr
                      key={anomaly.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 text-sm">
                        {new Date(anomaly.timestamp).toLocaleDateString()}{" "}
                        {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-sm font-medium">{anomaly.sensor_name}</td>
                      <td className="p-4 text-sm">{anomaly.type}</td>
                      <td className="p-4 text-sm font-mono">{anomaly.value}</td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">
                        {anomaly.expected}
                      </td>
                      <td className="p-4 text-sm font-mono text-warning">{anomaly.deviation.toFixed(2)}%</td>
                      <td className="p-4">
                        <Badge className={`${getSeverityColor(anomaly.severity)} text-xs`}>
                          {anomaly.severity}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={anomaly.resolved ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {anomaly.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {visibleCount < filteredAnomalies.length && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setVisibleCount((prev) => prev + 50)}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
};

export default Anomalies;
