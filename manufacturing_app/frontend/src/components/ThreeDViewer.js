// frontend/src/components/ThreeDViewer.js
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Grid } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// ─────────────────────────────────────────────────────────────
// 3D Model Component (MUST be inside Canvas)
// ─────────────────────────────────────────────────────────────
function STLModel({ url }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef();

  useEffect(() => {
    if (geometry && meshRef.current) {
      geometry.center();
      meshRef.current.geometry = geometry;
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#4CAF50" 
        metalness={0.3} 
        roughness={0.7}
        envMapIntensity={1}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading Fallback (HTML - MUST be outside Canvas)
// ─────────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      color: '#666',
      fontSize: '14px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e0e0e0',
        borderTop: '3px solid #4CAF50',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span>Memuat model 3D...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty State Placeholder (HTML - MUST be outside Canvas)
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      width: '100%',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed #ccc',
      borderRadius: '12px',
      backgroundColor: '#fafafa',
      color: '#999',
      fontSize: '14px',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <span style={{ fontSize: '32px' }}>📦</span>
      <span>Upload file 3D untuk melihat preview</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const ThreeDViewer = ({ fileUrl }) => {
  // Show placeholder if no file URL
  if (!fileUrl) {
    return <EmptyState />;
  }

  return (
    // ⚠️ OUTER CONTAINER: HTML div (outside Canvas)
    <div style={{
      width: '100%',
      height: '400px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
      position: 'relative'
    }}>
      {/* ⚠️ CANVAS: Only Three.js objects go inside here */}
      <Canvas
        camera={{ position: [0, 0, 150], fov: 45 }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.8} preset="rembrandt">
            <STLModel url={fileUrl} />
          </Stage>
          
          {/* Three.js objects only */}
          <Environment preset="city" />
          <Grid 
            position={[0, -40, 0]} 
            args={[200, 200]} 
            cellColor="#bdbdbd" 
            sectionColor="#9e9e9e"
            sectionThickness={1.5}
            cellThickness={0.5}
            fadeDistance={300}
            fadeStrength={1}
          />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={0.8} 
            castShadow 
          />
        </Suspense>
        
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.5}
          enablePan={true}
          enableZoom={true}
          minDistance={50}
          maxDistance={500}
          makeDefault
        />
      </Canvas>
      
      {/* ⚠️ HTML OVERLAY: Outside Canvas, absolutely positioned */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        padding: '6px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        borderRadius: '6px',
        fontSize: '11px',
        pointerEvents: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: 10
      }}>
        💡 Drag untuk rotasi • Scroll untuk zoom • Right-click untuk pan
      </div>
    </div>
  );
};

export default ThreeDViewer;