import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Target,
  TrendingUp,
  Zap,
  Activity,
  Users,
  Award,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const industries = [
    {
      name: "Aerospace",
      icon: Target,
      description: "Critical flight systems and navigation sensors require perfect calibration for passenger safety.",
      impact: "Zero tolerance for sensor failure in aircraft systems"
    },
    {
      name: "Defense",
      icon: Shield,
      description: "Military equipment and surveillance systems depend on accurate sensor data for mission success.",
      impact: "Lives depend on precise sensor accuracy"
    },
    {
      name: "Weather",
      icon: Activity,
      description: "Meteorological stations need calibrated sensors for accurate weather forecasting and climate monitoring.",
      impact: "Early warning systems save thousands of lives"
    },
    {
      name: "IoT",
      icon: Zap,
      description: "Industrial IoT networks with thousands of sensors require automated calibration at scale.",
      impact: "Smart cities and automation rely on sensor networks"
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Predictive Drift Detection",
      description: "AI algorithms analyze sensor behavior patterns to predict drift before it affects accuracy."
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "Continuous monitoring with instant alerts when sensors deviate from expected parameters."
    },
    {
      icon: Target,
      title: "Auto-Calibration",
      description: "Automated calibration procedures that correct sensor drift without human intervention."
    },
    {
      icon: Activity,
      title: "Performance Analytics",
      description: "Comprehensive reporting and analytics to optimize sensor network performance."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Mission Critical Sensor Protection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="text-foreground">The Problem:</span>
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                When Sensors Fail
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sensor drift is a silent killer. It starts small, unnoticed, then grows until critical systems 
              fail at the worst possible moment. Our AI/ML platform detects, predicts, and prevents sensor 
              failures before disasters happen.
            </p>
          </div>
        </div>

        {/* The Problem */}
        <Card className="mb-16 bg-gradient-to-br from-destructive/5 to-warning/5 border-destructive/20 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <span>The Hidden Danger</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background/50 rounded-lg border border-border">
                <div className="text-3xl font-bold text-destructive mb-2">737 MAX</div>
                <p className="text-sm text-muted-foreground">
                  Faulty sensor data led to two crashes and 346 deaths
                </p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg border border-border">
                <div className="text-3xl font-bold text-warning mb-2">$2.1B</div>
                <p className="text-sm text-muted-foreground">
                  Annual cost of sensor failures in manufacturing
                </p>
              </div>
              <div className="text-center p-6 bg-background/50 rounded-lg border border-border">
                <div className="text-3xl font-bold text-destructive mb-2">40%</div>
                <p className="text-sm text-muted-foreground">
                  Of industrial accidents caused by sensor malfunctions
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Traditional sensor maintenance is reactive. By the time drift is detected, 
                it's often too late. Critical systems have already been compromised.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Solution */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Our Solution: Predictive Sensor Intelligence
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We use advanced AI/ML algorithms to monitor sensor behavior, predict drift patterns, 
              and automatically calibrate systems before failures occur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card border-border shadow-card hover:shadow-glow hover:border-primary/30 transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Industries Impact */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industries We Protect</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From aerospace to IoT, we ensure sensor reliability where failure is not an option.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <Card key={index} className="bg-card border-border shadow-card hover:shadow-glow transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-lg transition-all">
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{industry.name}</CardTitle>
                        <CardDescription className="text-accent font-medium">
                          {industry.impact}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{industry.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <Card className="mb-16 bg-gradient-to-br from-success/5 to-primary/5 border-success/20 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-success">
              <Award className="w-6 h-6" />
              <span>Why Choose SensorGuard?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">99.9% Prediction Accuracy</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI models achieve industry-leading accuracy in drift prediction
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Real-time Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Sub-second response times for critical anomaly detection
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Automated Calibration</h3>
                    <p className="text-sm text-muted-foreground">
                      Self-healing systems that maintain accuracy without human intervention
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Enterprise Scale</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor millions of sensors across distributed networks
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">24/7 Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Continuous vigilance with instant alerts and notifications
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Compliance Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Meet regulatory requirements with comprehensive audit trails
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-primary shadow-glow border-primary/30">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                  Ready to Protect Your Sensors?
                </h2>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                  Join thousands of organizations that trust SensorGuard to prevent sensor failures 
                  and ensure mission-critical system reliability.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    Start Monitoring
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer/>
    </div>
  );
};

export default About;