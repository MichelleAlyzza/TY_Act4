import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader.js'

import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

// Textures
const textureloader = new THREE.TextureLoader()
const flagTexture = textureloader.load('/textures/Flags/PH_Flag.png')


/**
 * Activity 4.2 Realistic Render
 */

// Update the materials
const updateAllMaterials = () => 
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMap = environmentMap
            child.material.envMapIntensity = 2.5
            child.castShadow = true
            child.receiveShadow = true
            child.material.needsUpdate = true;
        }
    })
}
/**
 * Models
 */
gltfLoader.load(
    '/models/vespa/scene.gltf',
    (gltf) =>
    {
        const helmet = gltf.scene
        helmet.scale.set(9, 9, 9)
        helmet.position.set(6, -3, -3)
        helmet.rotation.y = Math.PI * 1.5
        scene.add(helmet)

        gui.add(helmet.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotation')

        updateAllMaterials()
    }
)

/**
 * Environment Map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])
// to applt the background
scene.background = environmentMap
scene.environment = environmentMap
environmentMap.encoding = THREE.sRGBEncoding
debugObject.envMapIntensity = 1
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).name('envMapIntensity').onChange(() => {
    updateAllMaterials();
});

/**
 * Lights
 */
const  directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
scene.add(directionalLight)

// Lights GUI
gui.add(directionalLight,'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('lightZ')

/**
 * Activity 4.4 Shaders
 */
const shadersGeometry = new THREE.PlaneGeometry(1, 1, 32, 32)

const shadersMaterial = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    //transparent: true
    uniforms:
    {
        uFrequency: {value: new THREE.Vector2(5, 5)},
        uTime: {value: 0},
        uColor: {value: new THREE.Color('#8D6F64')},
        uTexture: {value: flagTexture}
    }
})
const count = shadersGeometry.attributes.position.count
const random = new Float32Array(count)

for(let i = 0; i < count; i++)
{
    random[i] = Math.random()
}
shadersGeometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1))

const shadersMesh = new THREE.Mesh(shadersGeometry, shadersMaterial)
shadersMesh.scale.set(5, 3, 3)
scene.add(shadersMesh)

// gui
gui.add(shadersMaterial.uniforms.uFrequency.value,'x').min(0).max(20).step(0.01).name('frequencyX')
gui.add(shadersMaterial.uniforms.uFrequency.value,'y').min(0).max(20).step(0.01).name('frequencyY')

/**
 * Activity 4.6 Raging Sea
 */

const waterGeometry = new THREE.PlaneGeometry()
const waterMaterial = new THREE.ShaderMaterial()


/**
 * Activity 4.7 Animated Galaxy
 */
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 1, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// Lights render
renderer.physicallyCorrectLights = true
// outputEncoding
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// gui
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)


/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update the material
    shadersMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()