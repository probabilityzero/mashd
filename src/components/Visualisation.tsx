import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { KnotDefinition } from '../types/knot';

interface KnotVisualizerProps {
  code: string;
  isDark: boolean;
  editingKnot: KnotDefinition | undefined;
  onDeleteKnot: (knotId: string) => void;
  onDownloadKnot: (knot: KnotDefinition | undefined) => void;
  setShowEditModal: (show: boolean) => void;
}

export const Visualisation: React.FC<KnotVisualizerProps> = ({ code, isDark, editingKnot, onDeleteKnot, onDownloadKnot, setShowEditModal }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const knotRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(isDark ? 0x000000 : 0xf8f9fa); // Black background in dark mode

    // Setup camera with improved field of view and position
    cameraRef.current = new THREE.PerspectiveCamera(
      60, // Reduced from 75 for a less zoomed view
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    
    // Position the camera further back with a lower elevation to shift view downward
    cameraRef.current.position.set(0, 0, 24); // Reduced Y from 5 to 2 to move view lower

    // Setup renderer with pixel ratio for better quality
    rendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'  
    });
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Setup controls with improved defaults
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controlsRef.current.enableDamping = true;
    controlsRef.current.dampingFactor = 0.05;
    controlsRef.current.rotateSpeed = 0.8;
    controlsRef.current.zoomSpeed = 1.2;
    
    // Set initial camera target to origin
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();

    // Add grid helper with transparency and adjusted colors
    const gridSize = 500; // Keeping the large grid size
    const divisions = 100; // Keeping the divisions
    const gridColor = isDark ? 0x333333 : 0xcccccc; // Grid line color
    const centerLineColor = isDark ? 0x555555 : 0x999999; // Center line color

    const gridHelper = new THREE.GridHelper(gridSize, divisions, centerLineColor, gridColor);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;

    sceneRef.current.add(gridHelper);

    // Add axes helper with better visibility
    const axesHelper = new THREE.AxesHelper(10); // Slightly increased for better visibility
    sceneRef.current.add(axesHelper);

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    // Animation loop with fps optimization
    let lastTime = 0;
    const animate = (time: number) => {
      requestAnimationFrame(animate);
      
      // Limit to ~60fps for better performance
      if (time - lastTime < 16) return;
      lastTime = time;
      
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    requestAnimationFrame(animate);

    // Improved resize handler with debouncing
    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      
      resizeTimeout = window.setTimeout(() => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!sceneRef.current || !code) return;

    // Remove existing knot
    if (knotRef.current) {
      sceneRef.current.remove(knotRef.current);
    }

    try {
      // Create points for the knot with more detail
      const points: THREE.Vector3[] = [];
      const steps = 300; // Increased from 200 for smoother curves
      const scale = 4.0; // Reduced from 6.0 to make knot less zoomed
      const generatePoints = new Function('t', code + '\nreturn generatePoints(t);');

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        let [x, y, z] = generatePoints(t);
        x *= scale;
        y *= scale;
        z *= scale;
        points.push(new THREE.Vector3(x, y, z));
      }

      // Create the knot geometry with improved material
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isDark ? 0x60a5fa : 0x3b82f6,
        linewidth: 2
      });
      
      // Add line thickness effect using a tube geometry
      if (points.length > 1) {
        // Create a smooth curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 300, 0.1, 8, true);
        const tubeMaterial = new THREE.MeshBasicMaterial({
          color: isDark ? 0x60a5fa : 0x3b82f6,
          wireframe: false,
          transparent: true,
          opacity: 0.8
        });
        
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        sceneRef.current.add(tube);
        
        // Store tube as knot ref
        knotRef.current = tube as unknown as THREE.Line;
      } else {
        // Fallback to line if not enough points
        knotRef.current = new THREE.Line(geometry, material);
        sceneRef.current.add(knotRef.current);
      }
      
      // Auto-center the camera view on the knot
      if (controlsRef.current && knotRef.current) {
        const center = new THREE.Vector3();
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          geometry.boundingBox.getCenter(center);
          controlsRef.current.target.copy(center);
          controlsRef.current.update();
        }
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
    }
  }, [code, isDark]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};