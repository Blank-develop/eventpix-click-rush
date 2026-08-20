"use client";

import {
  Aperture,
  Atom,
  Camera,
  CircleDot,
  Disc3,
  Focus,
  Hexagon,
  Image,
  Orbit,
  Play,
  Radar,
  RefreshCw,
  Scan,
  ScanLine,
  Sparkles,
  Timer,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type GameStatus = "ready" | "playing" | "finished";
type LogoTile = {
  id: string;
  icon?: LucideIcon;
  target?: boolean;
  face?: string;
  tone?: string;
  style?: string;
  rotation?: number;
};

const GAME_SECONDS = 30;
const GRID_SIZE = 48;
const teamFaces = ["/team-1.png", "/team-2.png", "/team-3.png"];
const confettiColors = ["#ed1b3a", "#ffbf3f", "#7c6da8", "#2bb7a9", "#ef756f", "#ffffff"];
const confettiPieces = Array.from({ length: 80 }, (_, index) => ({
  left: `${(index * 37) % 101}%`,
  color: confettiColors[index % confettiColors.length],
  delay: `${(index % 16) * 0.035}s`,
  duration: `${2.1 + (index % 9) * 0.12}s`,
  drift: `${((index * 29) % 180) - 90}px`,
  spin: `${540 + (index % 5) * 180}deg`,
}));

const logoMarks: Array<{ icon: LucideIcon; tone: string; style: string }> = [
  { icon: Aperture, tone: "red", style: "solid" },
  { icon: Focus, tone: "ink", style: "ring" },
  { icon: Camera, tone: "violet", style: "soft" },
  { icon: Scan, tone: "coral", style: "square" },
  { icon: Disc3, tone: "ink", style: "solid" },
  { icon: CircleDot, tone: "rose", style: "ring" },
  { icon: Aperture, tone: "violet", style: "soft" },
  { icon: Radar, tone: "slate", style: "ring" },
  { icon: Hexagon, tone: "coral", style: "solid" },
  { icon: Orbit, tone: "ink", style: "soft" },
  { icon: Image, tone: "rose", style: "square" },
  { icon: Atom, tone: "violet", style: "ring" },
  { icon: Aperture, tone: "coral", style: "ring" },
  { icon: ScanLine, tone: "slate", style: "soft" },
  { icon: Sparkles, tone: "red", style: "solid" },
  { icon: Focus, tone: "rose", style: "square" },
];

function makeGrid(round: number, random = true): LogoTile[] {
  const targetIndex = random ? Math.floor(Math.random() * GRID_SIZE) : 18;
  const facePositions = random ? new Set<number>() : new Set([5, 28, 41]);

  while (facePositions.size < teamFaces.length) {
    const position = Math.floor(Math.random() * GRID_SIZE);
    if (position !== targetIndex) facePositions.add(position);
  }
  const faceIndexes = [...facePositions];

  return Array.from({ length: GRID_SIZE }, (_, index) => {
    if (index === targetIndex) {
      return { id: `${round}-target`, target: true };
    }

    const faceIndex = faceIndexes.indexOf(index);
    if (faceIndex !== -1) {
      return { id: `${round}-face-${faceIndex}`, face: teamFaces[faceIndex] };
    }

    const markIndex = random
      ? Math.floor(Math.random() * logoMarks.length)
      : (index * 7 + 3) % logoMarks.length;
    const mark = logoMarks[markIndex];

    return {
      ...mark,
      id: `${round}-logo-${index}`,
      rotation: random ? Math.floor(Math.random() * 8) * 45 : (index % 4) * 45,
    };
  });
}

const previewGrid = makeGrid(0, false);

export default function Home() {
  const [status, setStatus] = useState<GameStatus>("ready");
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<LogoTile[]>(previewGrid);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [missedId, setMissedId] = useState<string | null>(null);
  const [funId, setFunId] = useState<string | null>(null);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickLock = useRef(false);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          if (changeTimer.current) window.clearTimeout(changeTimer.current);
          clickLock.current = true;
          setStatus("finished");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(
    () => () => {
      if (changeTimer.current) window.clearTimeout(changeTimer.current);
    },
    [],
  );

  function startGame() {
    if (changeTimer.current) window.clearTimeout(changeTimer.current);
    const nextRound = round + 1;
    clickLock.current = false;
    setRound(nextRound);
    setTiles(makeGrid(nextRound));
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setPoppedId(null);
    setMissedId(null);
    setFunId(null);
    setStatus("playing");
  }

  function handleClick(tile: LogoTile) {
    if (status !== "playing" || clickLock.current) return;

    if (!tile.target) {
      if (tile.face) {
        setFunId(tile.id);
        window.setTimeout(() => setFunId(null), 420);
        return;
      }
      setMissedId(tile.id);
      window.setTimeout(() => setMissedId(null), 180);
      return;
    }

    clickLock.current = true;
    setScore((current) => current + 1);
    setPoppedId(tile.id);
    changeTimer.current = window.setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      setTiles(makeGrid(nextRound));
      setPoppedId(null);
      clickLock.current = false;
    }, 115);
  }

  return (
    <main className={`game ${status}`}>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${(timeLeft / GAME_SECONDS) * 100}%` }} />
      </div>

      <div className="hud" aria-live="polite">
        <span><Timer size={19} aria-hidden="true" /><b>{timeLeft}</b></span>
        <span className="mini-target" aria-hidden="true"><img src="/eventpix-logo.png" alt="" /></span>
        <span><Trophy size={19} aria-hidden="true" /><b>{score}</b></span>
      </div>

      <section className="logo-grid" aria-label="Find the EventPix logo">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              className={`logo-tile ${tile.target ? "target" : ""} ${tile.face ? "face" : ""} ${poppedId === tile.id ? "popped" : ""} ${missedId === tile.id ? "missed" : ""} ${funId === tile.id ? "fun" : ""}`}
              key={tile.id}
              type="button"
              onClick={() => handleClick(tile)}
              disabled={status !== "playing"}
              aria-label={tile.target ? "EventPix logo" : tile.face ? "Team member" : "Other logo"}
            >
              {tile.target ? (
                <span className="eventpix-mark"><img src="/eventpix-logo.png" alt="EventPix" /></span>
              ) : tile.face ? (
                <span className="team-face"><img src={tile.face} alt="Team member" /></span>
              ) : Icon ? (
                <span className={`logo-mark ${tile.tone} ${tile.style}`}>
                  <Icon
                    size={38}
                    strokeWidth={tile.style === "solid" ? 2.4 : 1.9}
                    style={{ transform: `rotate(${tile.rotation}deg)` }}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </button>
          );
        })}
      </section>

      {status === "finished" && (
        <div className="confetti" aria-hidden="true">
          {confettiPieces.map((piece, index) => (
            <span
              className="confetti-piece"
              key={index}
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                "--drift": piece.drift,
                "--spin": piece.spin,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      {status !== "playing" && (
        <div className="overlay">
          {status === "ready" ? (
            <button className="action-button" type="button" onClick={startGame} aria-label="Start game">
              <Play size={31} fill="currentColor" />
            </button>
          ) : (
            <div className="final-score">
              <Trophy size={25} aria-hidden="true" />
              <strong>{score}</strong>
              <button className="restart-button" type="button" onClick={startGame} aria-label="Play again">
                <RefreshCw size={22} />
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
