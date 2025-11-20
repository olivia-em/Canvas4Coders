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
camera.position.set(15, 2, -15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
// enable shadow map for shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// // Add camera position display
// const cameraInfo = document.createElement("div");
// cameraInfo.style.position = "absolute";
// cameraInfo.style.top = "10px";
// cameraInfo.style.left = "10px";
// cameraInfo.style.color = "white";
// cameraInfo.style.fontFamily = "monospace";
// cameraInfo.style.fontSize = "14px";
// cameraInfo.style.background = "rgba(0,0,0,0.7)";
// cameraInfo.style.padding = "10px";
// cameraInfo.style.borderRadius = "5px";
// cameraInfo.style.pointerEvents = "none";
// cameraInfo.style.zIndex = "1000";
// document.body.appendChild(cameraInfo);

// light (ambient + spotlight will be used so materials can respond to lighting)
const ambient = new THREE.AmbientLight("black", 0.1);
scene.add(ambient);

// ROTATION METHOD 1: Group rotation (comment out if not using)
const contentGroup = new THREE.Group();
// contentGroup.rotation.y = Math.PI / 2; // Rotate 90 degrees counter-clockwise
scene.add(contentGroup);

// ROTATION METHOD 2: Rotate entire scene (comment out if not using)
scene.rotation.y = (3 * Math.PI) / 4; // Rotate 90 degrees counter-clockwise

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
  side: THREE.BackSide, // render inside faces only
  roughness: 0.5,
  metalness: 0.0,
  transparent: true,
  opacity: 1, // 0 = fully transparent, 1 = fully opaque
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 0, 0);
sphere.receiveShadow = true; // allow shadows to appear on the sphere
contentGroup.add(sphere); // METHOD 1: Add to group
// scene.add(sphere); // METHOD 2: Uncomment this and comment above if using scene rotation

// --- create a back-sided box to enclose the scene and receive shadows ---
// const boxGeo = new THREE.BoxGeometry(40, 40, 40);
// const boxMat = new THREE.MeshStandardMaterial({
//   color: "white",
//   side: THREE.BackSide, // render inside faces only
//   roughness: 1.0,
//   metalness: 1.0,
// });
// const sphere = new THREE.Mesh(boxGeo, boxMat);
// sphere.position.set(0, 0, 0);
// sphere.receiveShadow = true; // allow shadows to appear on the box
// scene.add(sphere);

// --- create flat text geometry ------------------------------------------
let textMesh; // store reference for animation
let innerTextMesh; // store reference for inner text
const loader = new FontLoader();
// Using the official three.js CDN font JSON. This will be requested at runtime by the browser.
const fontUrl = "/Canvas4Coders/Jacquard_12/Jacquard12_Regular.json";

// OUTER TEXT (at z = 0)
loader.load(
  fontUrl,
  (font) => {
    // Filler paragraph text
    const paragraphText = `In this scene, I’m not myself, and if a me exists, I am nothing but the profile; They are the me, They Go, They walk the way to school, They travel home for family Christmas, They’re pacing through my room, They sleep inside my bed, I am here, but just a witness; And at midnight it’s high noon, barely there, inside their shoes; All that exists is them; All that’s left, that’s here, it’s you;`;

    // Calculate size based on camera frustum to fill viewport
    // Use fixed reference distance (25) for consistent text layout regardless of camera position
    const referenceDistance = 25;
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * referenceDistance;
    const width = height * 1.5 * camera.aspect;

    // Target text size to fill most of the view (with some padding)
    const targetWidth = width * 0.45;
    // const targetHeight = height * 0.8;

    // Create multi-line text by splitting into words and wrapping
    const words = paragraphText.split(" ");
    const fontSize = 1; // Adjust for readability

    // Define color groups - add words to assign them specific colors
    const colorGroups = {
      red: ["my", "home", "bed", "family", "room", "here", "I'm"],
      blue: ["barely", "witness", "noon", "midnight", "All", "is", "you"],
      green: ["I", "exist", "them", "travel", "pacing", "alone", "left"],
      // white: [], // default for unlisted words
    };

    // Helper function to get color for a word
    const getWordColor = (word) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, ""); // remove punctuation
      if (colorGroups.red.includes(wordLower)) return 0xff0000;
      if (colorGroups.blue.includes(wordLower)) return 0x0000ff;
      if (colorGroups.green.includes(wordLower)) return 0x00ff00;
      return 0xffffff; // default white
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
        mesh.position.set(xOffset, yPos, 0); // Inner text at origin
        mesh.castShadow = true;
        contentGroup.add(mesh); // METHOD 1: Add to group
        // scene.add(mesh); // METHOD 2: Uncomment this and comment above if using scene rotation

        // Store reference to first mesh for animation
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

// ROTATING RING TEXT - Third font loader for circular text
const rotatingTextGroup = new THREE.Group();
contentGroup.add(rotatingTextGroup);

loader.load(
  fontUrl,
  (font) => {
    const ringText = `i have never let them go let alone left them alone attached a shadow murky just below follow them beneath their feet and take me where if ever should they go`;
    const words = ringText.split(" ");
    const fontSize = 1;
    const radius = 25; // Position between inner sphere (r=20) and outer text (r=30)

    // Create text geometries for each word
    words.forEach((word, idx) => {
      const shapes = font.generateShapes(word, fontSize, 12);
      const geometry = new THREE.ShapeGeometry(shapes);
      geometry.computeBoundingBox();

      const material = new THREE.MeshStandardMaterial({
        color: 0xffaa00, // Orange color for ring text
        side: THREE.DoubleSide,
        roughness: 0.5,
        metalness: 0.0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;

      // Position words in a circle
      const angle = (idx / words.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      mesh.position.set(x, 0, z);

      // Rotate each word to face outward from center
      mesh.rotation.y = -angle + Math.PI / 2;

      rotatingTextGroup.add(mesh);
    });
  },
  undefined,
  (err) => {
    console.error("Font load error (rotating ring text):", err);
  }
);

// OUTER TEXT (at z = 0) - Second font loader
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

    // Define color groups for outer text
    const colorGroups = {
      red: ["shed", "light", "third"],
      blue: ["rising", "sun", "second"],
      green: ["untethered", "first", "life"],
      // white: [], // default for unlisted words
    };

    // Helper function to get color for a word
    const getWordColor = (word) => {
      const wordLower = word.toLowerCase().replace(/[.,!?;:]/g, ""); // remove punctuation
      if (colorGroups.red.includes(wordLower)) return 0xff0000;
      if (colorGroups.blue.includes(wordLower)) return 0x0000ff;
      if (colorGroups.green.includes(wordLower)) return 0x00ff00;
      return 0xffffff; // default white
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
        mesh.rotation.y = Math.PI; // Flip 180 degrees on Y-axis
        mesh.position.set(-xOffset, yPos, -30); // Negate X to mirror the layout
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
// INNER LIGHTS - Three spotlights for inner text at origin
const innerSpotlightData = [
  { color: 0xff0000, position: [-3, 2, 3], name: "Red" },
  { color: 0x00ff00, position: [0, -2, 3], name: "Green" },
  { color: 0x0000ff, position: [3, 2, 3], name: "Blue" },
];

const spotlights = []; // Store spotlight objects for animation
const spotlightHelpers = []; // Store helpers for updating

innerSpotlightData.forEach((config) => {
  const spot = new THREE.SpotLight(config.color, 900);
  spot.position.set(...config.position);
  spot.target.position.set(0, 0, 0); // all point at the inner text at origin
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

  // Add a helper to visualize the spotlight cone and direction
  const helper = new THREE.SpotLightHelper(spot, config.color);
  // scene.add(helper);

  // Store for animation
  spotlights.push(spot);
  spotlightHelpers.push(helper);
});

// OUTER LIGHTS - Three spotlights for outer text at z = -30
const outerSpotlightData = [
  { color: 0xff00ff, position: [-8, 5, -27], name: "Magenta" }, // Positioned around z=-30
  { color: 0xffff00, position: [0, -5, -27], name: "Yellow" },
  { color: 0x00ffff, position: [8, 5, -27], name: "Cyan" },
];

const outerSpotlights = []; // Store outer spotlight objects
const outerSpotlightHelpers = []; // Store outer helpers

outerSpotlightData.forEach((config) => {
  const spot = new THREE.SpotLight(config.color, 900);
  spot.position.set(...config.position);
  spot.target.position.set(0, 0, -30); // all point at the outer text at z=-30
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
  // scene.add(helper);

  outerSpotlights.push(spot);
  outerSpotlightHelpers.push(helper);
});

// responsive resize
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("resize", onResize);

// animate
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

const animate = () => {
  controls.update();

  // Calculate FPS
  frameCount++;
  const currentTime = performance.now();
  const delta = currentTime - lastTime;

  if (delta >= 1000) {
    // Update FPS every second
    fps = Math.round((frameCount * 1000) / delta);
    // console.log(`FPS: ${fps}`);
    frameCount = 0;
    lastTime = currentTime;
  }

  // // Update camera position display
  // cameraInfo.innerHTML = `Camera Position:<br>x: ${camera.position.x.toFixed(
  //   2
  // )}<br>y: ${camera.position.y.toFixed(2)}<br>z: ${camera.position.z.toFixed(
  //   2
  // )}<br>FPS: ${fps}`;

  // Text rotation (set to 0 for now, but ready to animate)
  if (textMesh) {
    textMesh.rotation.y = Math.PI; // Keep outer text flipped
  }

  // Time calculation for animations
  const time = Date.now() * 0.001; // time in seconds

  // Rotate the ring text group
  rotatingTextGroup.rotation.y = time * 0.3; // Rotate at moderate speed

  // Rotate spotlights around the text (origin) while keeping them pointed at it
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

  // Each light rotates around a different axis
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
      x = 0;
      y = Math.cos(angle) * -radius;
      z = Math.sin(angle) * radius;
    } else {
      const phaseOffset = Math.PI; // 180 degree offset
      x = Math.cos(angle) * radius;
      y = 0;
      z = Math.sin(angle) * radius;
    }

    spot.position.set(x, y, z);
    // Target remains at origin, so spotlight always points at the text
  });

  // Rotate outer spotlights around the outer text (at z = -30)
  const outerRadius = 8; // distance from outer text center
  outerSpotlights.forEach((spot, idx) => {
    let x, y, z;

    if (idx === 0) {
      // Magenta: Rotate around X axis (in YZ plane around z=-30)
      x = 0;
      y = Math.cos(angle) * outerRadius;
      z = -30 + Math.sin(angle) * outerRadius;
    } else if (idx === 1) {
      // Yellow: Rotate around Z axis (in XY plane)
      x = 0;
      y = Math.cos(angle) * -outerRadius;
      z = -30 + Math.sin(angle) * outerRadius;
    } else {
      // Cyan: Rotate around Y axis (in XZ plane around z=-30)
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
