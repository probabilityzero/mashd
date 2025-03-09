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

    // Setup camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 10;

    // Setup renderer
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Setup controls
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controlsRef.current.enableDamping = true;

    // Add grid helper with transparency and adjusted colors
    const gridSize = 500; // Increased grid size for 'endless' feel
    const divisions = 100; // Increased divisions for smaller grid box gap
    const gridColor = isDark ? 0x333333 : 0xcccccc; // Grid line color
    const centerLineColor = isDark ? 0x555555 : 0x999999; // Center line color

    const gridHelper = new THREE.GridHelper(gridSize, divisions, centerLineColor, gridColor);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;

    sceneRef.current.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(7); // Increased axes helper length
    sceneRef.current.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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
      // Create points for the knot
      const points: THREE.Vector3[] = [];
      const steps = 200;
      const scale = 6.0; // Scaling factor to make the knot bigger, almost thrice
      const generatePoints = new Function('t', code + '\nreturn generatePoints(t);');

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        let [x, y, z] = generatePoints(t);
        x *= scale;
        y *= scale;
        z *= scale;
        points.push(new THREE.Vector3(x, y, z));
      }

      // Create the knot geometry
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isDark ? 0x60a5fa : 0x3b82f6,
        linewidth: 2
      });
      knotRef.current = new THREE.Line(geometry, material);
      sceneRef.current.add(knotRef.current);
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
