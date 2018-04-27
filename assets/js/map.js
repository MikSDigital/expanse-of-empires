var THREE = require('three');

require('./three/controls/OrbitControls.js');
require('three/examples/js/loaders/MTLLoader.js');
require('three/examples/js/loaders/OBJLoader.js');

var EOEMap = function(sceneId) {

    this.camera;
    this.scene;
    this.renderer;
    this.controls;
    this.element;
    this.container;
    this.projector;
    this.mouse = {x: 0, y: 0};
    this.targetList = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.selectedHex;
    this.selectionGlow;
    var scope = this;

    this.run = function() {
        init();
        render();
    };

    function init() {
        scope.renderer = new THREE.WebGLRenderer({ antialias: true});
        scope.element = scope.renderer.domElement;
        scope.container = document.getElementById(sceneId)
        scope.container.appendChild(scope.element);
        scope.renderer.setSize(scope.container.offsetWidth, scope.container.offsetHeight);
        scope.scene = new THREE.Scene();

        scope.camera = new THREE.PerspectiveCamera(45, scope.container.offsetWidth / scope.container.offsetHeight, .1, 100);
        scope.camera.position.set(0, 20, 0);
        scope.scene.add(scope.camera);
        scope.controls = new THREE.OrbitControls(scope.camera, scope.element);
        scope.controls.target.set(scope.camera.position.x, 0, scope.camera.position.z + 10);

        // selection glow
        scope.selectionGlow = new THREE.Mesh(
            new THREE.SphereGeometry(.98, 6, 10),
            new THREE.MeshPhongMaterial({color: 0x00FFFF, transparent: true, opacity: 0.2})
        );
        scope.selectionGlow.rotation.y = Math.PI / 6;
        scope.selectionGlow.scale.y = 2;
        scope.selectionGlow.visible = false;
        scope.scene.add(scope.selectionGlow);

        // light
        scope.scene.add(new THREE.AmbientLight(0xFFFFFF, .5));

        sun = new THREE.PointLight(0xFFFF77, 2, 50, 1);
        sun.position.x = 0;
        sun.position.y = 40;
        sun.position.z = 0;
        scope.scene.add(sun);

        // fog
        //var skyColor = new THREE.Color(0x7EC0EE);
        var skyColor = new THREE.Color(0xFFFFFF);
        scope.scene.fog = new THREE.Fog(skyColor, 20, 100);
        scope.scene.background = skyColor;

        // hex grid
        for (var x = 0; x < 20; x++) {
            for (var z = 0; z < 20; z++) {
                var hexMesh = getHexMesh();
                var worldX = (x * (1.7320508075688767) + ((z % 2) * (1.7320508075688767 / 2))) - 16.45;
                var worldZ = (z * 1.5) - 15;
                hexMesh.position.x = worldX;
                hexMesh.position.z = worldZ;
                scope.targetList.push(hexMesh);
                hexMesh.visible = Math.random() > .5;
                hexMesh.userData.coordinates = {
                    x: x,
                    y: z
                };
                hexMesh.userData.worldCoordinates = {
                    x: worldX,
                    z: worldZ
                };
                scope.scene.add(hexMesh);

                if (hexMesh.visible && Math.random() < .05) {
                    var castle = getCastleObject(worldX, worldZ).then(function(castle) {
                        scope.scene.add(castle);

                        var castleLight = new THREE.PointLight(0xFFFFFF, 2, 2, 2);
                        castleLight.position.x = castle.position.x;
                        castleLight.position.y = 1;
                        castleLight.position.z = castle.position.z;
                        scope.scene.add(castleLight);

                    });
                }
            }
        }

        scope.camera.lookAt(0, -1, 5);

        scope.projector = new THREE.Projector();
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
    }

    function render() {
        requestAnimationFrame(render);
        scope.controls.update();
        scope.renderer.render(scope.scene, scope.camera);
    }

    function onMouseDown(event) {
        var bounds = scope.container.getBoundingClientRect();
        scope.mouse.down = {
            x: ((event.clientX - bounds.left) / scope.renderer.domElement.clientWidth) * 2 - 1,
            y: -((event.clientY - bounds.top) / scope.renderer.domElement.clientHeight) * 2 + 1
        };
    }

    function onMouseUp(event) {
        var bounds = scope.container.getBoundingClientRect();
        scope.mouse.up = {
            x: ((event.clientX - bounds.left) / scope.renderer.domElement.clientWidth) * 2 - 1,
            y: -((event.clientY - bounds.top) / scope.renderer.domElement.clientHeight) * 2 + 1
        };

        // Only register hex click if mouse up in in same position as mouse down
        if (JSON.stringify(scope.mouse.down) != JSON.stringify(scope.mouse.up)) {
            return;
        }

        scope.raycaster.setFromCamera(scope.mouse.down, scope.camera);
        var intersects = scope.raycaster.intersectObjects( scope.targetList );
        
        // if there is one (or more) intersections
        if (intersects.length > 0) {
            scope.selectedHex = intersects[0].object;

            scope.selectionGlow.visible = true;
            var hexPosition = scope.selectedHex.getWorldPosition();
            scope.selectionGlow.position.x = hexPosition.x;
            scope.selectionGlow.position.z = hexPosition.z;
            var data = scope.selectedHex.userData;
            console.log(data);

            updateHexHud();
        }
        else {
            scope.selectionGlow.visible = false;
            scope.selectedHex = null;

            updateHexHud();
        }
    }

    function updateHexHud() {
        if (scope.selectedHex) {
            var data = scope.selectedHex.userData;
            $('.coordinates').html('(' + data.coordinates.x + ', ' + data.coordinates.y + ')');
        }
        else {
            $('.coordinates').html('');
        }
    }

    function getCastleObject(x, z) {
        return new Promise(function(resolve, reject) {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.load('/models/fortress/SM_Fortress.mtl', function(materials) {
                materials.preload();

                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load('/models/fortress/SM_Fortress.obj', function(object) {
                    object.scale.x = object.scale.y = object.scale.z = .006;
                    object.position.x = x;
                    object.position.z = z;
                    object.position.y = .01;
                    resolve(object);
                })
            });
        });
    }

    function getHexMesh() {
        var hexShape = new THREE.Shape();
        var angle = 1.7320508075688767;
        var h = angle * 0.5;
        hexShape.moveTo(h, 0.5);
        hexShape.lineTo(0, 1);
        hexShape.lineTo(-h, 0.5);
        hexShape.lineTo(-h, -0.5);
        hexShape.lineTo(0, -1);
        hexShape.lineTo(h, -0.5);
        hexShape.lineTo(h, 0.5);

        var hexGeometry = new THREE.ShapeGeometry(hexShape);
        var hexMaterial = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        var hexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
        hexMesh.rotation.x = -Math.PI / 2;

        hexMesh.scale.x = hexMesh.scale.y = .98;

        return hexMesh;
    }
};

var map;
window.setTimeout(function() {
    map = new EOEMap('scene');
    map.run();
}, 10);