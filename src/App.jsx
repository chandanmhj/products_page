import { useEffect, useRef, useState } from "react";
import Scene from "./Scene.jsx";
import { PRODUCTS } from "./products.js";

const hoverScene = (on) => window.dispatchEvent(new CustomEvent("scene-hover", { detail: on }));

function Cursor() {
  const r = useRef(null);
  useEffect(() => {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, id;
    const mv = (e) => { tx = e.clientX; ty = e.clientY; };
    addEventListener("pointermove", mv);
    const f = () => { x += (tx - x) * 0.18; y += (ty - y) * 0.18; r.current.style.transform = `translate(${x}px,${y}px)`; id = requestAnimationFrame(f); };
    f();
    return () => { removeEventListener("pointermove", mv); cancelAnimationFrame(id); };
  }, []);
  return <div ref={r} className="cur" aria-hidden="true" />;
}

function Card({ p }) {
  const ref = useRef(null);
  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    const b = ref.current.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  };
  return (
    <a ref={ref} className="card" href={`#${p.id}`} onPointerMove={move}
       onPointerEnter={() => hoverScene(true)}
       onPointerLeave={() => { ref.current.style.transform = ""; hoverScene(false); }}>
      <div className="top mono"><span>[ {p.num} ]</span><span>{p.kind}</span></div>
      <h2>{p.name}</h2>
      <p className="tags mono">{p.stack}</p>
      <p className="d">{p.short}</p>
      <div className="more mono"><span>View dossier</span><span aria-hidden="true">→</span></div>
    </a>
  );
}

function Dossier({ p, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="dossier-title" onClose={onClose}
            onClick={(e) => e.target === ref.current && ref.current.close()}>
      <div className="dossier">
        <div className="top mono"><span>[ {p.num} ] / Dossier</span><span>{p.kind}</span></div>
        <h2 id="dossier-title">{p.name}</h2>
        <p className="mono sub">{p.alt}</p>
        <h3 className="mono">What it does</h3><p>{p.what}</p>
        <h3 className="mono">Who it is for</h3><p>{p.who}</p>
        <h3 className="mono">How it works</h3>
        <ol>{p.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <h3 className="mono">Stack</h3><p>{p.tech}</p>
        <div className="actions">
          <a className="btn fill mono" href={p.url} rel="noopener">{p.cta}</a>
          <button className="btn mono" onClick={() => ref.current.close()}>Close</button>
        </div>
      </div>
    </dialog>
  );
}

export default function App() {
  const [openId, setOpenId] = useState(() => location.hash.slice(1));
  useEffect(() => {
    const f = () => setOpenId(location.hash.slice(1));
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const open = PRODUCTS.find((p) => p.id === openId);
  const close = () => { history.replaceState(null, "", location.pathname); setOpenId(""); };

  return (
    <>
      <Scene />
      <Cursor />
      <div className="page">
        <header>
          <div className="wrap">
            <a className="logo" href="https://chandanmhj.in">CHANDAN MHJ</a>
            <nav className="mono" aria-label="Main"><a href="/" aria-current="page">Products</a></nav>
            <a className="btn mono" href="https://www.linkedin.com/in/chandanmhj" rel="noopener">Get in touch</a>
          </div>
        </header>
        <main className="wrap">
          <section className="head">
            <div><p className="mono dim">01 / Product archive</p><h1>Products</h1></div>
            <p className="note mono">New releases posted regularly · Click a card for details</p>
          </section>
          <p className="intro">Tools and apps built by Chandan Murthy HJ, a data scientist and AI engineer who likes turning complex problems into systems that actually work.</p>
          <section className="grid" aria-label="Products">
            {PRODUCTS.map((p) => <Card key={p.id} p={p} />)}
            <div className="card soon">
              <div className="top mono"><span>[ {String(PRODUCTS.length + 1).padStart(2, "0")} ]</span><span>Coming soon</span></div>
              <h2>Next release</h2>
              <p className="tags mono">In development</p>
              <p className="d">More products are on the way. Check back regularly.</p>
            </div>
          </section>
        </main>
        <footer>
          <div className="wrap">
            <a className="btn mono" href="https://chandanmhj.in" rel="noopener">Meet the developer</a>
            <span className="mono dim">© 2026 Chandan MHJ</span>
          </div>
        </footer>
      </div>
      {open && <Dossier key={open.id} p={open} onClose={close} />}
    </>
  );
}
