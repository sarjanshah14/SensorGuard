import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, Shield, TrendingUp, Zap } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SensorGuard
              </span>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-card">
        <div className="absolute inset-0 bg-gradient-glow opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-foreground">When Sensors</span>
                  <br />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Fail, Disasters
                  </span>
                  <br />
                  <span className="text-foreground">Happen.</span>
                </h1>
                <div className="w-24 h-1 bg-gradient-primary rounded-full"></div>
              </div>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                We prevent that. Our AI-powered platform monitors, predicts, and corrects 
                sensor drift in real-time, ensuring your critical systems never fail when it matters most.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-glow animate-pulse-glow"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Start Monitoring
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/10">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <div>
                    <h3 className="font-semibold text-sm">Drift Prediction</h3>
                    <p className="text-xs text-muted-foreground">AI-powered forecasting</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border">
                  <Zap className="w-8 h-8 text-warning" />
                  <div>
                    <h3 className="font-semibold text-sm">Real-time Alerts</h3>
                    <p className="text-xs text-muted-foreground">Instant notifications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-card/50 rounded-lg border border-border">
                  <Shield className="w-8 h-8 text-success" />
                  <div>
                    <h3 className="font-semibold text-sm">Auto Calibration</h3>
                    <p className="text-xs text-muted-foreground">Self-healing systems</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="AI Sensor Monitoring Platform" 
                className="relative z-10 w-full h-auto rounded-2xl shadow-card border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Trusted by Critical Industries</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From aerospace to IoT, our platform ensures sensor reliability where failure is not an option.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Aerospace', 'Defense', 'Weather', 'IoT'].map((industry) => (
              <div key={industry} className="text-center p-6 bg-card rounded-lg border border-border hover:shadow-glow transition-all duration-300 group">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{industry}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SensorGuard</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SensorGuard. Preventing sensor failures before they happen.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;