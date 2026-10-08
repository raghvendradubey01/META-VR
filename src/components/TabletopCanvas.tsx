import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Villager, WeatherType, GestureType } from '../types/game';

interface TabletopCanvasProps {
  weather: WeatherType;
  villagers: Villager[];
  selectedVillagerId: string | null;
  onSelectVillager: (id: string | null) => void;
  activeGesture: GestureType | null;
  timeOfDay: number;
  temperature: number;
}

export const TabletopCanvas: React.FC<TabletopCanvasProps> = ({
  weather,
  villagers,
  selectedVillagerId,
  onSelectVillager,
  activeGesture,
  timeOfDay,
  temperature
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const villagerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const windParticlesRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const campfireGlowRef = useRef<THREE.PointLight | null>(null);
  const shrineGlowRef = useRef<THREE.PointLight | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const palmGroupRef = useRef<THREE.Group[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup with clean studio warm gray/white background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    sceneRef.current = scene;

    // 2. Camera setup - seated VR perspective looking down at a tabletop
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 4.8, 5.2);
    camera.lookAt(0, 0.4, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Seated Tabletop Base (Natural rich warm timber tabletop)
    const tableGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.35, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x5c3d2e, // natural warm teak wood
      roughness: 0.6,
      metalness: 0.05
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.18;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Felt table mat / play area boundary (linen off-white/warm neutral)
    const matGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.02, 32);
    const matMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.9
    });
    const feltMat = new THREE.Mesh(matGeo, matMat);
    feltMat.position.y = 0.01;
    feltMat.receiveShadow = true;
    scene.add(feltMat);

    // Ocean water basin
    const oceanGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.08, 48);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.y = 0.05;
    scene.add(oceanMesh);

    // 5. Stylized Island Terrain (Low-poly Tabletop Diorama)
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Island main landmass
    const landGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.28, 24);
    const landMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // lush natural green
      roughness: 0.8
    });
    const landMesh = new THREE.Mesh(landGeo, landMat);
    landMesh.position.y = 0.2;
    landMesh.receiveShadow = true;
    islandGroup.add(landMesh);

    // Sandy Shore rim
    const shoreGeo = new THREE.CylinderGeometry(2.35, 2.5, 0.15, 28);
    const shoreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // warm sand
      roughness: 0.9
    });
    const shoreMesh = new THREE.Mesh(shoreGeo, shoreMat);
    shoreMesh.position.y = 0.12;
    shoreMesh.receiveShadow = true;
    islandGroup.add(shoreMesh);

    // Highland central hill
    const hillGeo = new THREE.ConeGeometry(1.1, 0.6, 16);
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.9
    });
    const hillMesh = new THREE.Mesh(hillGeo, hillMat);
    hillMesh.position.set(-0.3, 0.55, -0.4);
    hillMesh.receiveShadow = true;
    hillMesh.castShadow = true;
    islandGroup.add(hillMesh);

    // 6. Island Landmark Props
    // Central Campfire
    const fireBaseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.08, 12);
    const fireBaseMat = new THREE.MeshStandardMaterial({ color: 0x78716c });
    const fireBase = new THREE.Mesh(fireBaseGeo, fireBaseMat);
    fireBase.position.set(0.1, 0.38, 0.1);
    islandGroup.add(fireBase);

    const campfireGlow = new THREE.PointLight(0xf97316, 1.8, 2.5);
    campfireGlow.position.set(0.1, 0.55, 0.1);
    scene.add(campfireGlow);
    campfireGlowRef.current = campfireGlow;

    // Sacred Shrine Altar (North side)
    const shrineBaseGeo = new THREE.BoxGeometry(0.35, 0.45, 0.25);
    const shrineMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const shrine = new THREE.Mesh(shrineBaseGeo, shrineMat);
    shrine.position.set(-0.2, 0.55, -1.2);
    shrine.castShadow = true;
    islandGroup.add(shrine);

    const shrineGlow = new THREE.PointLight(0x0ea5e9, 1.2, 2.0);
    shrineGlow.position.set(-0.2, 0.8, -1.2);
    scene.add(shrineGlow);
    shrineGlowRef.current = shrineGlow;

    // Freshwater Well (East side)
    const wellGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.2, 12);
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const well = new THREE.Mesh(wellGeo, wellMat);
    well.position.set(1.1, 0.42, -0.3);
    islandGroup.add(well);

    // Farmland Wheat Patch (South-West side)
    const farmGeo = new THREE.BoxGeometry(0.7, 0.05, 0.6);
    const farmMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 1.0 });
    const farm = new THREE.Mesh(farmGeo, farmMat);
    farm.position.set(-1.0, 0.36, 0.6);
    islandGroup.add(farm);

    // Wheat stalks
    for (let wx = -0.25; wx <= 0.25; wx += 0.12) {
      for (let wz = -0.2; wz <= 0.2; wz += 0.12) {
        const stalkGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.15, 4);
        const stalkMat = new THREE.MeshStandardMaterial({ color: 0xeab308 });
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.set(-1.0 + wx, 0.44, 0.6 + wz);
        islandGroup.add(stalk);
      }
    }

    // Palm trees
    const palms: THREE.Group[] = [];
    const palmPositions = [
      [-1.3, 0.35, -0.8],
      [1.3, 0.35, 0.7],
      [0.6, 0.35, -1.2],
      [-1.4, 0.35, 0.1]
    ];
    palmPositions.forEach(([px, py, pz]) => {
      const palm = new THREE.Group();
      palm.position.set(px, py, pz);

      const trunkGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.3;
      palm.add(trunk);

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const frondGeo = new THREE.BoxGeometry(0.3, 0.03, 0.1);
        const frondMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.position.set(Math.cos(angle) * 0.15, 0.58, Math.sin(angle) * 0.15);
        frond.rotation.y = angle;
        frond.rotation.z = 0.35;
        palm.add(frond);
      }
      islandGroup.add(palm);
      palms.push(palm);
    });
    palmGroupRef.current = palms;

    // 7. Natural Daylight Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    sunLight.position.set(4, 7, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 8. Particle Systems (Rain & Wind)
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 4.5;
      rainPositions[i + 1] = Math.random() * 4 + 0.5;
      rainPositions[i + 2] = (Math.random() - 0.5) * 4.5;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x0284c7,
      size: 0.035,
      transparent: true,
      opacity: 0.8
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    rainParticles.visible = false;
    scene.add(rainParticles);
    rainParticlesRef.current = rainParticles;

    const windCount = 200;
    const windGeo = new THREE.BufferGeometry();
    const windPositions = new Float32Array(windCount * 3);
    for (let i = 0; i < windCount * 3; i += 3) {
      windPositions[i] = (Math.random() - 0.5) * 5;
      windPositions[i + 1] = Math.random() * 1.5 + 0.3;
      windPositions[i + 2] = (Math.random() - 0.5) * 5;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPositions, 3));
    const windMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.045,
      transparent: true,
      opacity: 0.6
    });
    const windParticles = new THREE.Points(windGeo, windMat);
    windParticles.visible = false;
    scene.add(windParticles);
    windParticlesRef.current = windParticles;

    // 9. Raycasting for Pinch / Pick up villager
    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      villagerMeshesRef.current.forEach((group) => {
        interactiveObjects.push(group);
      });

      const intersects = raycasterRef.current.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.villagerId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.villagerId) {
          onSelectVillager(obj.userData.villagerId);
        }
      } else {
        onSelectVillager(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (campfireGlowRef.current) {
        campfireGlowRef.current.intensity = 1.5 + Math.sin(time * 12) * 0.3;
      }

      if (shrineGlowRef.current) {
        shrineGlowRef.current.intensity = 1.0 + Math.sin(time * 2) * 0.4;
      }

      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 5.0;
          if (positions[i] < 0.2) {
            positions[i] = 4.0;
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (windParticlesRef.current && windParticlesRef.current.visible) {
        const positions = windParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += delta * 3.5;
          positions[i + 2] += Math.sin(time + positions[i]) * 0.02;
          if (positions[i] > 2.5) {
            positions[i] = -2.5;
          }
        }
        windParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      palmGroupRef.current.forEach((palm, idx) => {
        const windIntensity = weather === 'windy' ? 0.25 : 0.05;
        palm.rotation.z = Math.sin(time * 2 + idx) * windIntensity;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update weather effects & lighting dynamically
  useEffect(() => {
    if (!rainParticlesRef.current || !windParticlesRef.current || !sunLightRef.current || !ambientLightRef.current) return;

    if (weather === 'rainy') {
      rainParticlesRef.current.visible = true;
      windParticlesRef.current.visible = false;
      sunLightRef.current.intensity = 0.8;
      sunLightRef.current.color.setHex(0x94a3b8);
      ambientLightRef.current.intensity = 0.55;
    } else if (weather === 'windy') {
      rainParticlesRef.current.visible = false;
      windParticlesRef.current.visible = true;
      sunLightRef.current.intensity = 1.1;
      sunLightRef.current.color.setHex(0xcfd8dc);
      ambientLightRef.current.intensity = 0.65;
    } else if (weather === 'sunny') {
      rainParticlesRef.current.visible = false;
      windParticlesRef.current.visible = false;
      sunLightRef.current.intensity = 1.9;
      sunLightRef.current.color.setHex(0xfef08a);
      ambientLightRef.current.intensity = 0.85;
    } else {
      rainParticlesRef.current.visible = false;
      windParticlesRef.current.visible = false;
      sunLightRef.current.intensity = 1.4;
      sunLightRef.current.color.setHex(0xfffbeb);
      ambientLightRef.current.intensity = 0.75;
    }
  }, [weather]);

  // Synchronize villager 3D meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMap = villagerMeshesRef.current;
    const existingIds = new Set(villagers.map(v => v.id));

    currentMap.forEach((meshGroup, id) => {
      if (!existingIds.has(id)) {
        scene.remove(meshGroup);
        currentMap.delete(id);
      }
    });

    villagers.forEach(villager => {
      let group = currentMap.get(villager.id);

      if (!group) {
        group = new THREE.Group();
        group.userData = { villagerId: villager.id };

        const bodyGeo = new THREE.CapsuleGeometry(0.08, 0.16, 6, 8);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(villager.color),
          roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.16;
        body.castShadow = true;
        group.add(body);

        const headGeo = new THREE.SphereGeometry(0.075, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.32;
        group.add(head);

        const hatGeo = new THREE.ConeGeometry(0.11, 0.08, 8);
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 0.4;
        group.add(hat);

        const ringGeo = new THREE.RingGeometry(0.14, 0.17, 16);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x0284c7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.02;
        ring.name = 'selectionRing';
        ring.visible = false;
        group.add(ring);

        scene.add(group);
        currentMap.set(villager.id, group);
      }

      const targetY = villager.heldHeight > 0 ? 0.35 + villager.heldHeight : 0.35;
      group.position.set(villager.x, targetY, villager.z);

      const isSelected = selectedVillagerId === villager.id || villager.isInspected;
      const ring = group.getObjectByName('selectionRing');
      if (ring) {
        ring.visible = isSelected;
      }

      if (villager.heldHeight > 0) {
        group.position.y += Math.sin(Date.now() * 0.005) * 0.03;
      }
    });
  }, [villagers, selectedVillagerId]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-xs">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD over the Tabletop View - Clean white human-crafted cards */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-neutral-200 text-xs text-neutral-800 flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-neutral-900">Tabletop Diorama</span>
          <span className="text-neutral-300">|</span>
          <span className="capitalize text-neutral-700 font-medium">{weather} Sky</span>
          <span className="text-neutral-300">|</span>
          <span className="font-mono text-neutral-600">{temperature}°C</span>
        </div>

        {activeGesture && (
          <div className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-800 text-xs flex items-center gap-2 shadow-md">
            <span>✨</span>
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Gesture: {activeGesture.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-600 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-neutral-200 shadow-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 font-medium">🖐️ Pinch &amp; Lift:</span>
          <span>Click any villager to inspect their live needs and thoughts.</span>
        </div>
        <div className="text-[11px] text-neutral-500 font-mono">
          VR Scale: 0.8m Seated Tabletop
        </div>
      </div>
    </div>
  );
};
