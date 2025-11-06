import "./style.css";
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
camera.position.set(0, 0, 25);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadow map for shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// light (ambient + spotlight will be used so materials can respond to lighting)
const ambient = new THREE.AmbientLight("black", 0.1);
scene.add(ambient);

// --- create a back-sided sphere to enclose the scene and receive shadows ---
const sphereGeo = new THREE.SphereGeometry(20, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
  color: "white",
  side: THREE.BackSide, // render inside faces only
  roughness: 1.0,
  metalness: 0.0,
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 0, 0);
sphere.receiveShadow = true; // allow shadows to appear on the sphere
scene.add(sphere);

// --- create flat text geometry ------------------------------------------
let textMesh; // store reference for animation
const loader = new FontLoader();
// Using the official three.js CDN font JSON. This will be requested at runtime by the browser.
const fontUrl =
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

loader.load(
  fontUrl,
  (font) => {
    // Filler paragraph text
    const paragraphText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

    // Calculate size based on camera frustum to fill viewport
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
    const width = height * camera.aspect;

    // Target text size to fill most of the view (with some padding)
    const targetWidth = width * 0.6;
    // const targetHeight = height * 0.8;

    // Create multi-line text by splitting into words and wrapping
    const words = paragraphText.split(" ");
    const fontSize = 1; // Adjust for readability

    // Define color groups - add words to assign them specific colors
    const colorGroups = {
      red: ["lorem", "dolor", "tempor", "labore", "magna"],
      blue: ["ipsum", "sit", "amet", "consectetur", "adipiscing"],
      green: ["sed", "eiusmod", "incididunt", "dolore", "aliqua"],
      white: [], // default for unlisted words
    };

    // Helper function to get color for a word
    const getWordColor = (word) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, ""); // remove punctuation
      if (colorGroups.red.includes(wordLower)) return 0xff0000;
      if (colorGroups.blue.includes(wordLower)) return 0x0000ff;
      if (colorGroups.green.includes(wordLower)) return 0x00ff00;
      return 0x000000; // default white
    };

    // Pre-generate all word geometries to get accurate measurements
    const wordData = words.map((word) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();
      const width = geometry.boundingBox
        ? geometry.boundingBox.max.x - geometry.boundingBox.min.x
        : 0;
      return { word, geometry, width, color: getWordColor(word) };
    });

    // Word wrapping with accurate widths
    const spaceWidth = fontSize * 0.35; // space between words
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

    // Position and render words
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;

    lines.forEach((lineWords, lineIdx) => {
      const yPos = totalHeight / 2 - lineIdx * lineHeight;

      // Calculate total line width
      const totalLineWidth = lineWords.reduce(
        (sum, data, idx) => sum + data.width + (idx > 0 ? spaceWidth : 0),
        0
      );

      // Start from left edge (centered)
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
        scene.add(mesh);

        // Store reference to first mesh for animation
        if (lineIdx === 0 && wordIdx === 0) textMesh = mesh;

        xOffset += data.width + spaceWidth;
      });
    });
  },
  undefined,
  (err) => {
    console.error("Font load error:", err);
  }
);

// --- RGB SPOTLIGHT DEMONSTRATION -----------------------------------------
// Create three spotlights: Red, Green, Blue pointing at the text
const spotlightData = [
  { color: 0xff0000, position: [-3, 2, 3], name: "Red" },
  { color: 0x00ff00, position: [0, -2, 3], name: "Green" },
  { color: 0x0000ff, position: [3, 2, 3], name: "Blue" },
];

const spotlights = []; // Store spotlight objects for animation
const spotlightHelpers = []; // Store helpers for updating

spotlightData.forEach((config) => {
  const spot = new THREE.SpotLight(config.color, 900);
  spot.position.set(...config.position);
  spot.target.position.set(0, 0, 0); // all point at the text at origin
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

  // Add a helper to visualize the spotlight cone and direction
  const helper = new THREE.SpotLightHelper(spot, config.color);
  scene.add(helper);

  // Store for animation
  spotlights.push(spot);
  spotlightHelpers.push(helper);
});

// responsive resize
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);

// animate
const animate = () => {
  controls.update();

  // Rotate the scene around Y axis (set to 0 for now, ready to animate)
  // scene.rotation.x += 0.005;
  // scene.rotation.y += 0.005; // uncomment to enable rotation

  // Rotate the sphere around Z axis
  sphere.rotation.z += 0.005;
  //+= 0.005;

  // Text rotation (set to 0 for now, but ready to animate)
  if (textMesh) {
    textMesh.rotation.y = 0;
  }

  // Rotate spotlights around the text (origin) while keeping them pointed at it
  const time = Date.now() * 0.001; // time in seconds
  const radius = 5; // distance from origin
  const angle = time * 0.5; // rotation speed - same for all lights

  /* OLD METHOD - All lights rotating in XZ plane (around Y axis)
  spotlights.forEach((spot, idx) => {
    // Use the SAME angle for all lights so they stay aligned on the same plane
    // Each light gets a different starting position around the circle
    // but they all rotate together, meeting at front and back
    const baseAngle = (idx / spotlights.length) * Math.PI * 2;
    const finalAngle = angle + baseAngle;

    // Calculate new position in circular orbit (all in XZ plane)
    const x = Math.cos(finalAngle) * radius;
    const z = Math.sin(finalAngle) * radius;
    const y = spot.position.y; // keep original Y height

    spot.position.set(x, y, z);
    // Target remains at origin, so spotlight always points at the text
  });
  */

  // NEW METHOD - Each light rotates around a different axis
  // Red: Full rotation around X axis (YZ plane)
  // Green: Full rotation around Z axis (XY plane) - tilted 90° from Y-axis rotation
  // Blue: Full rotation around Y axis (with phase offset)
  spotlights.forEach((spot, idx) => {
    let x, y, z;

    if (idx === 0) {
      // Red: Rotate around X axis (in YZ plane, x always 0)
      x = 0;
      y = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
    } else if (idx === 1) {
      // Green: Rotate around Z axis (in XY plane, z = 0)
      // x = Math.cos(angle) * radius;
      // y = Math.sin(angle) * radius;
      // z = 0;
      x = 0;
      y = Math.cos(angle) * -radius;
      z = Math.sin(angle) * radius;
    } else {
      // Blue: Rotate around Y axis with phase offset (in XZ plane, y = 0)
      const phaseOffset = Math.PI; // 180 degree offset
      x = Math.cos(angle) * radius;
      y = 0;
      z = Math.sin(angle) * radius;
      // x = 0;
      // y = Math.cos(-angle) * radius;
      // z = Math.sin(-angle) * radius;
    }

    spot.position.set(x, y, z);
    // Target remains at origin, so spotlight always points at the text
  });

  // Update the helpers to reflect new spotlight positions
  spotlightHelpers.forEach((helper) => helper.update());

  renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);

// --- KEYBOARD CONTROLS FOR SPOTLIGHTS ------------------------------------
// Toggle spotlights on/off with 'r', 'g', 'b' keys
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "r" && spotlights[0]) {
    // Toggle Red spotlight
    spotlights[0].visible = !spotlights[0].visible;
    spotlightHelpers[0].visible = spotlights[0].visible;
    console.log(`Red spotlight: ${spotlights[0].visible ? "ON" : "OFF"}`);
  } else if (key === "g" && spotlights[1]) {
    // Toggle Green spotlight
    spotlights[1].visible = !spotlights[1].visible;
    spotlightHelpers[1].visible = spotlights[1].visible;
    console.log(`Green spotlight: ${spotlights[1].visible ? "ON" : "OFF"}`);
  } else if (key === "b" && spotlights[2]) {
    // Toggle Blue spotlight
    spotlights[2].visible = !spotlights[2].visible;
    spotlightHelpers[2].visible = spotlights[2].visible;
    console.log(`Blue spotlight: ${spotlights[2].visible ? "ON" : "OFF"}`);
  }
});
