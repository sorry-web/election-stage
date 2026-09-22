import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, Sparkles, X } from "lucide-react";
import { useState } from "react";

import crocodile from "@/assets/crocodile.png";
import doveAsset from "@/assets/dove.png.asset.json";
import footballAsset from "@/assets/football.png.asset.json";
import globeAsset from "@/assets/globe.png.asset.json";
import peacockAsset from "@/assets/peacock.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Pre-Elections — Choose Your Voice" },
      {
        name: "description",
        content: "An interactive student pre-election campaign experience for Boy and Girl Vice President.",
      },
      { property: "og:title", content: "Student Pre-Elections — Choose Your Voice" },
      {
        property: "og:description",
        content: "Two choices. One voice. Meet the candidates in an interactive campaign experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ElectionExperience,
});

type Stage = "intro" | "boy" | "girl" | "final" | "done";
type Candidate = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  preferred: boolean;
  message: string;
};

const boys: Candidate[] = [
  {
    id: "fasih",
    name: "Muhammad Fasih Ur Rehman",
    symbol: "Crocodile",
    image: crocodile,
    preferred: true,
    message: "A sharp choice with a big vision — calm under pressure and ready to make every student’s voice count.",
  },
  {
    id: "abubakr",
    name: "Abu Bakr",
    symbol: "Football",
    image: footballAsset.url,
    preferred: false,
    message: "A strong symbol — but school decisions need more than a good kick. Let’s keep the ball on the field.",
  },
  {
    id: "qamar",
    name: "Muhammad Qamar",
    symbol: "Globe",
    image: globeAsset.url,
    preferred: false,
    message: "Thinking globally is great. For this election, though, the Crocodile has its eyes on your school day.",
  },
];

const girls: Candidate[] = [
  {
    id: "azla",
    name: "Azla",
    symbol: "Peacock",
    image: peacockAsset.url,
    preferred: true,
    message: "Confident, thoughtful, and ready to let every idea shine. A choice with vision, voice, and brilliant feathers.",
  },
  {
    id: "minaal",
    name: "Minaal",
    symbol: "Dove",
    image: doveAsset.url,
    preferred: false,
    message: "The Dove brings peace — perhaps too much peace. This campaign is ready to make some positive noise.",
  },
];

function playTone(correct: boolean) {
  const AudioContextClass = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(correct ? 0.18 : 0.12, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (correct ? 0.48 : 0.22));

  const notes = correct ? [523.25, 659.25, 783.99, 1046.5] : [150, 105];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = correct ? (index % 2 === 0 ? "sine" : "triangle") : "sawtooth";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    const start = context.currentTime + index * (correct ? 0.1 : 0.07);
    oscillator.start(start);
    oscillator.stop(start + (correct ? 0.3 : 0.13));
  });
  window.setTimeout(() => void context.close(), 700);
}

function ElectionExperience() {
  const [stage, setStage] = useState<Stage>("intro");
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const openCandidate = (candidate: Candidate) => {
    setSelected(candidate);
    setConfirmed(false);
    if (!candidate.preferred) playTone(false);
  };

  const confirmChoice = () => {
    playTone(true);
    setConfirmed(true);
  };

  const continueJourney = () => {
    setSelected(null);
    setConfirmed(false);
    setStage(stage === "boy" ? "girl" : "final");
  };

  return (
    <main className="campaign-shell">
      <div className="ambient-light" aria-hidden="true" />
      {stage === "intro" && (
        <section className="intro-screen stage-enter" aria-labelledby="intro-title">
          <div className="intro-mark" aria-hidden="true">
            <span>01</span><span className="intro-mark-line" /><span>02</span>
          </div>
          <p className="eyebrow">Student Council • 2026</p>
          <h1 id="intro-title">Student<br />Pre-Elections</h1>
          <p className="intro-copy">Two choices. One voice.</p>
          <button className="primary-action" onClick={() => setStage("boy")}>
            Begin <ArrowRight aria-hidden="true" />
          </button>
        </section>
      )}

      {(stage === "boy" || stage === "girl") && !selected && (
        <CandidateStage
          key={stage}
          label={stage === "boy" ? "Stage one of two" : "Stage two of two"}
          title={stage === "boy" ? "Boy Vice President" : "Girl Vice President"}
          candidates={stage === "boy" ? boys : girls}
          onSelect={openCandidate}
        />
      )}

      {(stage === "boy" || stage === "girl") && selected && (
        <CandidateDetail
          candidate={selected}
          confirmed={confirmed}
          onBack={() => setSelected(null)}
          onConfirm={confirmChoice}
          onContinue={continueJourney}
        />
      )}

      {stage === "final" && <FinalScreen onDone={() => setStage("done")} />}

      {stage === "done" && (
        <section className="done-screen stage-enter" aria-live="polite">
          <div className="done-orbit"><Check aria-hidden="true" /></div>
          <p className="eyebrow">All done</p>
          <h1>Thank you.</h1>
          <p>Your voice matters.</p>
        </section>
      )}
    </main>
  );
}

function CandidateStage({
  label,
  title,
  candidates,
  onSelect,
}: {
  label: string;
  title: string;
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}) {
  return (
    <section className="candidate-stage stage-enter" aria-labelledby="stage-title">
      <header className="stage-header">
        <div>
          <p className="eyebrow">{label}</p>
          <h1 id="stage-title">{title}</h1>
          <p>Choose your candidate.</p>
        </div>
        <div className="stage-count" aria-hidden="true">{candidates.length}</div>
      </header>
      <div className={`candidate-grid ${candidates.length === 2 ? "candidate-grid-two" : ""}`}>
        {candidates.map((candidate, index) => (
          <button
            key={candidate.id}
            className={`candidate-card ${candidate.preferred ? "candidate-card-gold" : ""}`}
            onClick={() => onSelect(candidate)}
            aria-label={`View ${candidate.name}, symbol ${candidate.symbol}`}
          >
            <span className="card-number">0{index + 1}</span>
            <span className="symbol-frame">
              <img src={candidate.image} alt="" width={1024} height={1024} draggable={false} />
            </span>
            <span className="candidate-symbol">{candidate.symbol}</span>
            <span className="candidate-name">{candidate.name}</span>
            <span className="card-arrow"><ArrowRight aria-hidden="true" /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CandidateDetail({
  candidate,
  confirmed,
  onBack,
  onConfirm,
  onContinue,
}: {
  candidate: Candidate;
  confirmed: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onContinue: () => void;
}) {
  if (confirmed) {
    return (
      <section className="success-screen stage-enter" aria-live="assertive">
        <Confetti />
        <div className="success-halo" aria-hidden="true" />
        <div className="success-check"><Check aria-hidden="true" /></div>
        <p className="eyebrow">Excellent choice</p>
        <h1>{candidate.symbol}</h1>
        <p className="success-name">{candidate.name}</p>
        <button className="primary-action light-action" onClick={onContinue}>
          Continue <ArrowRight aria-hidden="true" />
        </button>
      </section>
    );
  }

  return (
    <section className={`detail-screen stage-enter ${candidate.preferred ? "detail-preferred" : "detail-alternate"}`}>
      {!candidate.preferred && (
        <div className="wrong-screen-mark" aria-hidden="true">
          <X />
        </div>
      )}
      <button className="back-action" onClick={onBack} aria-label="Back to candidates">
        <ChevronLeft aria-hidden="true" /> Back
      </button>
      <div className="detail-visual">
        <img src={candidate.image} alt={`${candidate.symbol} symbol`} width={1024} height={1024} draggable={false} />
      </div>
      <div className="detail-copy">
        <div className={`verdict-icon ${candidate.preferred ? "verdict-good" : "verdict-no"}`}>
          {candidate.preferred ? <Sparkles aria-hidden="true" /> : <X aria-hidden="true" />}
        </div>
        <p className="eyebrow">{candidate.preferred ? "Now we’re talking" : "Plot twist"}</p>
        <h1>{candidate.name}</h1>
        <p className="detail-symbol">{candidate.symbol}</p>
        <p className="detail-message">{candidate.message}</p>
        {candidate.preferred ? (
          <button className="primary-action" onClick={onConfirm}>
            Choose {candidate.symbol} <Check aria-hidden="true" />
          </button>
        ) : (
          <button className="secondary-action" onClick={onBack}>
            <ChevronLeft aria-hidden="true" /> Back
          </button>
        )}
      </div>
    </section>
  );
}

function FinalScreen({ onDone }: { onDone: () => void }) {
  return (
    <section className="final-screen stage-enter" aria-labelledby="final-title">
      <header>
        <p className="eyebrow">Your voice, your future</p>
        <h1 id="final-title">Your choices<br />have been made.</h1>
      </header>
      <div className="final-picks">
        <div className="final-pick">
          <img src={crocodile} alt="Crocodile" width={1024} height={1024} />
          <div><span>Crocodile</span><strong>Muhammad Fasih Ur Rehman</strong></div>
          <Check aria-hidden="true" />
        </div>
        <div className="final-pick">
          <img src={peacockAsset.url} alt="Peacock" width={1024} height={1024} />
          <div><span>Peacock</span><strong>Azla</strong></div>
          <Check aria-hidden="true" />
        </div>
      </div>
      <div className="final-footer">
        <p>Two bold choices. One brighter school.</p>
        <button className="primary-action" onClick={onDone}>Done <Check aria-hidden="true" /></button>
      </div>
    </section>
  );
}

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, index) => <i key={index} />)}
    </div>
  );
}