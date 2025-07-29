import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CaptainCortexAvatarProps {
  className?: string;
  size?: number;
}

const CaptainCortexAvatar: React.FC<CaptainCortexAvatarProps> = ({ 
  className = "", 
  size = 100 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.borderRadius = '50%';
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // GLB Loader setup
    const loadGLB = async () => {
      try {
        // Import GLTFLoader dynamically
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();

        // Load the GLB file
        loader.load(
          '/captain-cortex-avatar.glb',
          (gltf) => {
            console.log('GLB file loaded, processing model...');
            const model = gltf.scene;
            
            // Calculate model bounds and fit to camera view
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            // Get the largest dimension to scale appropriately
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            
            // Scale to fit nicely in view
            const scale = 1.5 / maxDim;
            model.scale.setScalar(scale);
            
            // Center the model at origin
            model.position.copy(center).multiplyScalar(-scale);
            
            console.log('Model positioning:', {
              originalSize: size,
              center: center,
              scale: scale,
              newPosition: model.position,
              cameraPosition: camera.position
            });
            
            // Add very bright lighting for maximum visibility
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
            scene.add(ambientLight);
            
            const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight1.position.set(5, 5, 5);
            directionalLight1.castShadow = false;
            scene.add(directionalLight1);
            
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight2.position.set(-5, -5, 5);
            scene.add(directionalLight2);
            
            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(0, 0, 5);
            scene.add(pointLight);
            
            scene.add(model);
            console.log('Captain Cortex 3D model added to scene!');

            // Animation setup if available
            let mixer: THREE.AnimationMixer | null = null;
            if (gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(model);
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
            }

            // Animation loop
            const animate = () => {
              animationIdRef.current = requestAnimationFrame(animate);
              
              if (mixer) {
                mixer.update(0.016); // 60 FPS
              }
              
              // Rotate the model slowly
              model.rotation.y += 0.01;
              
              // Keep camera focused on the model
              camera.lookAt(0, 0, 0);
              
              renderer.render(scene, camera);
            };
            
            animate();
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
          },
          (error) => {
            console.error('Error loading GLB model:', error);
            console.error('Error details:', error);
            // Fallback to simple avatar
            createFallbackAvatar(scene);
          }
        );
      } catch (error) {
        console.error('Error importing GLTFLoader:', error);
        // Fallback to simple avatar
        createFallbackAvatar(scene);
      }
    };

    // Fallback avatar creation
    const createFallbackAvatar = (scene: THREE.Scene) => {
      console.log('Creating fallback Captain Cortex avatar');
      
      // Create a simple animated captain avatar properly positioned
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x4f46e5 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(0, 0, 0);
      
      // Add captain hat
      const hatGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.3, 32);
      const hatMaterial = new THREE.MeshPhongMaterial({ color: 0x1e1b4b });
      const hat = new THREE.Mesh(hatGeometry, hatMaterial);
      hat.position.set(0, 1.1, 0);
      
      // Add hat brim
      const brimGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 32);
      const brimMaterial = new THREE.MeshPhongMaterial({ color: 0x1e1b4b });
      const brim = new THREE.Mesh(brimGeometry, brimMaterial);
      brim.position.set(0, 1.0, 0);
      
      scene.add(sphere);
      scene.add(hat);
      scene.add(brim);
      
      // Add bright lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(2, 2, 2);
      scene.add(directionalLight);

      console.log('Fallback avatar created and positioned at origin');

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        sphere.rotation.y += 0.01;
        hat.rotation.y += 0.01;
        brim.rotation.y += 0.01;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      
      animate();
    };

    // Load the GLB model or create fallback immediately
    loadGLB().catch(() => {
      console.log('GLB loading failed, creating fallback avatar');
      createFallbackAvatar(scene);
    });

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current?.contains(rendererRef.current.domElement)) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [size]);

  return (
    <div 
      ref={mountRef} 
      className={`captain-cortex-avatar ${className}`}
      style={{ 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background to see the container
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '50%'
      }}
    />
  );
};

export default CaptainCortexAvatar;