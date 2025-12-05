"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    alpha: number;
    type: "ember" | "click";
}

export default function CursorEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationRef = useRef<number>(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Mouse move - subtle ember trail
        let lastX = 0, lastY = 0;
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const speed = Math.sqrt(dx * dx + dy * dy);

            mouseRef.current = { x: e.clientX, y: e.clientY };

            if (speed > 5 && Math.random() > 0.7) {
                particlesRef.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 8,
                    y: e.clientY + (Math.random() - 0.5) * 8,
                    vx: -dx * 0.03 + (Math.random() - 0.5) * 0.5,
                    vy: -dy * 0.03 + (Math.random() - 0.5) * 0.5,
                    life: 40,
                    maxLife: 40,
                    size: Math.random() * 2 + 1,
                    alpha: 0.6,
                    type: "ember",
                });
            }
            lastX = e.clientX;
            lastY = e.clientY;
        };

        // Click - sharp geometric burst
        const handleClick = (e: MouseEvent) => {
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 * i) / 12;
                const speed = Math.random() * 3 + 2;
                particlesRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 30,
                    maxLife: 30,
                    size: Math.random() * 2 + 1,
                    alpha: 0.8,
                    type: "click",
                });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);

        // Animation
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((p) => {
                p.life--;
                p.x += p.vx;
                p.y += p.vy;

                if (p.type === "click") {
                    p.vx *= 0.92;
                    p.vy *= 0.92;
                } else if (p.type === "ember") {
                    p.vx *= 0.95;
                    p.vy *= 0.95;
                    p.vy -= 0.02;
                }

                const lifeRatio = Math.max(0, p.life / p.maxLife);
                const size = Math.max(0.1, p.size * (p.type === "click" ? lifeRatio : 1));

                if (p.type === "ember") {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(180, 220, 255, ${lifeRatio * 0.7})`;
                    ctx.fill();
                } else if (p.type === "click") {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
                    ctx.strokeStyle = `rgba(200, 230, 255, ${lifeRatio * 0.6})`;
                    ctx.lineWidth = size * 0.8;
                    ctx.stroke();
                }

                return p.life > 0;
            });

            // Subtle mouse glow
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, 80
            );
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.03)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.beginPath();
            ctx.arc(mouseRef.current.x, mouseRef.current.y, 80, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
            cancelAnimationFrame(animationRef.current);
        };
    }, [mounted]);

    if (!mounted) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
}
