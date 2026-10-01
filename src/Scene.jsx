import { useEffect, useRef } from "react";
import {
  WebGLRenderer, Scene as TScene, PerspectiveCamera, LineSegments, EdgesGeometry, LineBasicMaterial,
  IcosahedronGeometry, OctahedronGeometry, DodecahedronGeometry, TetrahedronGeometry, Mesh, TorusGeometry,
  MeshBasicMaterial, GridHelper, BufferGeometry, BufferAttribute, Points, PointsMaterial, Vector3, Color,
} from "three";

const CREAM = new Color(0xf3ebdd);
const CYAN = new Color(0x00e5ff);

export default function Scene() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let renderer;
    try { renderer = new WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
    const small = innerWidth < 700;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new TScene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 0, 12);

    const shapes = [
      [new IcosahedronGeometry(1, 1), -7, 3, -2, 2.4],
      [new OctahedronGeometry(1, 0), 8, -2, -3, 1.8],
      [new DodecahedronGeometry(1, 0), 6, 5, -6, 1.4],
      [new TetrahedronGeometry(1, 0), -8, -5, -4, 1.6],
    ].map(([g, x, y, z, s]) => {
      const m = new LineSegments(new EdgesGeometry(g), new LineBasicMaterial({ color: CREAM, transparent: true, opacity: 0.4 }));
      m.position.set(x, y, z);
      m.scale.setScalar(s);
      m.userData = { ox: x, base: new Vector3(x, y, z), vel: new Vector3(), heat: 0, kick: 0, spin: 0.1 + Math.random() * 0.2 };
      scene.add(m);
      return m;
    });

    const ring = new Mesh(new TorusGeometry(5, 0.012, 8, 128), new MeshBasicMaterial({ color: CREAM, transparent: true, opacity: 0.2 }));
    ring.position.set(7, -3, -8);
    ring.rotation.x = 1.2;
    scene.add(ring);

    const grid = new GridHelper(120, 60, CREAM, CREAM);
    grid.material.transparent = true;
    grid.material.opacity = 0.08;
    grid.position.y = -8;
    scene.add(grid);

    const N = small ? 400 : 900;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = -Math.random() * 60;
    }
    const sg = new BufferGeometry();
    sg.setAttribute("position", new BufferAttribute(pos, 3));
    const stars = new Points(sg, new PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.7 }));
    scene.add(stars);

    const ptr = { x: 0, y: 0 };
    let hover = 0, hoverTarget = 0, raf = 0, last = performance.now();
    const dir = new Vector3(), mp = new Vector3(), tmp = new Vector3();

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const fit = Math.min(1, camera.aspect / 1.6);
      shapes.forEach((m) => { m.userData.base.x = m.userData.ox * fit; });
      if (reduce) { shapes.forEach((m) => m.position.copy(m.userData.base)); renderer.render(scene, camera); }
    };
    const onMove = (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -((e.clientY / innerHeight) * 2 - 1); };
    const onDown = () => shapes.forEach((m) => {
      m.userData.kick = 1;
      m.userData.vel.add(new Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(0.4));
    });
    const onHover = (e) => { hoverTarget = e.detail ? 1 : 0; };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      camera.position.x += (ptr.x * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (ptr.y * 0.8 - scrollY * 0.004 - camera.position.y) * 0.05;
      camera.lookAt(0, -scrollY * 0.002, 0);
      camera.updateMatrixWorld();
      hover += (hoverTarget - hover) * 0.08;
      dir.set(ptr.x, ptr.y, 0.5).unproject(camera).sub(camera.position).normalize();
      for (const m of shapes) {
        const u = m.userData;
        const k = (m.position.z - camera.position.z) / dir.z;
        mp.copy(dir).multiplyScalar(k).add(camera.position); // pointer position at this shape's depth
        tmp.copy(m.position).sub(mp);
        tmp.z = 0;
        const near = Math.max(0, 1 - tmp.length() / 5);
        u.heat += (near - u.heat) * 0.1;
        if (near > 0) u.vel.addScaledVector(tmp.normalize(), near * 0.02); // pushed away by the pointer
        u.vel.multiplyScalar(0.92);
        m.position.add(u.vel);
        m.position.lerp(u.base, 0.02);
        u.kick *= 0.94;
        const sp = (u.spin + u.heat * 1.2 + hover * 0.5 + u.kick * 5) * dt;
        m.rotation.x += sp;
        m.rotation.y += sp * 1.3;
        m.material.color.copy(CREAM).lerp(CYAN, Math.max(u.heat, hover * 0.5));
        m.material.opacity = 0.4 + u.heat * 0.4;
      }
      ring.rotation.z += dt * 0.1;
      ring.rotation.y = ptr.x * 0.3;
      stars.rotation.y = now * 0.00001 + ptr.x * 0.05;
      stars.position.x += (-ptr.x * 1.5 - stars.position.x) * 0.03;
      stars.position.y += (-ptr.y * 1.0 - stars.position.y) * 0.03;
      grid.position.z = (now * 0.0015) % 2;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    resize();
    shapes.forEach((m) => m.position.copy(m.userData.base));
    addEventListener("resize", resize);
    if (!reduce) {
      addEventListener("pointermove", onMove);
      addEventListener("pointerdown", onDown);
      addEventListener("scene-hover", onHover);
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("scene-hover", onHover);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} className="scene" aria-hidden="true" />;
}
