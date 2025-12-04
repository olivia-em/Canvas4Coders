export const sceneConfig = {
  camera: {
    position: [0, 0, 25], // Moved back for better framing
    fov: 50,
  },
  rotation: 0, // No rotation - matches original where contentGroup.rotation.y is commented out
};

export const sphereConfig = {
  inner: {
    radius: 20,
    opacity: 1,
    color: "white",
  },
  outer: {
    radius: 40,
    opacity: 1,
    color: "white",
  },
};

export const lightConfig = {
  ambient: {
    color: "black",
    intensity: 0.1,
  },
  inner: {
    colors: [0xff0000, 0x00ff00, 0x0000ff],
    names: ["Red", "Green", "Blue"],
    radius: 5,
    targetZ: 0,
    rotationSpeed: 0.5,
    intensity: 900,
    angle: Math.PI / 2.5,
    penumbra: 0.7,
  },
  outer: {
    colors: [0xff00ff, 0xffff00, 0x00ffff],
    names: ["Magenta", "Yellow", "Cyan"],
    radius: 8,
    targetZ: -30,
    rotationSpeed: 0.5,
    intensity: 900,
    angle: Math.PI / 2.5,
    penumbra: 0.7,
  },
};

export const textConfig = {
  inner: {
    position: [0, 0, 0],
    fontSize: 1,
    targetWidthMultiplier: 0.45,
    flipped: false,
  },
  outer: {
    position: [0, 0, -30],
    fontSize: 1,
    targetWidthMultiplier: 0.6,
    flipped: true,
  },
  ring: {
    radius: 25,
    fontSize: 1,
    color: 0xffaa00,
    rotationSpeed: 0.3,
  },
};

export const fontUrl = "/Canvas4Coders/Jacquard_12/Jacquard12_Regular.json";
