import * as React from 'react';

declare module 'lucide-react';
declare module 'framer-motion';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      meshStandardMaterial: any;
      points: any;
      pointsMaterial: any;
      lineSegments: any;
      lineBasicMaterial: any;
      bufferGeometry: any;
      bufferAttribute: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any;
        ambientLight: any;
        pointLight: any;
        directionalLight: any;
        meshStandardMaterial: any;
        points: any;
        pointsMaterial: any;
        lineSegments: any;
        lineBasicMaterial: any;
        bufferGeometry: any;
        bufferAttribute: any;
      }
    }
  }
}
