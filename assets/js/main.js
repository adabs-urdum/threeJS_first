(function($) {

  $.fn.ThreeUdemy = function() {
    var $main = $(this),
        scene,
        cameraPerspectiveCamera,
        cameraOrthographicCamera,
        renderer,
        cube,
        movementXcube,
        movementYcube,
        movementZcube,
        rotationX,
        rotationY,
        rotationZ,
        axes,
        sphere,
        donuts,
        donutSpeed,
        planet,
        rings,
        movementXcamera,
        movementYcamera,
        movementZcamera,
        customShape,
        loader,
        normals,
        depthCube,
        depthSphere,
        depthMovementSpeed,
        lambertCube,
        lambertSphere,
        lambertCone,
        directionalLightUp,
        pointLight,
        theta,
        spotLight1,
        spotLight2,
        spotLightSpeed,
        thetaCamera,
        thetaCameraMovement,
        pauseCameraMove,
        rayCast,
        mouse,
        rayIntersects,
        lambertSphereTexture,
        hollowWorld,
        lambertConeSpeed,
        lookAtCone,
        shadow;

    function init(){
      setVars();
      initThree();
      bindEvents();
      mainLoop();
    }

    function setVars(){
      movementXcube = 0.0015;
      movementYcube = 0.003;
      movementZcube = 0.0023;
      movementXsphere = -0.0017;
      movementYsphere = -0.004;
      movementZsphere = -0.0028;
      rotationX = 0.003;
      rotationY = 0.007;
      rotationZ = 0.0015;
      axes = new THREE.AxesHelper(5);
      movementXcamera = 0.0012;
      movementYcamera = -0.001;
      movementZcamera = -0.0015;
      donuts = [];
      rings = [];
      donutSpeed = 0.01;
      depthMovementSpeed = 0.1;
      theta = 0.1;
      thetaCamera = 0.002;
      thetaCameraMovement = 0.002;
      spotLightSpeed = 0.05;
      pauseCameraMove = false;
      lambertConeSpeed = -0.01;
      lambertCubeSpeed = 0.005;
      lookAtCone = false;
    }

    function initThree(){
      scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xffffff);

      // createHollowWorld();

      createlambertSphereTexture();

      createPerspectiveCamera();
      // createOrthographicCamera();

      createRaycaster();

      // createCube();
      // createSphere();
      // createTorus();
      createSaturn();
      // createCustomGeometry();
      // createDepthObjects();
      createLightedObjects();
      // createGround();

      createDirectionalLight();
      // createAmbientLight();
      // createHemisphereLight();
      createPointLight();
      createSpotLight();

      createRenderer();
    }

    function bindEvents(){
      document.addEventListener('keydown', onKeyDownHandler, false);
      document.addEventListener('click', onClickHandler, false);
      // document.addEventListener('mousemove', onMouseMove, false);
    }

    function createRenderer(){
      renderer = new THREE.WebGLRenderer();
      // renderer.shadowMap.enabled = true;
      // renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
    }

    function createHollowWorld(){
      var texture = new THREE.TextureLoader().load('./dist/img/hubbleDeepField.jpg'),
          material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          }),
          geometry = new THREE.SphereGeometry(150, 100, 100);

      hollowWorld = new THREE.Mesh(geometry, material);
      scene.add(hollowWorld);
    }

    function createRaycaster(){
      rayCast = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      mouse.x = mouse.y = -1;
    }

    function createlambertSphereTexture(){
      lambertSphereTexture = new THREE.TextureLoader().load('./dist/img/marmor.jpg');

      // console.log(lambertSphereTexture);
    }

    function onClickHandler(e){
      var xClicked = e.clientX,
          yClicked = e.clientY;

      // thetaCameraMovement = thetaCameraMovement * -1;

      mouse.x = (xClicked / window.innerWidth) * 2 - 1;
      mouse.y = -(yClicked / window.innerHeight) * 2 + 1;
      mouse.z = 1;

      rayCast.setFromCamera(mouse, camera);

      rayIntersects = rayCast.intersectObjects(scene.children);

      if(rayIntersects.length){
        rayIntersects[0].object.material.color.set(Math.random() * 0xffffff);
      }
      else{
        var donut = createDonut(0,0,0,true,90),
            distance = (Math.random() - 1) * -20;
        var ray = rayCast.ray.at(distance, donut.position);
      }
    }

    function onMouseMove(e){
      var xMoved = e.clientX,
          yMoved = e.clientY;

      mouse.x = (xMoved / window.innerWidth) * 2 - 1;
      mouse.y = -(yMoved / window.innerHeight) * 2 + 1;
      mouse.z = 1;

      rayCast.setFromCamera(mouse, camera);
      rayIntersects = rayCast.intersectObjects(scene.children);

      rayIntersects.forEach(function(item){
        var object = item.object,
            name = object.name,
            position = object.position;
        if(name == 'donut'){
          position.y += 0.1;
        }
      });
    }

    function onKeyDownHandler(e){
      var pressedKey = e.keyCode;

      console.log('pressesKey: ' + pressedKey);

      //Spacebar
      if(pressedKey == 32){
        pauseCameraMove ? pauseCameraMove = false : pauseCameraMove = true;
      }
      //Arrow left
      else if (pressedKey == 37){
        if( thetaCameraMovement > 0 ){
          thetaCameraMovement = thetaCameraMovement * -1;
        }
      }
      //Arrow right
      else if (pressedKey == 39){
        if( thetaCameraMovement < 0 ){
          thetaCameraMovement = thetaCameraMovement * -1;
        }
      }
      //arrow Up
      else if (pressedKey == 38){
        thetaCameraMovement <= 0 ? thetaCameraMovement -= 0.005 : thetaCameraMovement += 0.005;
      }
      //Arrow down
      else if (pressedKey == 40){
        thetaCameraMovement >= 0 ? thetaCameraMovement -= 0.005 : thetaCameraMovement += 0.005;
      }
      // C to change camera view
      else if (pressedKey == 67){
        lookAtCone ? lookAtCone = false : lookAtCone = true;
      }

    }

    function createPerspectiveCamera(){
      cameraPerspectiveCamera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501);
      cameraPerspectiveCamera.position.z = 10;
      cameraPerspectiveCamera.position.x = 0;
      cameraPerspectiveCamera.position.y = 0;
      camera = cameraPerspectiveCamera;
    }

    function getCameraDistance(origine, h, v, distance){
      origine = origine || new THREE.Vector3();

      var p = new THREE.Vector3(),
          phi = v * Math.PI / 180,
          theta = h * Math.PI / 180;

      p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
      p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
      p.y = (distance * Math.cos(phi)) + origine.y;

      return p;
    }

    function moveCamera(){
      if(!pauseCameraMove){
        if(!lookAtCone){
          lambertCone.remove(camera);
          camera.position.x = 12 * Math.sin(thetaCamera);
          camera.position.z = 12 * Math.cos(thetaCamera);
          camera.lookAt(new THREE.Vector3(0,0,-5));
          thetaCamera += thetaCameraMovement;
        }
        else{
          var camPos = getCameraDistance(lambertCone.position, -20, -20, 1);
          lambertCone.add(camera);
          camera.position.x = camPos.x;
          camera.position.y = camPos.y;
          camera.position.z = camPos.z;
          camera.lookAt(lambertCone.position);
        }
      }
    }

    function createOrthographicCamera(){
      cameraOrthographicCamera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 1000);
      cameraOrthographicCamera.zoom = 7;
      cameraOrthographicCamera.updateProjectionMatrix();
      camera = cameraOrthographicCamera;
    }

    function createHemisphereLight(){
      var light = new THREE.HemisphereLight(0x116800, 0x750054, 0.25);
      scene.add(light);
    }

    function createDirectionalLight(){
      directionalLightUp = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLightUp.castShadow = true;
      directionalLightUp.position.x = 0;
      directionalLightUp.position.y = 0;
      directionalLightUp.position.z = 15;
      directionalLightUp.target = lambertSphere;
      scene.add(directionalLightUp);
    }

    function createPointLight(){
      pointLight = new THREE.PointLight(0xffffff, 0.7, 50, 2);
      pointLight.position.y = 5;
      scene.add(pointLight);
    }

    function movePointLight(){
      pointLight.position.x = 7 * Math.sin(theta);
      pointLight.position.z = 7 * Math.cos(theta);
      theta += 0.01;
    }

    function createAmbientLight(){
      var light = new THREE.AmbientLight( 0x63000, 1 );
      scene.add(light);
    }

    function createSpotLight(){
      spotLight1 = new THREE.SpotLight(0xff8300, 1, 500, Math.PI / 4, 0.1, 1);
      spotLight1.position.x = 5;
      spotLight1.position.y = 5;
      spotLight1.position.z = -4;
      spotLight1.target = lambertCube;
      spotLight1.castShadow = true;
      // spotLight1.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501));
      // spotLight1.shadow.bias = 0.0001;
      // spotLight1.shadow.mapSize.width = 2048;
      // spotLight1.shadow.mapSize.height = 1024;
      scene.add(spotLight1);

      spotLight2 = new THREE.SpotLight(0xff00dc, 0.5, 500, Math.PI / 4, 0.1, 1);
      spotLight2.position.x = -5;
      spotLight2.position.y = 5;
      spotLight2.position.z = -6;
      spotLight2.target = lambertCone;
      spotLight2.castShadow = true;
      // spotLight2.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501));
      // spotLight2.shadow.bias = 0.0001;
      // spotLight2.shadow.mapSize.width = 2048;
      // spotLight2.shadow.mapSize.height = 1024;
      scene.add(spotLight2);
    }

    function moveSpotLight(){
      spotLight1.position.x -= spotLightSpeed;
      spotLight2.position.x += spotLightSpeed;

      if(spotLight1.position.x >= 3 || spotLight1.position.x <= -3){
        spotLightSpeed = spotLightSpeed * -1;
      }
    }

    function moveCube(){
      cube.position.x += movementXcube;
      cube.position.y += movementYcube;
      cube.position.z += movementZcube;

      if(cube.position.x >= 1 || cube.position.x <= -1){
        movementXcube = movementXcube * -1;
      }

      if(cube.position.y >= 0.75 || cube.position.y <= -0.75){
        movementYcube = movementYcube * -1;
      }

      if(cube.position.z >= 7 || cube.position.z <= -7){
        movementZcube = movementZcube * -1;
      }
    }

    function rotateSphere(){
      sphere.rotation.x += rotationX;
      sphere.rotation.y += 0.3;
      sphere.rotation.z += 0.08;
    }

    function moveSphere(){
      sphere.position.x += movementXsphere;
      sphere.position.y += movementYsphere;
      sphere.position.z += movementZsphere;

      if(sphere.position.x >= 1 || sphere.position.x <= -1){
        movementXsphere = movementXsphere * -1;
      }

      if(sphere.position.y >= 0.75 || sphere.position.y <= -0.75){
        movementYsphere = movementYsphere * -1;
      }

      if(sphere.position.z >= 7 || sphere.position.z <= -7){
        movementZsphere = movementZsphere * -1;
      }
    }

    function rotateTorus(){
      torus.rotation.x += 0.0015;
      torus.rotation.y += 0.002;
    }

    function rotateCube(){
      cube.rotation.x += rotationX;
      cube.rotation.y += 0.015;
      cube.rotation.z += 0.04;
      // normals.update();
    }

    function createGround(){
      var material = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.1,
            metalness: 1,
            roughness: 0,
          }),
          geometry = new THREE.BoxGeometry(50, 5, 500),
          ground = new THREE.Mesh(geometry, material);
      ground.position.x = 0;
      ground.position.y = -5;
      ground.position.z = -5;
      scene.add(ground);
    }

    function createLightedObjects(){
      var material = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.1,
        map: lambertSphereTexture
      });
      var geometry = new THREE.BoxGeometry(0.25,0.25,0.25);
      lambertCube = new THREE.Mesh(geometry, material);
      lambertCube.position.x = -4;
      lambertCube.position.z = -5;

      material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
        shininess: 50,
        specular: 0xffffff
      });
      geometry = new THREE.SphereGeometry(0.75,30,30);
      lambertSphere = new THREE.Mesh(geometry, material);
      lambertSphere.position.x = 0;
      lambertSphere.position.z = -5;
      // lambertSphere.receiveShadow = true;
      // lambertSphere.castShadow = true;

      material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.3,
        metalness: 1,
        roughness: 0.5,
      });
      geometry = new THREE.ConeGeometry(0.2,.3,300,1,true);
      lambertCone = new THREE.Mesh(geometry, material);
      lambertCone.position.x = 3.5;
      lambertCone.position.z = -5;

      scene.add(lambertCube);
      scene.add(lambertSphere);
      scene.add(lambertCone);
    }

    function moveLambertCone(){
      lambertCone.position.x = 3.5 * Math.sin(lambertConeSpeed);
      lambertCone.position.z = 3.5 * Math.cos(lambertConeSpeed) - 5;
      lambertConeSpeed -= 0.01;
    }

    function moveLambertCube(){
      lambertCube.position.y = 2 * Math.cos(lambertCubeSpeed);
      lambertCube.position.x = 2 * Math.sin(lambertCubeSpeed);
      lambertCubeSpeed += 0.005;
    }

    function rotateLightedObjects(){
      lambertCube.rotation.x += 0.01;
      lambertCube.rotation.y += 0.008;
      lambertCube.rotation.z += 0.007;

      lambertCone.rotation.x += 0.007;
      lambertCone.rotation.y += 0.01;
      lambertCone.rotation.z += 0.008;

      lambertSphere.rotation.x += 0.008;
      lambertSphere.rotation.y += 0.007;
      lambertSphere.rotation.z += 0.01;
    }

    function rotateRings(){
      rings.forEach(function(ring, index){
        var variation = index * 0.01 + 0.01;
        ring.rotation.x -= variation;
        ring.rotation.y -= variation;
      });
    }

    function createDonut(x, y, z, clicked, randomPoints){
      var random = Math.random(),
          donut;

      if(randomPoints == undefined){
        randomPoints = Math.floor(Math.random() * 10);
      }

      if(randomPoints <= 3){
        randomPoints = 3;
      }

      if(clicked == undefined){
        clicked = false;
      }

      if(random <= 0.1 || clicked){
        var geometry = new THREE.TorusGeometry(0.25, 0.1, 50, randomPoints),
            // color = Math.random() * 0xffffff,
            color = 0x1e1e1e,
            // color = 0xffffff,
            material = new THREE.MeshPhongMaterial({
              side: THREE.DoubleSide,
              color: color,
              emissive: color,
              emissiveIntensity: 0.3,
              shininess: 100,
              specular: 0xffffff,
              transparent: true,
              opacity: 0.35,
              // opacity: 1,
            });
        donut = new THREE.Mesh(geometry, material);

        if(x == undefined){
          x = (Math.random() - 0.5) * -20;
        }

        if(y == undefined){
          y = 7;
        }

        if(z == undefined){
          z = (Math.random() - 0.5) * -20 - 5;
        }

        donut.name = "donut";
        donut.position.x = x;
        donut.position.y = y;
        donut.position.z = z;
        donut.speed = Math.random() / 25;

        scene.add(donut);
        donuts.push(donut);

      }
      return donut;
    }

    function moveDonuts(){
      donuts.forEach(function(cur, index){
        cur.position.y -= cur.speed;
        cur.rotation.x += 0.01;
        cur.rotation.y += 0.03;
        cur.rotation.z += 0.05;
        if(cur.position.y <= -5){
          donuts.splice(index, 1);
          scene.remove(cur);
        }
      });
    }

    function createCube(){
      var geometry = new THREE.BoxGeometry(1, 1, 1),
          material = new THREE.MeshNormalMaterial({
            color: 0x00a1cb,
            transparent: true,
            opacity: 0.8,
            // wireframe: true
          });

      cube = new THREE.Mesh(geometry, material);
      cube.position.z = -4;
      scene.add(cube);

      // normals = new THREE.FaceNormalsHelper(cube, 3);
      // scene.add(normals);

    }

    function createDepthObjects(){
      var material = new THREE.MeshDepthMaterial();
      material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1
      });
      material = new THREE.LineDashedMaterial({
        color: 0xffffff,
        linewidth: 3,
        dashSize: 1,
        gapSize: 0.25
      });
      material = new THREE.PointsMaterial({
        color: 0xffffff
      });

      var geometry = new THREE.BoxGeometry(1,1,1);
      depthCube = new THREE.Mesh(geometry, material);
      depthCube = new THREE.Line(geometry, material);
      depthCube.computeLineDistances();
      depthCube = new THREE.Points(geometry, material);
      depthCube.position.z = 0;
      depthCube.position.x = -1.5;

      geometry = new THREE.SphereGeometry(0.5, 30, 30);
      depthSphere = new THREE.Mesh(geometry, material);
      depthSphere = new THREE.Line(geometry, material);
      depthSphere.computeLineDistances();
      depthSphere = new THREE.Points(geometry, material);
      depthSphere.position.z = 0;
      depthSphere.position.x = 1.5;

      scene.add(depthCube);
      scene.add(depthSphere);
    }

    function moveDepthObjects(){
      depthCube.position.z += depthMovementSpeed;
      depthSphere.position.z -= depthMovementSpeed;

      if(depthCube.position.z >= 5 || depthCube.position.z <= -5){
        depthMovementSpeed = depthMovementSpeed * -1;
      }
    }

    function createTorus(){
      var geometry = new THREE.TorusGeometry(0.75, 0.1, 3, 30, Math.PI * 2),
          material = new THREE.MeshBasicMaterial({
            color: 0xFF00FF,
            // wireframe: true
          });

      torus = new THREE.Mesh(geometry, material);
      // scene.add(torus);
    }

    function createSphere(){
      var geometry = new THREE.SphereGeometry(0.5, 30, 30, 0, Math.PI, 0, Math.PI * 2),
          material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            wireframe: true
          });

      sphere = new THREE.Mesh(geometry, material);
      // scene.add(sphere);
    }

    function createCustomGeometry(){
      var geometry = new THREE.Geometry();

      geometry.vertices.push(new THREE.Vector3(0,0,7));
      geometry.vertices.push(new THREE.Vector3(-1.5,1,5));
      geometry.vertices.push(new THREE.Vector3(1,-1.5,-10));
      geometry.vertices.push(new THREE.Vector3(0.75,-0.75,7));

      geometry.faces.push(new THREE.Face3(0,1,2));
      geometry.faces.push(new THREE.Face3(1,2,3));

      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        // wireframe: true,
      });

      customShape = new THREE.Mesh(geometry, material);

      scene.add(customShape);
    }

    function rotateCustomGeometry(){
      customShape.rotation.x += 0.005;
      customShape.rotation.y += 0.005;
    }

    function createSaturn(){
      var ring,
          geometry = new THREE.SphereGeometry(0.5, 30, 30, 0, Math.PI, 0, Math.PI * 2),
          material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            // wireframe: true
          });

      planet = new THREE.Mesh(geometry, material);
      // scene.add(planet);

      geometry = new THREE.TorusGeometry(1, 0.1, 3, 300, Math.PI * 2);
      material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color: 0xffe39f,
        emissive: 0xffe39f,
        emissiveIntensity: 0.3,
        metalness: 1,
        roughness: 0.5,
      });
      ring = new THREE.Mesh(geometry, material);
      ring.position.z = -5;
      // ring.receiveShadow = true;
      ring.castShadow = true;
      rings.push(ring);
      scene.add(ring);

      geometry = new THREE.TorusGeometry(1.25, 0.1, 3, 300, Math.PI * 2);
      material = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0xffad60,
        emissive: 0xffad60,
        emissiveIntensity: 0.1,
      });
      ring = new THREE.Mesh(geometry, material);
      ring.position.z = -5;
      // ring.receiveShadow = true;
      ring.castShadow = true;
      rings.push(ring);
      scene.add(ring);

      geometry = new THREE.TorusGeometry(1.5, 0.1, 3, 300, Math.PI * 2);
      material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0xeac086,
        emissive: 0xeac086,
        emissiveIntensity: 0.3,
        shininess: 100,
        specular: 0xeac086,
      });
      ring = new THREE.Mesh(geometry, material);
      ring.position.z = -5;
      // ring.receiveShadow = true;
      ring.castShadow = true;
      rings.push(ring);
      scene.add(ring);

    }

    function changeShape(){
      customShape.geometry.vertices[0].x -= 0.001
      customShape.geometry.verticesNeedUpdate = true;
    }

    function mainLoop(){

      // moveCube();
      // rotateCube();

      // moveSphere();
      // rotateSphere();
      //
      // rotateTorus();

      // moveDepthObjects();

      createDonut();
      moveDonuts();

      rotateRings();

      moveLambertCone();
      moveLambertCube();

      // rotateCustomGeometry();

      // changeShape();

      rotateLightedObjects();

      // scene.add(axes);

      movePointLight();
      // moveSpotLight();

      moveCamera();

      renderer.render(scene, camera);
      requestAnimationFrame(mainLoop);
    }

    init();
  };

  $threeUdemy = $('body').ThreeUdemy();

})(jQuery);
