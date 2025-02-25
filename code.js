console.log("Initializing 3D Scene...");

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5); // Slightly above center for better view

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2;

let model, plateMesh;
const textureLoader = new THREE.TextureLoader();

// Load GLTF Model
const loader = new THREE.GLTFLoader();
loader.load('mirror.glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    console.log("Model Loaded:", model);

    // Find the plate mesh
    model.traverse((child) => {
        if (child.isMesh && child.name === "plate") {
            plateMesh = child;
            console.log("Plate Mesh Found:", plateMesh);

            // Apply default texture
            updateTexture("dazai-san.jpeg");
        }
    });

    scene.add(model);

    // Center camera
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    camera.position.set(center.x, center.y, box.max.z * 2);
    camera.lookAt(center);
    controls.target.copy(center);
});

// Function to update the texture dynamically
function updateTexture(imagePath) {
    if (!plateMesh) return console.warn("Plate mesh not found!");

    textureLoader.load(imagePath, (texture) => {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;

        plateMesh.material.map = texture;
        plateMesh.material.needsUpdate = true;
        console.log(`Texture Updated: ${imagePath}`);
    });
}

// Change texture when clicking a slider image
window.changeTexture = (imagePath) => updateTexture(imagePath);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
