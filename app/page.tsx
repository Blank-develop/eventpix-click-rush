"use client";

import {
  Aperture,
  Bot,
  Camera,
  Cpu,
  GalleryHorizontalEnd,
  Image,
  Images,
  Play,
  RefreshCw,
  ScanFace,
  Sparkles,
  Timer,
  Trophy,
  WandSparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GameStatus = "ready" | "playing" | "finished";
type GameTile = {
  id: string;
  label: string;
  icon?: LucideIcon;
  target?: boolean;
};

const GAME_SECONDS = 30;

const decoys: Omit<GameTile, "id">[] = [
  { label: "Camera", icon: Camera },
  { label: "AI bot", icon: Bot },
  { label: "Gallery", icon: Images },
  { label: "Technology", icon: Cpu },
  { label: "Magic", icon: WandSparkles },
  { label: "Portrait AI", icon: ScanFace },
  { label: "Photo", icon: Image },
  { label: "Sparkles", icon: Sparkles },
  { label: "Aperture", icon: Aperture },
  { label: "Instant", icon: Zap },
  { label: "Photo gallery", icon: GalleryHorizontalEnd },
];

const previewTiles: GameTile[] = [
  { id: "preview-camera", ...decoys[0] },
  { id: "preview-ai", ...decoys[1] },
  { id: "preview-target", label: "EventPix", target: true },
  { id: "preview-gallery", ...decoys[2] },
  { id: "preview-tech", ...decoys[3] },
  { id: "preview-magic", ...decoys[4] },
];

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function makeRound(roundNumber: number): GameTile[] {
  const choices = shuffle(decoys)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      id: `round-${roundNumber}-decoy-${index}`,
    }));

  const target: GameTile = {
    id: `round-${roundNumber}-target`,
    label: "EventPix",
    target: true,
  };

  return shuffle([...choices, target]);
}

export default function Home() {
  const [status, setStatus] = useState<GameStatus>("ready");
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<GameTile[]>(previewTiles);
  const [poppedId, setPoppedId] = useState<string | null>(null);
  const [missedId, setMissedId] = useState<string | null>(null);
  const changeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
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
    setRound(nextRound);
    setTiles(makeRound(nextRound));
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setPoppedId(null);
    setMissedId(null);
    setStatus("playing");
  }

  function handleTileClick(tile: GameTile) {
    if (status !== "playing") return;

    if (!tile.target) {
      setMissedId(tile.id);
      window.setTimeout(() => setMissedId(null), 240);
      return;
    }

    setScore((current) => current + 1);
    setPoppedId(tile.id);
    changeTimer.current = window.setTimeout(() => {
      const nextRound = round + 1;
      setRound(nextRound);
      setTiles(makeRound(nextRound));
      setPoppedId(null);
    }, 130);
  }

  return (
    <main>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#game" aria-label="EventPix Click Rush home">
          <span className="brand-mark">
            <img src="/eventpix-logo.png" alt="" />
          </span>
          <span className="brand-name">Event<span>Pix</span></span>
        </a>
        <div className="round-pill">30 SECOND CHALLENGE</div>
      </header>

      <section className="hero" id="game">
        <div className="eyebrow"><Zap size={15} fill="currentColor" /> SPEED + FOCUS</div>
        <h1>Find it. Click it.<br /><em>Beat the clock.</em></h1>
        <p className="intro">
          Spot the EventPix logo hiding among the icons. Every hit brings a fresh row—how many can you catch in 30 seconds?
        </p>

        <div className={`game-shell ${status}`}>
          <div className="scoreboard" aria-live="polite">
            <div className="stat-block">
              <span className="stat-icon coral"><Timer size={20} /></span>
              <span className="stat-copy">
                <small>TIME LEFT</small>
                <strong>{timeLeft}<i>s</i></strong>
              </span>
            </div>

            <div className="game-instruction">
              {status === "playing" ? (
                <><span className="pulse-dot" /> FIND THE EVENTPIX LOGO</>
              ) : status === "finished" ? (
                "TIME’S UP!"
              ) : (
                "YOUR TARGET"
              )}
            </div>

            <div className="stat-block score-block">
              <span className="stat-icon purple"><Trophy size={20} /></span>
              <span className="stat-copy">
                <small>LOGOS FOUND</small>
                <strong>{score}</strong>
              </span>
            </div>
          </div>

          <div className="game-board">
            <div className="tiles" aria-label="Icon choices">
              {tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    className={`tile ${tile.target ? "target" : ""} ${poppedId === tile.id ? "popped" : ""} ${missedId === tile.id ? "missed" : ""}`}
                    key={tile.id}
                    type="button"
                    onClick={() => handleTileClick(tile)}
                    aria-label={tile.target ? "EventPix logo" : tile.label}
                    disabled={status !== "playing"}
                  >
                    {tile.target ? (
                      <span className="target-logo"><img src="/eventpix-logo.png" alt="EventPix" /></span>
                    ) : Icon ? (
                      <Icon size={40} strokeWidth={1.8} aria-hidden="true" />
                    ) : null}
                    <span>{tile.label}</span>
                  </button>
                );
              })}
            </div>

            {status !== "playing" && (
              <div className="game-overlay">
                {status === "ready" ? (
                  <>
                    <span className="overlay-kicker">READY?</span>
                    <h2>Click only the EventPix logo</h2>
                    <p>The row refreshes after every correct click.</p>
                    <button className="primary-button" type="button" onClick={startGame}>
                      <Play size={19} fill="currentColor" /> Start the rush
                    </button>
                  </>
                ) : (
                  <>
                    <span className="result-medal"><Trophy size={28} /></span>
                    <span className="overlay-kicker">FINAL SCORE</span>
                    <h2>You found <b>{score}</b> {score === 1 ? "logo" : "logos"}!</h2>
                    <p>{score >= 20 ? "Lightning reflexes. That was seriously fast." : score >= 10 ? "Sharp eyes! Think you can beat it?" : "Good start—your next run can be even faster."}</p>
                    <button className="primary-button" type="button" onClick={startGame}>
                      <RefreshCw size={18} /> Play again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${(timeLeft / GAME_SECONDS) * 100}%` }} />
          </div>
        </div>

        <div className="tip"><span>PRO TIP</span> Look for the red camera-shutter mark.</div>
      </section>
    </main>
  );
}
