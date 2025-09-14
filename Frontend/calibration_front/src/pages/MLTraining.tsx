import React from 'react';
import Navigation from '@/components/Navigation';
import MLAnalytics from '@/components/MLAnalytics';
import Footer from "@/components/Footer";


const MLTraining = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI/ML Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your AI/ML model performance and predictions
          </p>
        </div>
        <MLAnalytics />
      </div>
      <Footer/>
    </div>
  );
};

export default MLTraining;
