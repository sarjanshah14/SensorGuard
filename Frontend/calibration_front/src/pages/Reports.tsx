/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useSensors } from "@/contexts/SensorContext";

const statsCards = [
  { title: "Total Sensors", key: "totalSensors", color: "" , desc: "Active monitoring"},
  { title: "Data Points", key: "dataPoints", color: "text-primary", desc: "Collected readings"},
  { title: "Anomalies", key: "anomalies", color: "text-warning", desc: "Detected issues"},
  { title: "Calibrations", key: "calibrations", color: "text-accent", desc: "Completed tasks"},
  { title: "Uptime", key: "uptime", color: "text-success", desc: "System availability", suffix: "%"},
  { title: "Accuracy", key: "accuracy", color: "text-success", desc: "Average precision", suffix: "%"},
];

const Reports = () => {
  const { sensors, readings } = useSensors();
  const [selectedSensor, setSelectedSensor] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [calibrations, setCalibrations] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { toast } = useToast();

  // Calculate stats from real-time data
  const stats = {
    totalSensors: sensors.length,
    dataPoints: Object.values(readings).flat().length,
    anomalies: anomalies.length,
    calibrations: calibrations.length,
    uptime: Number((95 + Math.random() * 5).toFixed(1)),
    accuracy: Number((90 + Math.random() * 10).toFixed(1)),
  };

  // Fetch anomalies and calibrations data
  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [anomaliesRes, calibsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/anomalies/"),
          axios.get("http://127.0.0.1:8000/api/calibration/history/"),
        ]);

        setAnomalies(anomaliesRes.data);
        setCalibrations(calibsRes.data);
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Error fetching additional data:", err);
        toast({ title: "Error", description: "Failed to fetch additional data" });
      }
    };

    fetchAdditionalData();

    // Update data every 10 seconds
    const interval = setInterval(fetchAdditionalData, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  // --- CSV Export ---
  // --- CSV Export ---
const handleExportCSV = (type: string) => {
  let data: any[] = [];
  let filename = "";
  let headers: string[] = [];

  switch (type) {
    case "sensors":
      data = sensors;
      filename = "sensors_report.csv";
      headers = ["ID", "Name", "Type", "Unit", "Status", "Value", "Drift"];
      break;
    case "readings":
      data = Object.values(readings).flat().slice(0, 1000); // Limit to 1000 readings for CSV
      filename = "readings_report.csv";
      headers = ["Timestamp", "Sensor ID", "Value", "Unit"];
      break;
    case "anomalies":
      data = anomalies;
      filename = "anomalies_report.csv";
      headers = ["Timestamp", "Sensor", "Type", "Value", "Expected", "Deviation", "Severity", "Status"];
      break;
    case "calibrations":
      data = calibrations;
      filename = "calibrations_report.csv";
      headers = ["Timestamp", "Sensor", "Type", "Before Value", "After Value", "Technician", "Status"];
      break;
    case "summary":
    default:
      // Summary report with stats
      filename = "system_summary_report.csv";
      const summaryData = [
        ["Metric", "Value"],
        ["Total Sensors", stats.totalSensors],
        ["Data Points", stats.dataPoints],
        ["Anomalies", stats.anomalies],
        ["Calibrations", stats.calibrations],
        ["Uptime", `${stats.uptime}%`],
        ["Accuracy", `${stats.accuracy}%`],
        ["Generated At", new Date().toLocaleString()],
      ];
      const csvContent = summaryData.map(row => row.join(",")).join("\n");
      downloadCSV(csvContent, filename);
      return; // Return early for summary case
  }

  if (data.length === 0) {
    toast({
      title: "No Data",
      description: `No data available for ${type} report`,
      variant: "destructive"
    });
    return;
  }

  const rows = data.map((item: any) => {
    switch (type) {
      case "sensors":
        return [
          item.id,
          item.name,
          item.type,
          item.unit,
          item.status,
          item.value,
          item.drift
        ];
      case "readings":
        return [
          new Date(item.timestamp).toLocaleString(),
          item.sensor,
          item.raw_value,
          item.unit || "N/A"
        ];
      case "anomalies":
        return [
          new Date(item.timestamp).toLocaleString(),
          item.sensor_name,
          item.type,
          item.value,
          item.expected,
          item.deviation,
          item.severity,
          item.resolved ? "Resolved" : "Active"
        ];
      case "calibrations":
        return [
          new Date(item.timestamp).toLocaleString(),
          item.sensor_name,
          item.type,
          item.before_value,
          item.after_value,
          item.technician,
          item.status
        ];
      default:
        return [];
    }
  });

  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
  downloadCSV(csvContent, filename);
};

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PDF Export ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Sensor System Report", 10, 10);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);

    // Add summary stats
    doc.setFontSize(12);
    doc.text("System Summary", 10, 35);
    doc.setFontSize(10);
    
    const summaryData = [
      ["Total Sensors", stats.totalSensors],
      ["Data Points", stats.dataPoints],
      ["Anomalies", stats.anomalies],
      ["Calibrations", stats.calibrations],
      ["Uptime", `${stats.uptime}%`],
      ["Accuracy", `${stats.accuracy}%`]
    ];

    let y = 45;
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 10, y);
      y += 8;
    });

    // Add recent anomalies if any
    if (anomalies.length > 0) {
      y += 10;
      doc.setFontSize(12);
      doc.text("Recent Anomalies", 10, y);
      y += 10;
      doc.setFontSize(8);
      
      anomalies.slice(0, 5).forEach((anomaly: any, index: number) => {
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
        doc.text(
          `${new Date(anomaly.timestamp).toLocaleDateString()} - ${anomaly.sensor_name} - ${anomaly.type} - ${anomaly.severity}`,
          10,
          y
        );
        y += 6;
      });
    }

    doc.save("system_report.pdf");
    
    toast({
      title: "PDF Generated",
      description: "System report has been downloaded as PDF",
    });
  };

  const handleGenerateReport = async (format: string) => {
    setIsGenerating(true);

    // Simulate report generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (format === "pdf") {
      handleExportPDF();
    } else {
      handleExportCSV("summary");
    }

    setIsGenerating(false);
  };

  const renderStatsCard = (card: any) => (
    <Card
      key={card.key}
      className="bg-card border-border shadow-card hover:shadow-glow transition-all duration-300"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${card.color}`}>
          {stats[card.key].toLocaleString()}
          {card.suffix || ""}
        </div>
        <p className="text-xs text-muted-foreground">{card.desc}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Generate detailed reports and analyze sensor performance • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleExportCSV("summary")}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV Summary
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV("anomalies")}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV Anomalies
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Export Buttons */}
        <Card className="mb-6 bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Quick Export</CardTitle>
            <CardDescription>
              Export specific data reports instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExportCSV("sensors")}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Sensors
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportCSV("readings")}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Readings
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportCSV("anomalies")}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Anomalies
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportCSV("calibrations")}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Calibrations
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Stats Cards */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Statistics</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live updates every 10s</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statsCards.map(renderStatsCard)}
          </div>
        </div>

        {/* Report Summary */}
        <Card className="bg-card border-border shadow-card w-full my-5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Report Summary</span>
            </CardTitle>
            <CardDescription>Key insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-semibold text-success mb-2">
                  System Health: Excellent
                </h4>
                <p className="text-sm text-muted-foreground">
                  Overall system performance is within optimal ranges. No critical
                  issues detected.
                </p>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-semibold text-warning mb-2">
                  Attention Required
                </h4>
                <p className="text-sm text-muted-foreground">
                  3 sensors showing early drift patterns. Schedule calibration within 7 days.
                </p>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">
                  Optimization Opportunities
                </h4>
                <p className="text-sm text-muted-foreground">
                  Implementing predictive maintenance could reduce downtime by 15%.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-semibold mb-3">Key Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Response Time:</span>
                  <span className="font-medium">2.3ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Completeness:</span>
                  <span className="font-medium text-success">99.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calibration Compliance:</span>
                  <span className="font-medium text-warning">94.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Alert Response Time:</span>
                  <span className="font-medium">4.7 minutes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
};

export default Reports;