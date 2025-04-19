
import React from 'react';
import { Leaf } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative py-16 px-6 overflow-hidden">
      <div className="leaf-pattern-bg absolute inset-0 opacity-10"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block mb-6 bg-primary/20 p-3 rounded-full">
          <Leaf className="h-10 w-10 text-primary animate-leaf-float" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
          Identify Any Plant <span className="text-primary">Instantly</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Upload a photo of Potato plant and our Model will identify the image disease.
        </p>
      </div>
    </div>
  );
};

export default Hero;
