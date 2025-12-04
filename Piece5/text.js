import "./Piece5.module.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

// --- basic Three.js setup -------------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(15, 2, -15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambient = new THREE.AmbientLight("black", 0.1);
scene.add(ambient);

const contentGroup = new THREE.Group();
scene.add(contentGroup);
scene.rotation.y = (3 * Math.PI) / 4;

// --- OUTER SPHERE (larger) ---
const outerSphereGeo = new THREE.SphereGeometry(40, 32, 32);
const outerSphereMat = new THREE.MeshStandardMaterial({
  color: "white",
  side: THREE.BackSide,
  roughness: 0.5,
  metalness: 0.0,
  transparent: true,
  opacity: 1,
});
const outerSphere = new THREE.Mesh(outerSphereGeo, outerSphereMat);
outerSphere.position.set(0, 0, 0);
outerSphere.receiveShadow = true;
contentGroup.add(outerSphere);

// --- INNER SPHERE (smallest) ---
const sphereGeo = new THREE.SphereGeometry(20, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
  color: "white",
  side: THREE.BackSide,
  roughness: 0.5,
  metalness: 0.0,
  transparent: true,
  opacity: 1,
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 0, 0);
sphere.receiveShadow = true;
contentGroup.add(sphere);

// --- create flat text geometry ------------------------------------------
let textMesh;
let innerTextMesh;
const loader = new FontLoader();
const fontUrl = "/Canvas4Coders/Jacquard_12/Jacquard12_Regular.json";

// OUTER TEXT (at z = 0)
loader.load(
  fontUrl,
  (font) => {
    const paragraphText = `In this scene, I’m not myself, and if a me exists, I am nothing but the profile; They are the me, They Go, They walk the way to school, They travel home for family Christmas, They’re pacing through my room, They sleep inside my bed, I am here, but just a witness; And at midnight it’s high noon, barely there, inside their shoes; All that exists is them; All that’s left, that’s here, it’s you;`;
    const referenceDistance = 25;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * referenceDistance;
    const width = height * 1.5 * camera.aspect;
    const targetWidth = width * 0.45;
    const words = paragraphText.split(" ");
    const fontSize = 1;
    const colorGroups = {
      red: ["my", "home", "bed", "family", "room", "here", "I'm"],
      blue: ["barely", "witness", "noon", "midnight", "All", "is", "you"],
      green: ["I", "exist", "them", "travel", "pacing", "alone", "left"],
    };
    const getWordColor = (word) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, "");
      if (colorGroups.red.includes(wordLower)) return 0xff0000;
      if (colorGroups.blue.includes(wordLower)) return 0x0000ff;
      if (colorGroups.green.includes(wordLower)) return 0x00ff00;
      return 0xffffff;
    };
    const wordData = words.map((word) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const width = geometry.boundingBox
        ? geometry.boundingBox.max.x - geometry.boundingBox.min.x
        : 0;
      return { word, geometry, width, color: getWordColor(word) };
    });
    const spaceWidth = fontSize * 0.35;
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;
    wordData.forEach((data) => {
      const wordWidthWithSpace =
        data.width + (currentLine.length > 0 ? spaceWidth : 0);
      if (
        currentLineWidth + wordWidthWithSpace > targetWidth &&
        currentLine.length > 0
      ) {
        lines.push(currentLine);
        currentLine = [data];
        currentLineWidth = data.width;
      } else {
        currentLine.push(data);
        currentLineWidth += wordWidthWithSpace;
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    lines.forEach((lineWords, lineIdx) => {
      const yPos = totalHeight / 2 - lineIdx * lineHeight;
      const totalLineWidth = lineWords.reduce(
        (sum, data, idx) => sum + data.width + (idx > 0 ? spaceWidth : 0),
        0
      );
      let xOffset = -totalLineWidth / 2;
      lineWords.forEach((data, wordIdx) => {
        const material = new THREE.MeshStandardMaterial({
          color: data.color,
          side: THREE.DoubleSide,
          roughness: 0.5,
          metalness: 0.0,
        });
        const mesh = new THREE.Mesh(data.geometry, material);
        mesh.position.set(xOffset, yPos, 0);
        mesh.castShadow = true;
        contentGroup.add(mesh);
        if (lineIdx === 0 && wordIdx === 0) innerTextMesh = mesh;
        xOffset += data.width + spaceWidth;
      });
    });
  },
  undefined,
  (err) => {
    console.error("Font load error (inner text):", err);
  }
);

// ROTATING RING TEXT
const rotatingTextGroup = new THREE.Group();
contentGroup.add(rotatingTextGroup);
loader.load(
  fontUrl,
  (font) => {
    const ringText = `i have never let them go let alone left them alone attached a shadow murky just below follow them beneath their feet and take me where if ever should they go`;
    const words = ringText.split(" ");
    const fontSize = 1;
    const radius = 25;
    words.forEach((word, idx) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const material = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      const angle = (idx / words.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      mesh.position.set(x, 0, z);
      mesh.rotation.y = -angle + Math.PI / 2;
      rotatingTextGroup.add(mesh);
    });
  },
  undefined,
  (err) => {
    console.error("Font load error (rotating ring text):", err);
  }
);

// OUTER TEXT (at z = 0)
loader.load(
  fontUrl,
  (font) => {
    const paragraphText = `First person in my words, to my actions I am second; Point of view, all shot in third, a still, a blur, a message; I dread the rising sun, I need to shed the light; For once, to be first person, an untethered second life;`;
    const referenceDistance = 25;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * referenceDistance;
    const width = height * camera.aspect;
    const targetWidth = width * 0.6;
    const words = paragraphText.split(" ");
    const fontSize = 1;
    const colorGroups = {
      red: ["shed", "light", "third"],
      blue: ["rising", "sun", "second"],
      green: ["untethered", "first", "life"],
    };
    const getWordColor = (word) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, "");
      if (colorGroups.red.includes(wordLower)) return 0xff0000;
      if (colorGroups.blue.includes(wordLower)) return 0x0000ff;
      if (colorGroups.green.includes(wordLower)) return 0x00ff00;
      return 0xffffff;
    };
    const wordData = words.map((word) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const width = geometry.boundingBox
        ? geometry.boundingBox.max.x - geometry.boundingBox.min.x
        : 0;
      return { word, geometry, width, color: getWordColor(word) };
    });
    const spaceWidth = fontSize * 0.35;
    const lines = [];
    let currentLine = [];
    let currentLineWidth = 0;
    wordData.forEach((data) => {
      const wordWidthWithSpace =
        data.width + (currentLine.length > 0 ? spaceWidth : 0);
      if (
        currentLineWidth + wordWidthWithSpace > targetWidth &&
        currentLine.length > 0
      ) {
        lines.push(currentLine);
        currentLine = [data];
        currentLineWidth = data.width;
      } else {
        currentLine.push(data);
        currentLineWidth += wordWidthWithSpace;
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    lines.forEach((lineWords, lineIdx) => {
      const yPos = totalHeight / 2 - lineIdx * lineHeight;
      const totalLineWidth = lineWords.reduce(
        (sum, data, idx) => sum + data.width + (idx > 0 ? spaceWidth : 0),
        0
      );
      let xOffset = -totalLineWidth / 2;
      lineWords.forEach((data, wordIdx) => {
        const material = new THREE.MeshStandardMaterial({
          color: data.color,
          side: THREE.DoubleSide,
          roughness: 0.5,
          metalness: 0.0,
        });
        const mesh = new THREE.Mesh(data.geometry, material);
        mesh.rotation.y = Math.PI;
        mesh.position.set(-xOffset, yPos, -30);
        mesh.castShadow = true;
        contentGroup.add(mesh);
        if (lineIdx === 0 && wordIdx === 0) textMesh = mesh;
        xOffset += data.width + spaceWidth;
      });
    });
  },
  undefined,
  (err) => {
    console.error("Font load error (outer text):", err);
  }
);

// --- RGB SPOTLIGHT DEMONSTRATION -----------------------------------------
const innerSpotlightData = [
  { color: 0xff0000, position: [-3, 2, 3], name: "Red" },
  { color: 0x00ff00, position: [0, -2, 3], name: "Green" },
  { color: 0x0000ff, position: [3, 2, 3], name: "Blue" },
];
const spotlights = [];
const spotlightHelpers = [];
innerSpotlightData.forEach((config) => {
  const spot = new THREE.SpotLight(config.color, 900);
  spot.position.set(...config.position);
  spot.target.position.set(0, 0, 0);
  spot.angle = Math.PI / 2;
  spot.penumbra = 0.7;
  spot.distance = 200;
  spot.castShadow = true;
  spot.shadow.mapSize.width = 2048;
  spot.shadow.mapSize.height = 2048;
  spot.shadow.bias = -0.0005;
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 100;
  scene.add(spot);
  scene.add(spot.target);
  const helper = new THREE.SpotLightHelper(spot, config.color);
  spotlights.push(spot);
  spotlightHelpers.push(helper);
});

// OUTER LIGHTS - Three spotlights for outer text at z = -30
const outerSpotlightData = [
  { color: 0xff00ff, position: [-8, 5, -27], name: "Magenta" },
  { color: 0xffff00, position: [0, -5, -27], name: "Yellow" },
  { color: 0x00ffff, position: [8, 5, -27], name: "Cyan" },
];
const outerSpotlights = [];
const outerSpotlightHelpers = [];
outerSpotlightData.forEach((config) => {
  const spot = new THREE.SpotLight(config.color, 900);
  spot.position.set(...config.position);
  spot.target.position.set(0, 0, -30);
  spot.angle = Math.PI / 2.5;
  spot.penumbra = 0.7;
  spot.distance = 200;
  spot.castShadow = true;
  spot.shadow.mapSize.width = 2048;
  spot.shadow.mapSize.height = 2048;
  spot.shadow.bias = -0.0005;
  spot.shadow.camera.near = 0.5;
  spot.shadow.camera.far = 100;
  scene.add(spot);
  scene.add(spot.target);
  const helper = new THREE.SpotLightHelper(spot, config.color);
  outerSpotlights.push(spot);
  outerSpotlightHelpers.push(helper);
});

const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);

let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
const animate = () => {
  controls.update();
  frameCount++;
  const currentTime = performance.now();
  const delta = currentTime - lastTime;
  if (delta >= 1000) {
    fps = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastTime = currentTime;
  }
  if (textMesh) {
    textMesh.rotation.y = Math.PI;
  }
  const time = Date.now() * 0.001;
  rotatingTextGroup.rotation.y = time * 0.3;
  const radius = 5;
  const angle = time * 0.5;
  spotlights.forEach((spot, idx) => {
    let x, y, z;
    if (idx === 0) {
      x = 0;
      y = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
    } else if (idx === 1) {
      x = 0;
      y = Math.cos(angle) * -radius;
      z = Math.sin(angle) * radius;
    } else {
      const phaseOffset = Math.PI;
      x = Math.cos(angle) * radius;
      y = 0;
      z = Math.sin(angle) * radius;
    }
    spot.position.set(x, y, z);
  });
  const outerRadius = 8;
  outerSpotlights.forEach((spot, idx) => {
    let x, y, z;
    if (idx === 0) {
      x = 0;
      y = Math.cos(angle) * outerRadius;
      z = -30 + Math.sin(angle) * outerRadius;
    } else if (idx === 1) {
      x = 0;
      y = Math.cos(angle) * -outerRadius;
      z = -30 + Math.sin(angle) * outerRadius;
    } else {
      const phaseOffset = Math.PI;
      x = Math.cos(angle + phaseOffset) * outerRadius;
      y = 0;
      z = -30 + Math.sin(angle + phaseOffset) * outerRadius;
    }
    spot.position.set(x, y, z);
  });
  renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "r" && spotlights[0]) {
    spotlights[0].visible = !spotlights[0].visible;
    spotlightHelpers[0].visible = spotlights[0].visible;
    console.log(`Red spotlight: ${spotlights[0].visible ? "ON" : "OFF"}`);
  } else if (key === "g" && spotlights[1]) {
    spotlights[1].visible = !spotlights[1].visible;
    spotlightHelpers[1].visible = spotlights[1].visible;
    console.log(`Green spotlight: ${spotlights[1].visible ? "ON" : "OFF"}`);
  } else if (key === "b" && spotlights[2]) {
    spotlights[2].visible = !spotlights[2].visible;
    spotlightHelpers[2].visible = spotlights[2].visible;
    console.log(`Blue spotlight: ${spotlights[2].visible ? "ON" : "OFF"}`);
  }
});
