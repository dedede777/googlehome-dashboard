"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

// Sound URLs - カスタム音声を追加する場合はここにURLを設定
// 例: sound: "/sounds/aquarium.mp3" または "https://example.com/audio.mp3"
const SCENES = [
    { id: "aquarium", name: "アクアリウム", emoji: "🐠", sound: null },
    { id: "fireplace", name: "暖炉", emoji: "🔥", sound: null },
    { id: "rain", name: "雨の窓", emoji: "🌧️", sound: null },
    { id: "breathing", name: "呼吸", emoji: "🧘", sound: null },
    { id: "lava", name: "ラバランプ", emoji: "🫧", sound: null },
];

const STORAGE_KEY = "dashboard-zen-scene";
const SOUND_KEY = "dashboard-zen-sound";

interface Fish {
    x: number;
    y: number;
    speed: number;
    size: number;
    hue: number;
    direction: number;
    wobble: number;
    depth: number;
}

interface Drop {
    x: number;
    y: number;
    speed: number;
    size: number;
    opacity: number;
}

interface Ripple {
    x: number;
    y: number;
    radius: number;
    opacity: number;
}

interface Blob {
    x: number;
    y: number;
    vy: number;
    size: number;
    targetSize: number;
    hue: number;
    phase: number;
}

interface Ember {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
}

export default function ZenWidget() {
    const [scene, setScene] = useState("aquarium");
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number>(0);
    const dataRef = useRef<{
        fish: Fish[];
        drops: Drop[];
        ripples: Ripple[];
        blobs: Blob[];
        embers: Ember[];
        breathPhase: number;
        time: number;
    }>({
        fish: [],
        drops: [],
        ripples: [],
        blobs: [],
        embers: [],
        breathPhase: 0,
        time: 0,
    });

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedSound = localStorage.getItem(SOUND_KEY);
        if (saved) setScene(saved);
        if (savedSound) setSoundEnabled(savedSound === "true");
    }, []);

    // Handle audio
    useEffect(() => {
        if (!mounted) return;

        const currentScene = SCENES.find((s) => s.id === scene);

        // Stop previous audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Start new audio if enabled and scene has sound
        if (soundEnabled && currentScene?.sound) {
            const audio = new Audio(currentScene.sound);
            audio.loop = true;
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Autoplay blocked - user needs to interact first
            });
            audioRef.current = audio;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [mounted, scene, soundEnabled]);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY, scene);
    }, [scene, mounted]);

    useEffect(() => {
        if (!mounted) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth * 2; // Retina
            canvas.height = canvas.offsetHeight * 2;
            ctx.scale(2, 2);
        };
        resize();

        const w = () => canvas.width / 2;
        const h = () => canvas.height / 2;

        const initScene = () => {
            dataRef.current.time = 0;

            if (scene === "aquarium") {
                dataRef.current.fish = [];
                for (let i = 0; i < 8; i++) {
                    dataRef.current.fish.push({
                        x: Math.random() * w(),
                        y: Math.random() * h() * 0.7 + h() * 0.15,
                        speed: Math.random() * 0.3 + 0.2,
                        size: Math.random() * 12 + 8,
                        hue: [0, 30, 45, 180, 200, 280][Math.floor(Math.random() * 6)],
                        direction: Math.random() > 0.5 ? 1 : -1,
                        wobble: Math.random() * Math.PI * 2,
                        depth: Math.random(),
                    });
                }
                dataRef.current.fish.sort((a, b) => a.depth - b.depth);
            } else if (scene === "rain") {
                dataRef.current.drops = [];
                dataRef.current.ripples = [];
                for (let i = 0; i < 80; i++) {
                    dataRef.current.drops.push({
                        x: Math.random() * w(),
                        y: Math.random() * h(),
                        speed: Math.random() * 4 + 3,
                        size: Math.random() * 2 + 1,
                        opacity: Math.random() * 0.5 + 0.3,
                    });
                }
            } else if (scene === "lava") {
                dataRef.current.blobs = [];
                for (let i = 0; i < 5; i++) {
                    const size = Math.random() * 25 + 20;
                    dataRef.current.blobs.push({
                        x: Math.random() * w() * 0.6 + w() * 0.2,
                        y: Math.random() * h(),
                        vy: (Math.random() - 0.5) * 0.3,
                        size: size,
                        targetSize: size,
                        hue: Math.random() * 40 + 10,
                        phase: Math.random() * Math.PI * 2,
                    });
                }
            } else if (scene === "fireplace") {
                dataRef.current.embers = [];
            }
        };
        initScene();

        const animate = () => {
            dataRef.current.time += 0.016;
            const t = dataRef.current.time;
            ctx.clearRect(0, 0, w(), h());

            if (scene === "aquarium") {
                // Deep water gradient
                const waterGrad = ctx.createLinearGradient(0, 0, 0, h());
                waterGrad.addColorStop(0, "#0c3547");
                waterGrad.addColorStop(0.3, "#0a2d3d");
                waterGrad.addColorStop(1, "#051820");
                ctx.fillStyle = waterGrad;
                ctx.fillRect(0, 0, w(), h());

                // Light rays from top
                ctx.save();
                for (let i = 0; i < 5; i++) {
                    const rayX = w() * 0.2 + (i / 5) * w() * 0.6;
                    const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 30, h());
                    rayGrad.addColorStop(0, "rgba(100, 200, 255, 0.08)");
                    rayGrad.addColorStop(1, "rgba(100, 200, 255, 0)");
                    ctx.fillStyle = rayGrad;
                    ctx.beginPath();
                    ctx.moveTo(rayX - 10, 0);
                    ctx.lineTo(rayX + 40, h());
                    ctx.lineTo(rayX + 60, h());
                    ctx.lineTo(rayX + 10, 0);
                    ctx.fill();
                }
                ctx.restore();

                // Seaweed
                for (let i = 0; i < 6; i++) {
                    const sx = w() * 0.1 + (i / 6) * w() * 0.8;
                    const sheight = h() * (0.2 + Math.random() * 0.1);
                    ctx.beginPath();
                    ctx.moveTo(sx, h());
                    for (let j = 0; j < 5; j++) {
                        const sy = h() - (j / 5) * sheight;
                        const sway = Math.sin(t * 0.5 + i + j * 0.3) * 8;
                        ctx.quadraticCurveTo(sx + sway, sy + sheight / 10, sx + sway * 0.5, sy);
                    }
                    ctx.strokeStyle = `rgba(20, 80, 60, ${0.5 + i * 0.05})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                // Bubbles
                for (let i = 0; i < 8; i++) {
                    const bx = w() * 0.1 + ((t * 10 + i * 50) % (w() * 0.8));
                    const by = h() - ((t * 15 + i * 30) % (h() * 0.9));
                    const bsize = 2 + Math.sin(t + i) * 1;
                    ctx.beginPath();
                    ctx.arc(bx, by, bsize, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                // Fish
                dataRef.current.fish.forEach((fish) => {
                    fish.x += fish.speed * fish.direction;
                    fish.wobble += 0.08;
                    const wobbleY = Math.sin(fish.wobble) * 2;
                    const depthAlpha = 0.5 + fish.depth * 0.5;
                    const depthScale = 0.7 + fish.depth * 0.3;

                    if (fish.direction > 0 && fish.x > w() + fish.size * 2) {
                        fish.x = -fish.size * 2;
                        fish.y = Math.random() * h() * 0.7 + h() * 0.15;
                    }
                    if (fish.direction < 0 && fish.x < -fish.size * 2) {
                        fish.x = w() + fish.size * 2;
                        fish.y = Math.random() * h() * 0.7 + h() * 0.15;
                    }

                    ctx.save();
                    ctx.translate(fish.x, fish.y + wobbleY);
                    ctx.scale(fish.direction * depthScale, depthScale);
                    ctx.globalAlpha = depthAlpha;

                    const s = fish.size;

                    // Body gradient
                    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
                    bodyGrad.addColorStop(0, `hsla(${fish.hue}, 80%, 65%, 1)`);
                    bodyGrad.addColorStop(0.7, `hsla(${fish.hue}, 70%, 50%, 1)`);
                    bodyGrad.addColorStop(1, `hsla(${fish.hue}, 60%, 35%, 1)`);

                    // Body
                    ctx.beginPath();
                    ctx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2);
                    ctx.fillStyle = bodyGrad;
                    ctx.fill();

                    // Tail
                    const tailWag = Math.sin(fish.wobble * 2) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(-s * 0.8, 0);
                    ctx.quadraticCurveTo(-s * 1.2, -s * 0.4 + tailWag * s, -s * 1.5, -s * 0.3);
                    ctx.quadraticCurveTo(-s * 1.3, 0, -s * 1.5, s * 0.3);
                    ctx.quadraticCurveTo(-s * 1.2, s * 0.4 + tailWag * s, -s * 0.8, 0);
                    ctx.fillStyle = `hsla(${fish.hue}, 70%, 45%, 0.9)`;
                    ctx.fill();

                    // Dorsal fin
                    ctx.beginPath();
                    ctx.moveTo(-s * 0.2, -s * 0.4);
                    ctx.quadraticCurveTo(0, -s * 0.7, s * 0.3, -s * 0.4);
                    ctx.fillStyle = `hsla(${fish.hue}, 60%, 40%, 0.8)`;
                    ctx.fill();

                    // Eye
                    ctx.beginPath();
                    ctx.arc(s * 0.5, -s * 0.1, s * 0.15, 0, Math.PI * 2);
                    ctx.fillStyle = "white";
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(s * 0.55, -s * 0.1, s * 0.08, 0, Math.PI * 2);
                    ctx.fillStyle = "#111";
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(s * 0.57, -s * 0.12, s * 0.03, 0, Math.PI * 2);
                    ctx.fillStyle = "white";
                    ctx.fill();

                    ctx.restore();
                });

            } else if (scene === "fireplace") {
                // Dark room
                ctx.fillStyle = "#0a0806";
                ctx.fillRect(0, 0, w(), h());

                // Ambient glow
                const ambientGlow = ctx.createRadialGradient(w() / 2, h(), 0, w() / 2, h(), h());
                ambientGlow.addColorStop(0, "rgba(255, 120, 50, 0.15)");
                ambientGlow.addColorStop(0.5, "rgba(255, 80, 20, 0.05)");
                ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = ambientGlow;
                ctx.fillRect(0, 0, w(), h());

                // Logs
                const logGrad = ctx.createLinearGradient(0, h() - 20, 0, h());
                logGrad.addColorStop(0, "#2a1a0a");
                logGrad.addColorStop(1, "#1a0a00");
                ctx.fillStyle = logGrad;
                ctx.fillRect(w() * 0.15, h() - 25, w() * 0.7, 25);
                ctx.fillRect(w() * 0.2, h() - 35, w() * 0.6, 15);

                // Fire layers
                const fireColors = [
                    { stops: ["#ff2200", "#ff4400", "#ff6600"], height: 0.5 },
                    { stops: ["#ff4400", "#ff8800", "#ffaa00"], height: 0.4 },
                    { stops: ["#ff8800", "#ffcc00", "#ffee88"], height: 0.25 },
                ];

                fireColors.forEach((layer, layerIdx) => {
                    for (let i = 0; i < 7; i++) {
                        const baseX = w() * 0.2 + (i / 6) * w() * 0.6;
                        const flameHeight = h() * layer.height * (0.7 + Math.sin(t * 3 + i * 1.5 + layerIdx) * 0.3);
                        const flameWidth = 15 + Math.sin(t * 2 + i) * 5;
                        const sway = Math.sin(t * 4 + i * 0.8) * 5;

                        const flameGrad = ctx.createLinearGradient(baseX, h() - 30, baseX, h() - 30 - flameHeight);
                        flameGrad.addColorStop(0, layer.stops[0]);
                        flameGrad.addColorStop(0.5, layer.stops[1]);
                        flameGrad.addColorStop(1, layer.stops[2] + "00");

                        ctx.beginPath();
                        ctx.moveTo(baseX - flameWidth / 2, h() - 30);
                        ctx.bezierCurveTo(
                            baseX - flameWidth / 3 + sway, h() - 30 - flameHeight * 0.3,
                            baseX - flameWidth / 4 + sway * 1.5, h() - 30 - flameHeight * 0.7,
                            baseX + sway * 2, h() - 30 - flameHeight
                        );
                        ctx.bezierCurveTo(
                            baseX + flameWidth / 4 + sway * 1.5, h() - 30 - flameHeight * 0.7,
                            baseX + flameWidth / 3 + sway, h() - 30 - flameHeight * 0.3,
                            baseX + flameWidth / 2, h() - 30
                        );
                        ctx.fillStyle = flameGrad;
                        ctx.fill();
                    }
                });

                // Embers
                if (Math.random() > 0.9) {
                    dataRef.current.embers.push({
                        x: w() * 0.3 + Math.random() * w() * 0.4,
                        y: h() - 50,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: -Math.random() * 1.5 - 0.5,
                        life: 1,
                        size: Math.random() * 2 + 1,
                    });
                }

                dataRef.current.embers = dataRef.current.embers.filter((ember) => {
                    ember.x += ember.vx;
                    ember.y += ember.vy;
                    ember.vy -= 0.01;
                    ember.life -= 0.01;

                    if (ember.life > 0) {
                        ctx.beginPath();
                        ctx.arc(ember.x, ember.y, ember.size * ember.life, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 50}, 50, ${ember.life})`;
                        ctx.fill();
                    }
                    return ember.life > 0;
                });

            } else if (scene === "rain") {
                // Night sky gradient
                const skyGrad = ctx.createLinearGradient(0, 0, 0, h());
                skyGrad.addColorStop(0, "#1a2a3a");
                skyGrad.addColorStop(0.5, "#243442");
                skyGrad.addColorStop(1, "#2a3a4a");
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, w(), h());

                // Window reflection
                ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
                ctx.fillRect(0, 0, w(), h());

                // Rain drops
                dataRef.current.drops.forEach((drop) => {
                    drop.y += drop.speed;
                    drop.x += 0.5; // Slight wind

                    if (drop.y > h()) {
                        // Create ripple
                        if (Math.random() > 0.7) {
                            dataRef.current.ripples.push({
                                x: drop.x,
                                y: h() - 5,
                                radius: 0,
                                opacity: 0.5,
                            });
                        }
                        drop.y = -10;
                        drop.x = Math.random() * w();
                    }

                    // Draw raindrop
                    ctx.beginPath();
                    ctx.moveTo(drop.x, drop.y);
                    ctx.lineTo(drop.x - 0.5, drop.y + drop.size * 8);
                    ctx.strokeStyle = `rgba(180, 200, 220, ${drop.opacity})`;
                    ctx.lineWidth = drop.size;
                    ctx.stroke();
                });

                // Ripples at bottom
                dataRef.current.ripples = dataRef.current.ripples.filter((ripple) => {
                    ripple.radius += 0.5;
                    ripple.opacity -= 0.02;

                    if (ripple.opacity > 0) {
                        ctx.beginPath();
                        ctx.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.3, 0, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(200, 220, 240, ${ripple.opacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    return ripple.opacity > 0;
                });

                // Window condensation effect
                ctx.fillStyle = "rgba(100, 130, 160, 0.03)";
                ctx.fillRect(0, h() * 0.7, w(), h() * 0.3);

            } else if (scene === "breathing") {
                // Calm dark background
                ctx.fillStyle = "#0a0f14";
                ctx.fillRect(0, 0, w(), h());

                dataRef.current.breathPhase += 0.008;
                const phase = (Math.sin(dataRef.current.breathPhase) + 1) / 2;
                const minR = Math.min(w(), h()) * 0.12;
                const maxR = Math.min(w(), h()) * 0.35;
                const radius = minR + (maxR - minR) * phase;

                // Outer rings
                for (let i = 3; i >= 0; i--) {
                    const ringR = radius + i * 15;
                    const ringAlpha = (0.1 - i * 0.02) * phase;
                    ctx.beginPath();
                    ctx.arc(w() / 2, h() / 2, ringR, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(100, 180, 200, ${ringAlpha})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Glow
                const glow = ctx.createRadialGradient(w() / 2, h() / 2, 0, w() / 2, h() / 2, radius * 1.5);
                glow.addColorStop(0, `rgba(80, 180, 200, ${0.2 * phase})`);
                glow.addColorStop(0.5, `rgba(60, 140, 160, ${0.1 * phase})`);
                glow.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, w(), h());

                // Main circle
                const circleGrad = ctx.createRadialGradient(w() / 2, h() / 2, 0, w() / 2, h() / 2, radius);
                circleGrad.addColorStop(0, `rgba(120, 200, 220, ${0.8 + phase * 0.2})`);
                circleGrad.addColorStop(0.7, `rgba(80, 160, 180, ${0.6 + phase * 0.2})`);
                circleGrad.addColorStop(1, `rgba(60, 120, 140, ${0.4 + phase * 0.2})`);

                ctx.beginPath();
                ctx.arc(w() / 2, h() / 2, radius, 0, Math.PI * 2);
                ctx.fillStyle = circleGrad;
                ctx.fill();

                // Text
                ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + phase * 0.4})`;
                ctx.font = "bold 16px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(phase > 0.5 ? "吸う" : "吐く", w() / 2, h() / 2);

            } else if (scene === "lava") {
                // Dark background with gradient
                const bgGrad = ctx.createLinearGradient(0, 0, 0, h());
                bgGrad.addColorStop(0, "#0a0510");
                bgGrad.addColorStop(1, "#150a20");
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, w(), h());

                // Ambient glow at bottom
                const bottomGlow = ctx.createRadialGradient(w() / 2, h() + 50, 0, w() / 2, h(), h() * 0.8);
                bottomGlow.addColorStop(0, "rgba(255, 100, 50, 0.1)");
                bottomGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
                ctx.fillStyle = bottomGlow;
                ctx.fillRect(0, 0, w(), h());

                // Blobs
                dataRef.current.blobs.forEach((blob) => {
                    blob.y += blob.vy;
                    blob.phase += 0.02;
                    blob.x += Math.sin(blob.phase) * 0.3;

                    // Smooth size pulsing
                    blob.size += (blob.targetSize - blob.size) * 0.05;
                    if (Math.random() > 0.99) {
                        blob.targetSize = Math.random() * 25 + 15;
                    }

                    // Bounce
                    if (blob.y < blob.size + 10) {
                        blob.vy = Math.abs(blob.vy) * 0.8 + 0.1;
                        blob.y = blob.size + 10;
                    }
                    if (blob.y > h() - blob.size - 10) {
                        blob.vy = -Math.abs(blob.vy) * 0.8 - 0.1;
                        blob.y = h() - blob.size - 10;
                    }

                    // Multiple layers for depth
                    for (let layer = 2; layer >= 0; layer--) {
                        const layerSize = blob.size * (1 + layer * 0.4);
                        const layerAlpha = layer === 0 ? 0.9 : (0.3 - layer * 0.1);

                        const blobGrad = ctx.createRadialGradient(
                            blob.x, blob.y, 0,
                            blob.x, blob.y, layerSize
                        );
                        blobGrad.addColorStop(0, `hsla(${blob.hue}, 100%, 70%, ${layerAlpha})`);
                        blobGrad.addColorStop(0.5, `hsla(${blob.hue + 10}, 90%, 55%, ${layerAlpha * 0.8})`);
                        blobGrad.addColorStop(1, `hsla(${blob.hue + 20}, 80%, 40%, 0)`);

                        ctx.beginPath();
                        ctx.arc(blob.x, blob.y, layerSize, 0, Math.PI * 2);
                        ctx.fillStyle = blobGrad;
                        ctx.fill();
                    }
                });

                // Glass tube effect
                ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                ctx.lineWidth = 1;
                ctx.strokeRect(w() * 0.15, 5, w() * 0.7, h() - 10);
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationRef.current);
    }, [mounted, scene]);

    const nextScene = () => {
        const idx = SCENES.findIndex((s) => s.id === scene);
        setScene(SCENES[(idx + 1) % SCENES.length].id);
    };

    const prevScene = () => {
        const idx = SCENES.findIndex((s) => s.id === scene);
        setScene(SCENES[(idx - 1 + SCENES.length) % SCENES.length].id);
    };

    const currentScene = SCENES.find((s) => s.id === scene);

    if (!mounted) return null;

    return (
        <div className="h-full flex flex-col bg-[#1a1a1a]">
            <div className="widget-title flex-shrink-0">
                <span className="flex items-center gap-1.5">
                    <span>{currentScene?.emoji}</span>
                    ZEN
                </span>
            </div>
            <div className="flex-1 relative min-h-0 overflow-hidden rounded-b group">
                <canvas ref={canvasRef} className="w-full h-full" />

                {/* Sound toggle - top right */}
                {currentScene?.sound && (
                    <button
                        onClick={() => {
                            const newState = !soundEnabled;
                            setSoundEnabled(newState);
                            localStorage.setItem(SOUND_KEY, String(newState));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                        title={soundEnabled ? "サウンドオフ" : "サウンドオン"}
                    >
                        {soundEnabled ? (
                            <Volume2 size={14} className="text-cyan-400" />
                        ) : (
                            <VolumeX size={14} className="text-white/60" />
                        )}
                    </button>
                )}

                {/* Scene navigation - bottom */}
                <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={prevScene}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
                    >
                        <ChevronLeft size={14} className="text-white/80" />
                    </button>
                    <span className="text-[10px] text-white/70 px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                        {currentScene?.name}
                    </span>
                    <button
                        onClick={nextScene}
                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
                    >
                        <ChevronRight size={14} className="text-white/80" />
                    </button>
                </div>
            </div>
        </div>
    );
}
