// Scripts for dashboard.html
// 3D Avatar Viewer Setup
        let scene, camera, renderer, avatar;

        function init3DViewer() {
            const canvas = document.getElementById('canvas3d');
            const container = canvas.parentElement;
            
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e);

            // Camera setup
            const width = container.clientWidth;
            const height = 400;
            camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.z = 3;

            // Renderer setup
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(window.devicePixelRatio);

            // Create Avatar Group
            avatar = new THREE.Group();
            scene.add(avatar);

            // Head
            const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const skinMaterial = new THREE.MeshPhongMaterial({
                color: 0xf4a460,
                emissive: 0x333333,
                shininess: 60
            });
            const head = new THREE.Mesh(headGeometry, skinMaterial);
            head.position.y = 0.7;
            avatar.add(head);

            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.2, 1.1, 0.55);
            avatar.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.2, 1.1, 0.55);
            avatar.add(rightEye);

            // Eyes shine
            const shineGeometry = new THREE.SphereGeometry(0.06, 8, 8);
            const shineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x888888 });
            
            const leftShine = new THREE.Mesh(shineGeometry, shineMaterial);
            leftShine.position.set(-0.1, 1.15, 0.7);
            avatar.add(leftShine);

            const rightShine = new THREE.Mesh(shineGeometry, shineMaterial);
            rightShine.position.set(0.3, 1.15, 0.7);
            avatar.add(rightShine);

            // Mouth
            const mouthGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
            const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0xd17f7f });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 0.4, 0.58);
            avatar.add(mouth);

            // Body
            const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6b6b,
                emissive: 0xff6b6b,
                emissiveIntensity: 0.2
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = -0.5;
            avatar.add(body);

            // Left Arm
            const armGeometry = new THREE.BoxGeometry(0.25, 0.9, 0.3);
            const armMaterial = new THREE.MeshPhongMaterial({ color: 0xf4a460 });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.6, 0, 0);
            leftArm.rotation.z = 0.3;
            avatar.add(leftArm);

            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.6, 0, 0);
            rightArm.rotation.z = -0.3;
            avatar.add(rightArm);

            // Left Leg
            const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.3);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.3, -1.3, 0);
            avatar.add(leftLeg);

            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.3, -1.3, 0);
            avatar.add(rightLeg);

            // Hair/Spiky top (using cones)
            const spikeGeometry = new THREE.ConeGeometry(0.12, 0.4, 8);
            const spikeMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
            
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
                spike.position.set(
                    Math.cos(angle) * 0.5,
                    1.3,
                    Math.sin(angle) * 0.5
                );
                spike.rotation.z = 0.3;
                avatar.add(spike);
            }

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
            directionalLight.position.set(5, 10, 5);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0xff6b6b, 0.6);
            pointLight.position.set(-5, 5, 5);
            scene.add(pointLight);

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                avatar.rotation.y += 0.01;
                
                // Subtle arm movement
                const armRotation = Math.sin(Date.now() * 0.002) * 0.2;
                if (avatar.children.length > 3) {
                    avatar.children.forEach(child => {
                        if (child.position && child.position.x !== 0) {
                            child.rotation.z += armRotation * 0.01;
                        }
                    });
                }
                
                renderer.render(scene, camera);
            }
            animate();

            // Handle resize
            window.addEventListener('resize', onWindowResize);
        }

        function onWindowResize() {
            const canvas = document.getElementById('canvas3d');
            const container = canvas.parentElement;
            const width = container.clientWidth;
            const height = 400;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        // Logout functionality
        document.querySelector('.logout-btn').addEventListener('click', function() {
            if(confirm('Are you sure you want to logout?')) {
                // Clear auth/session data from sessionStorage so logout is immediate
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('authToken');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('loginTime');
                // Keep persistent KYC/game data in localStorage; remove if desired
                localStorage.removeItem('kycCompleted');
                localStorage.removeItem('kycName');
                localStorage.removeItem('gameSignup');
                localStorage.removeItem('gameUser');
                window.location.href = '/pages/auth/login/login.html';
            }
        });

        // Add animation on load
        window.addEventListener('load', function() {
            init3DViewer();
            
            const cards = document.querySelectorAll('.user-profile-card, .stats-section, .games-list-card, .recent-activity');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
            });
        });
