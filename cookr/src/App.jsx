import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from './supabase';
import AuthModal from './AuthModal';
import { useFavoritesSync, useRecentlyViewedSync, usePreferencesSync, useCustomRecipesSync } from './useSupabase';

const MODES = {
  healthy: {
    id: "healthy", label: "Healthy", emoji: "🥗", tagline: "Nourish your body",
    accent: "#7cb99a", bg: "#0f1a14", cardBg: "#152019", pill: "#1e3328",
    rules: "Focus on nutrition, low calories, whole foods, lean proteins, vegetables. Avoid heavy cream, excess oil, refined sugar.",
    recipes: [
      { id: 1, name: "Avocado & Egg Bowl", time: "15 min", diff: "Easy", tags: ["avocado", "egg", "bowl"], photo: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", desc: "Creamy avocado with a soft-boiled egg, cherry tomatoes and microgreens on quinoa." },
      { id: 2, name: "Grilled Salmon Salad", time: "20 min", diff: "Medium", tags: ["salmon", "salad", "grilled"], photo: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80", desc: "Pan-seared salmon over arugula with lemon vinaigrette and capers." },
      { id: 3, name: "Oats & Berry Parfait", time: "10 min", diff: "Easy", tags: ["oats", "berries", "healthy"], photo: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80", desc: "Layered overnight oats with mixed berries and a drizzle of honey." },
      { id: 4, name: "Paneer Tikka Salad", time: "25 min", diff: "Easy", tags: ["paneer", "indian", "salad"], photo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80", desc: "Marinated grilled paneer cubes over a fresh kachumber salad." },
      { id: 5, name: "Lentil Soup", time: "30 min", diff: "Easy", tags: ["lentil", "soup", "vegan"], photo: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80", desc: "Spiced red lentil soup with cumin, turmeric and a squeeze of lemon." },
      { id: 6, name: "Zucchini Noodles", time: "15 min", diff: "Easy", tags: ["zucchini", "pasta", "low-carb"], photo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", desc: "Spiralized zucchini with basil pesto, cherry tomatoes and pine nuts." },
    ]
  },
  tasty: {
    id: "tasty", label: "Tasty", emoji: "😋", tagline: "Pure indulgence",
    accent: "#e07b4a", bg: "#1a0f0a", cardBg: "#211309", pill: "#331a0d",
    rules: "Focus on bold flavors, comfort food, indulgence. Rich sauces, cheese, spices are welcome. Make it delicious above all else.",
    recipes: [
      { id: 7, name: "Butter Chicken", time: "45 min", diff: "Medium", tags: ["chicken", "indian", "curry"], photo: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80", desc: "Slow-simmered chicken in a rich, velvety tomato-butter gravy. The ultimate comfort food." },
      { id: 8, name: "Smash Burgers", time: "20 min", diff: "Easy", tags: ["burger", "beef", "fast"], photo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80", desc: "Crispy-edged smashed patties with American cheese, special sauce on a brioche bun." },
      { id: 9, name: "Pasta Carbonara", time: "25 min", diff: "Medium", tags: ["pasta", "italian", "egg"], photo: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80", desc: "Silky egg and pecorino sauce coating rigatoni with crispy guanciale." },
      { id: 10, name: "Birria Tacos", time: "3 hrs", diff: "Hard", tags: ["tacos", "mexican", "beef"], photo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", desc: "Slow-braised beef in dried chiles, served in consommé-dipped, cheese-fried tortillas." },
      { id: 11, name: "Chocolate Lava Cake", time: "25 min", diff: "Medium", tags: ["dessert", "chocolate", "bake"], photo: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80", desc: "Warm chocolate cake with a molten center. Serve with vanilla ice cream." },
      { id: 12, name: "Cheesy Garlic Bread", time: "15 min", diff: "Easy", tags: ["bread", "cheese", "garlic"], photo: "https://images.unsplash.com/photo-1619531040576-f9416740661e?w=800&q=80", desc: "Toasted sourdough loaded with garlic butter, mozzarella and parmesan." },
    ]
  },
  quick: {
    id: "quick", label: "Quick & Easy", emoji: "⚡", tagline: "Done in minutes",
    accent: "#c4a84f", bg: "#16130a", cardBg: "#1e1a0e", pill: "#2e2710",
    rules: "Focus on speed. Max 20 minutes, minimal ingredients, simple steps, one pan where possible. Beginner friendly.",
    recipes: [
      { id: 13, name: "Scrambled Egg Toast", time: "8 min", diff: "Easy", tags: ["egg", "toast", "breakfast"], photo: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80", desc: "Buttery soft scrambled eggs on thick sourdough toast with chives." },
      { id: 14, name: "Chicken Wrap", time: "12 min", diff: "Easy", tags: ["chicken", "wrap", "lunch"], photo: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80", desc: "Sliced grilled chicken with lettuce, tomato and mayo in a flour tortilla." },
      { id: 15, name: "Fried Rice", time: "15 min", diff: "Easy", tags: ["rice", "egg", "quick"], photo: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80", desc: "Day-old rice stir-fried with egg, soy sauce, green onion and sesame oil." },
      { id: 16, name: "Maggi Masala Noodles", time: "5 min", diff: "Easy", tags: ["noodles", "quick", "snack"], photo: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80", desc: "The classic elevated — with onions, green chili and a fried egg on top." },
      { id: 17, name: "Banana Peanut Smoothie", time: "5 min", diff: "Easy", tags: ["smoothie", "banana", "breakfast"], photo: "https://images.unsplash.com/photo-1553530666-ba11a90a3abe?w=800&q=80", desc: "Frozen banana blended with peanut butter, milk and a pinch of cinnamon." },
      { id: 18, name: "Cheese Omelette", time: "10 min", diff: "Easy", tags: ["egg", "cheese", "breakfast"], photo: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80", desc: "Fluffy three-egg omelette stuffed with cheddar and fresh herbs." },
    ]
  }
};

const SIDEBAR_W = 248;

// ── Groq API call helper ──
async function askGroq(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.7,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();

  return data.choices[0].message.content;
}

// ── Shimmer Card ──
function ShimmerCard() {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", animation: "shimmerPulse 1.5s ease-in-out infinite" }}>
      <div style={{ height: 200, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ height: 20, background: "rgba(255,255,255,0.06)", borderRadius: 6, marginBottom: 10, width: "70%" }} />
        <div style={{ height: 13, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 6, width: "90%" }} />
        <div style={{ height: 13, background: "rgba(255,255,255,0.04)", borderRadius: 4, width: "60%" }} />
      </div>
    </div>
  );
}

// ── Per-Step Chat Panel ──
function StepChat({ step, stepIndex, recipeName, mode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick question suggestions per step
  const suggestions = [
    "What heat level on a gas stove?",
    "How do I know it's done?",
    "Can I substitute anything?",
    "What if I don't have the right pan?"
  ];

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");

    const userMsg = { role: "user", content: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const systemPrompt = `You are a friendly, expert cooking assistant helping someone cook right now in their kitchen.

They are making: "${recipeName}"
Current step ${stepIndex + 1}: "${step.title}"
Step instruction: "${step.instruction}"
${step.tip ? `Pro tip for this step: "${step.tip}"` : ""}

Answer their question about THIS specific step only. Be practical, concise, and conversational — like a chef standing next to them. Use simple language. If they ask about temperatures, always give stove dial equivalents (low/medium/high). Keep answers under 4 sentences unless a detailed explanation is truly needed.`;

      const history = [
        { role: "system", content: systemPrompt },
        ...messages,
        userMsg
      ];

      const reply = await askGroq(history);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, couldn't get a response. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          marginTop: 14, display: "flex", alignItems: "center", gap: 7,
          background: open ? `${mode.accent}18` : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? mode.accent + "44" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 20, padding: "6px 14px", cursor: "pointer",
          fontSize: 12, color: open ? mode.accent : "rgba(240,235,227,0.5)",
          fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
          fontWeight: 500
        }}
      >
        <span style={{ fontSize: 14 }}>💬</span>
        {open ? "Close chat" : messages.length > 0 ? `Chat (${messages.filter(m => m.role === "user").length})` : "Ask about this step"}
        {messages.length > 0 && !open && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: mode.accent, display: "inline-block" }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          marginTop: 12, borderRadius: 14,
          border: `1px solid ${mode.accent}33`,
          background: "rgba(0,0,0,0.25)",
          overflow: "hidden",
          animation: "chatSlideIn 0.2s ease"
        }}>
          {/* Chat header */}
          <div style={{
            padding: "10px 14px",
            borderBottom: `1px solid ${mode.accent}22`,
            background: `${mode.accent}0a`,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: mode.accent, animation: "shimmerPulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: mode.accent, fontWeight: 500 }}>
              Chef AI · Step {stepIndex + 1}: {step.title}
            </span>
          </div>

          {/* Messages */}
          <div style={{ maxHeight: 280, overflowY: "auto", padding: "12px 14px" }} className="sidebar-scroll">

            {/* Empty state with suggestions */}
            {messages.length === 0 && (
              <div>
                <div style={{ fontSize: 12, color: "rgba(240,235,227,0.3)", marginBottom: 10 }}>
                  Ask anything about this step:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)} style={{
                      textAlign: "left", padding: "8px 12px", borderRadius: 10,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(240,235,227,0.6)", fontSize: 12, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s ease"
                    }}
                    onMouseEnter={e => { e.target.style.background = `${mode.accent}15`; e.target.style.borderColor = `${mode.accent}44`; e.target.style.color = mode.accent; }}
                    onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "rgba(240,235,227,0.6)"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
                animation: "fadeUp 0.2s ease"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${mode.accent}, ${mode.accent}88)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, marginRight: 8, marginTop: 2
                  }}>👨‍🍳</div>
                )}
                <div style={{
                  maxWidth: "78%", padding: "9px 13px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.role === "user" ? `${mode.accent}22` : "rgba(255,255,255,0.06)",
                  border: `1px solid ${msg.role === "user" ? mode.accent + "44" : "rgba(255,255,255,0.08)"}`,
                  fontSize: 13, lineHeight: 1.6,
                  color: msg.role === "user" ? mode.accent : "rgba(240,235,227,0.82)"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${mode.accent}, ${mode.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👨‍🍳</div>
                <div style={{ padding: "9px 14px", borderRadius: "14px 14px 14px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: mode.accent, opacity: 0.7, animation: `typingDot 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div style={{
            padding: "10px 12px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 8, alignItems: "center"
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about this step..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "9px 14px",
                fontSize: 13, color: "#f0ebe3",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => e.target.style.borderColor = mode.accent + "66"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "none",
                background: input.trim() && !loading ? `linear-gradient(135deg, ${mode.accent}, ${mode.accent}cc)` : "rgba(255,255,255,0.07)",
                color: input.trim() && !loading ? "#111" : "rgba(240,235,227,0.3)",
                cursor: input.trim() && !loading ? "pointer" : "default",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease", flexShrink: 0
              }}
            >
              {loading ? <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span> : "↑"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Voice Personas ──
const PERSONAS = {
  gordon: {
    id: 'gordon', name: 'Gordon Ramsay', emoji: '🔥', color: '#e07b4a',
    desc: 'Intense & demanding',
    // ElevenLabs: "Arnold" — deep, assertive male voice
    voiceId: 'VR6AewLTigWG4xSOukaG', stability: 0.35, similarity: 0.85,
    // Browser TTS fallback
    rate: 1.1, pitch: 0.78,
    readStep: (n, step) => `Step ${n}: ${step.title}. LISTEN carefully. ${step.instruction}`,
    systemPrompt: (step, recipe) => `You are Gordon Ramsay, world-famous chef. User is cooking "${recipe}", on step: "${step.title}". Instruction: "${step.instruction}". Answer in Gordon's style — intense, passionate, demanding but helpful. Use "LISTEN", "Bloody hell", "This is crucial". Max 2 sentences. No emojis.`
  },
  grandma: {
    id: 'grandma', name: 'Grandma', emoji: '👵', color: '#c4a84f',
    desc: 'Warm & reassuring',
    // ElevenLabs: "Dorothy" — older warm female voice
    voiceId: 'ThT5KcBeYPX3keUQqHPh', stability: 0.75, similarity: 0.8,
    rate: 0.82, pitch: 1.3,
    readStep: (n, step) => `Step ${n}, beta: ${step.title}. ${step.instruction}`,
    systemPrompt: (step, recipe) => `You are a warm loving grandma who cooked for 50 years. User is making "${recipe}", step: "${step.title}". Instruction: "${step.instruction}". Be warm, call them "beta" or "dear". Use "Don't worry", "Take your time". Max 2 sentences.`
  },
  blogger: {
    id: 'blogger', name: 'Food Blogger', emoji: '📸', color: '#7cb99a',
    desc: 'Excited & enthusiastic',
    // ElevenLabs: "Bella" — young energetic female voice
    voiceId: 'EXAVITQu4vr4xnSDxMaL', stability: 0.25, similarity: 0.9,
    rate: 1.25, pitch: 1.4,
    readStep: (n, step) => `Oh my god, step ${n}! ${step.title}! ${step.instruction}`,
    systemPrompt: (step, recipe) => `You are an over-the-top excited food blogger. User is making "${recipe}", step: "${step.title}". Instruction: "${step.instruction}". Be EXTREMELY enthusiastic. Use "OH MY GOD", "AMAZING", "LITERALLY the best part". Max 2 sentences.`
  },
  zen: {
    id: 'zen', name: 'Zen Chef', emoji: '🧘', color: '#9b8fc4',
    desc: 'Calm & mindful',
    // ElevenLabs: "Adam" — calm, deep, smooth male voice
    voiceId: 'pNInz6obpgDQGcFmaJgB', stability: 0.9, similarity: 0.75,
    rate: 0.75, pitch: 0.9,
    readStep: (n, step) => `Breathe... Step ${n}. ${step.title}. ${step.instruction}`,
    systemPrompt: (step, recipe) => `You are a calm zen mindful cooking guide. User is making "${recipe}", step: "${step.title}". Instruction: "${step.instruction}". Be slow and peaceful. Use "Breathe", "Feel the moment", "Let the food guide you". Max 2 sentences.`
  },
  custom: {
    id: 'custom', name: 'Your Voice', emoji: '🎤', color: '#b07ab5',
    desc: 'Browser TTS + sample playback',
    voiceId: null, stability: 0.5, similarity: 0.8,
    rate: 1.0, pitch: 1.0,
    readStep: (n, step) => `Step ${n}: ${step.title}. ${step.instruction}`,
    systemPrompt: (step, recipe) => `You are a helpful cooking assistant. User is making "${recipe}", step: "${step.title}". Instruction: "${step.instruction}". Answer helpfully and clearly. Max 2 sentences.`
  }
};

const COMMANDS = ['next', 'next step', 'continue', 'go', 'previous', 'go back', 'back', 'repeat', 'again', 'ingredients', 'how long', 'time', 'stop', 'pause'];

function detectCommand(text) {
  const t = text.toLowerCase().trim();
  if (['next', 'next step', 'continue', 'go'].some(c => t.includes(c))) return 'next';
  if (['previous', 'go back', 'back', 'prev'].some(c => t.includes(c))) return 'prev';
  if (['repeat', 'again', 'say again', 'what'].some(c => t === c)) return 'repeat';
  if (t.includes('ingredient')) return 'ingredients';
  if (['how long', 'time', 'how much time'].some(c => t.includes(c))) return 'time';
  if (['stop', 'pause', 'quiet', 'enough'].some(c => t.includes(c))) return 'stop';
  return 'question';
}

// ── Voice Assistant ──
function VoiceAssistant({ recipe, currentStep, setCurrentStep, mode, globalPersona, setGlobalPersona }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedPersona, setPersona] = useState(globalPersona || 'gordon');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isThinking, setIsThinking]   = useState(false);
  const [interimText, setInterimText] = useState('');
  const [conversation, setConversation] = useState([]);
  const [customVoiceId, setCustomVoiceId]     = useState(null);
  const [customVoiceName, setCustomVoiceName] = useState('');
  const [voiceLibrary, setVoiceLibrary]       = useState([]);
  const [voiceSearch, setVoiceSearch]         = useState('');
  const [voiceLoading, setVoiceLoading]       = useState(false);
  const [previewAudio, setPreviewAudio]       = useState(null);
  const [started, setStarted]   = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  const recognitionRef = useRef(null);
  const audioRef       = useRef(null);
  const convEndRef     = useRef(null);

  // Single busy ref — true when speaking OR thinking, blocks mic restart
  const busyRef        = useRef(false);
  const startedRef     = useRef(false);
  const micMutedRef    = useRef(false);
  const personaRef     = useRef(PERSONAS[globalPersona || 'gordon']);
  const currentStepRef = useRef(currentStep);

  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { micMutedRef.current = micMuted; }, [micMuted]);
  useEffect(() => { startedRef.current = started; }, [started]);
  useEffect(() => { personaRef.current = PERSONAS[selectedPersona]; setGlobalPersona?.(selectedPersona); }, [selectedPersona]);
  useEffect(() => { if (convEndRef.current) convEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);
  useEffect(() => { return () => { killMic(); window.speechSynthesis.cancel(); }; }, []);

  const addMsg = (role, text) =>
    setConversation(prev => [...prev, { role, text, id: Date.now() + Math.random() }]);

  // ── Kill mic immediately ──
  const killMic = () => {
    const r = recognitionRef.current;
    recognitionRef.current = null;
    try { r?.abort(); } catch(e) {}
    setIsListening(false);
    setInterimText('');
  };

  // ── Speak text, then call onDone when finished ──
  const speak = (text, onDone) => {
    window.speechSynthesis.cancel();
    busyRef.current = true;
    setIsSpeaking(true);
    setIsThinking(false);

    const p = personaRef.current;

    const finished = (fromError) => {
      busyRef.current = false;
      setIsSpeaking(false);
      onDone?.();
    };

    // Browser TTS
    const browserSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const prefs = {
        gordon:  ['Google UK English Male', 'Arthur', 'Daniel', 'George'],
        grandma: ['Google UK English Female', 'Fiona', 'Moira', 'Martha'],
        blogger: ['Samantha', 'Google US English', 'Karen', 'Victoria'],
        zen:     ['Alex', 'Google UK English Male', 'Daniel', 'Thomas'],
        custom:  ['Samantha', 'Google US English']
      };
      let picked = null;
      for (const name of (prefs[p.id] || [])) {
        picked = voices.find(v => v.name.includes(name));
        if (picked) break;
      }
      if (!picked) picked = voices.find(v => v.lang?.startsWith('en'));

      const utt = new SpeechSynthesisUtterance(text);
      utt.rate  = p.rate  || 1;
      utt.pitch = p.pitch || 1;
      if (picked) utt.voice = picked;

      let done = false;
      const safeFinish = () => { if (done) return; done = true; clearTimeout(safety); finished(); };
      // Safety fallback in case onend never fires (Chrome bug)
      const safety = setTimeout(safeFinish, Math.max(4000, text.split(' ').length * 400));
      utt.onend   = safeFinish;
      utt.onerror = (e) => { if (e.error === 'interrupted' || e.error === 'canceled') return; safeFinish(); };
      window.speechSynthesis.speak(utt);
    };

    const elevenKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    // For custom persona, use the voice selected from the library
    const voiceId = p.id === 'custom' ? customVoiceId : p.voiceId;

    if (elevenKey && voiceId) {
      const ctrl = new AbortController();
      const tout = setTimeout(() => ctrl.abort(), 8000);
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'xi-api-key': elevenKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: p.stability, similarity_boost: p.similarity, style: 0, use_speaker_boost: true } })
      })
      .then(r => { clearTimeout(tout); if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { URL.revokeObjectURL(url); finished(); };
        audio.onerror = () => { URL.revokeObjectURL(url); browserSpeak(); };
        audio.play().catch(browserSpeak);
      })
      .catch(() => { clearTimeout(tout); browserSpeak(); });
    } else {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) browserSpeak();
      else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; browserSpeak(); }; }
    }
  };

  // ── Start one mic session, call onResult(text) when user speaks ──
  const listenOnce = (onResult) => {
    if (busyRef.current || micMutedRef.current || !startedRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    killMic();

    const r = new SR();
    r.continuous     = false;
    r.interimResults = true;
    r.lang           = 'en-US';
    r.maxAlternatives = 1;

    r.onstart  = () => setIsListening(true);

    let transcript = '';
    let handled = false;

    r.onresult = (e) => {
      // Collect best transcript so far (interim or final)
      let best = '';
      for (let i = 0; i < e.results.length; i++) {
        best += e.results[i][0].transcript;
        // If we get a definitive final, process immediately
        if (e.results[i].isFinal && best.trim() && !handled) {
          handled = true;
          transcript = best.trim();
          setInterimText('');
          recognitionRef.current = null;
          try { r.abort(); } catch(e) {}
          onResult(transcript);
          return;
        }
      }
      // Show interim
      transcript = best;
      setInterimText(best);
    };

    r.onerror = (ev) => {
      setIsListening(false);
      setInterimText('');
      if (ev.error === 'aborted') return;
      if (!busyRef.current && startedRef.current && !micMutedRef.current)
        setTimeout(() => listenOnce(onResult), 500);
    };

    r.onend = () => {
      setIsListening(false);
      setInterimText('');
      if (handled) return; // already processed
      // Process whatever we collected, even if isFinal never fired
      if (transcript.trim() && !busyRef.current) {
        handled = true;
        onResult(transcript.trim());
      } else if (!busyRef.current && startedRef.current && !micMutedRef.current) {
        // Nothing heard — listen again
        setTimeout(() => listenOnce(onResult), 200);
      }
    };

    recognitionRef.current = r;
    try { r.start(); } catch(e) {}
  };

  // ── Core: process what user said, then listen again ──
  const processAndListen = async (text) => {
    killMic();
    busyRef.current = true;
    setIsThinking(true);

    addMsg('user', text);

    const cmd = detectCommand(text.toLowerCase());
    const p   = personaRef.current;
    const step = recipe.steps[currentStepRef.current] || recipe.steps[0];

    const say = (msg) => {
      addMsg('chef', msg);
      speak(msg, () => {
        // After speaking, listen again
        if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen);
      });
    };

    if (cmd === 'next') {
      setIsThinking(false);
      const next = currentStepRef.current + 1;
      if (next < recipe.steps.length) {
        setCurrentStep(next); currentStepRef.current = next;
        const s = recipe.steps[next];
        const msg = p.readStep(next + 1, s);
        addMsg('chef', `Step ${next + 1}: ${s.title} — ${s.instruction}`);
        speak(msg, () => { if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen); });
      } else {
        say(p.id==='gordon' ? "That's it! Brilliant. Plate it up." : p.id==='grandma' ? "All done beta! So proud of you!" : p.id==='blogger' ? "OH MY GOD you did it! AMAZING!" : "Complete. Breathe. Enjoy.");
      }
      return;
    }
    if (cmd === 'prev') {
      setIsThinking(false);
      const prev = currentStepRef.current - 1;
      if (prev >= 0) {
        setCurrentStep(prev); currentStepRef.current = prev;
        const s = recipe.steps[prev];
        addMsg('chef', `Step ${prev + 1}: ${s.title} — ${s.instruction}`);
        speak(p.readStep(prev + 1, s), () => { if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen); });
      } else { say("You're on the first step already!"); }
      return;
    }
    if (cmd === 'repeat') {
      setIsThinking(false);
      const s = recipe.steps[currentStepRef.current];
      addMsg('chef', `Step ${currentStepRef.current + 1}: ${s.title} — ${s.instruction}`);
      speak(p.readStep(currentStepRef.current + 1, s), () => { if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen); });
      return;
    }
    if (cmd === 'ingredients') { setIsThinking(false); say(`You need: ${recipe.ingredients.slice(0,6).join(', ')}.`); return; }
    if (cmd === 'time')        { setIsThinking(false); say(`This step takes about ${step.time}.`); return; }
    if (cmd === 'stop')        { setIsThinking(false); busyRef.current = false; setIsSpeaking(false); window.speechSynthesis.cancel(); listenOnce(processAndListen); return; }

    // AI question
    try {
      const reply = await askGroq([
        { role: 'system', content: p.systemPrompt(step, recipe.name) },
        { role: 'user', content: text }
      ]);
      setIsThinking(false);
      say(reply);
    } catch(e) {
      setIsThinking(false);
      say('Sorry, could not connect. Please try again.');
    }
  };

  // ── Start session ──
  const startSession = () => {
    setStarted(true); startedRef.current = true;
    setConversation([]);
    const p = personaRef.current;
    const step = recipe.steps[currentStepRef.current] || recipe.steps[0];
    addMsg('system', `${p.emoji} ${p.name} ready. Say "next", "repeat", "ingredients", or ask anything!`);
    addMsg('chef', `Hi! I'm ${p.name}. Let's cook ${recipe.name}! Step 1: ${step.title}`);
    speak(`Hi, I'm ${p.name}. Let's cook ${recipe.name}. ${p.readStep(1, step)}`, () => {
      if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen);
    });
  };

  // Legacy alias used by UI buttons
  const readStep = (idx) => {
    const s = recipe.steps[idx];
    if (!s) return;
    killMic();
    addMsg('chef', `Step ${idx + 1}: ${s.title} — ${s.instruction}`);
    speak(personaRef.current.readStep(idx + 1, s), () => {
      if (startedRef.current && !micMutedRef.current) listenOnce(processAndListen);
    });
  };

  const handleSpeech = processAndListen; // alias for tap buttons
  const startListeningLoop = () => listenOnce(processAndListen); // alias for UI
  const stopListeningNow = killMic;

  const toggleMic = () => {
    const next = !micMuted;
    setMicMuted(next); micMutedRef.current = next;
    if (next) { stopListeningNow(); }
    else if (started) { startListeningLoop(); }
  };

  const fetchVoiceLibrary = async () => {
    const elevenKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!elevenKey || voiceLibrary.length > 0) return;
    setVoiceLoading(true);
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': elevenKey }
      });
      const data = await res.json();
      const voices = (data.voices || [])
        .filter(v => v.preview_url)
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoiceLibrary(voices);
    } catch(e) { console.warn('Failed to load voices:', e); }
    finally { setVoiceLoading(false); }
  };

  const previewVoice = (url) => {
    if (previewAudio) { previewAudio.pause(); previewAudio.currentTime = 0; }
    const audio = new Audio(url);
    setPreviewAudio(audio);
    audio.play().catch(() => {});
    audio.onended = () => setPreviewAudio(null);
  };

  const p = PERSONAS[selectedPersona];
  const totalSteps = recipe.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = recipe.steps[currentStep] || recipe.steps[0];

  return (
    <>
      {/* Floating mic button */}
      <div style={{ position: 'fixed', bottom: 28, right: 32, zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>

        {/* ── Persona Picker ── */}
        {showPicker && !isOpen && (
          <div style={{ background: `color-mix(in srgb, ${mode.bg} 94%, #000 6%)`, border: `1px solid ${mode.accent}44`, borderRadius: 20, padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', width: 256, animation: 'voicePanelIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(240,235,227,0.7)', marginBottom: 12, textAlign: 'center' }}>🎙️ Choose your voice</div>

            {/* 4 AI personas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 }}>
              {Object.values(PERSONAS).filter(x => x.id !== 'custom').map(x => (
                <button key={x.id} onClick={() => setPersona(x.id)} style={{ padding: '10px 8px', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${selectedPersona === x.id ? x.color + 'bb' : 'rgba(255,255,255,0.08)'}`, background: selectedPersona === x.id ? `${x.color}28` : 'rgba(255,255,255,0.04)', color: selectedPersona === x.id ? x.color : 'rgba(240,235,227,0.5)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 20 }}>{x.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: selectedPersona === x.id ? 600 : 400 }}>{x.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.5, fontStyle: 'italic' }}>{x.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Voice from ElevenLabs Library */}
            <button onClick={() => { setPersona('custom'); fetchVoiceLibrary(); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 14, cursor: 'pointer', border: `1.5px solid ${selectedPersona === 'custom' ? '#b07ab5bb' : 'rgba(255,255,255,0.08)'}`, background: selectedPersona === 'custom' ? '#b07ab528' : 'rgba(255,255,255,0.04)', color: selectedPersona === 'custom' ? '#b07ab5' : 'rgba(240,235,227,0.5)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🎤</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: selectedPersona === 'custom' ? 600 : 400 }}>Custom Voice</div>
                <div style={{ fontSize: 10, opacity: 0.55, fontStyle: 'italic' }}>{customVoiceId ? `✓ ${customVoiceName}` : 'Pick from ElevenLabs library'}</div>
              </div>
            </button>

            {/* Voice Library Browser */}
            {selectedPersona === 'custom' && (
              <div style={{ marginBottom: 10, animation: 'fadeIn 0.2s ease' }}>
                <input
                  value={voiceSearch}
                  onChange={e => setVoiceSearch(e.target.value)}
                  placeholder='Search voices...'
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: '#f0ebe3', fontFamily: "'DM Sans', sans-serif", outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
                />
                {voiceLoading ? (
                  <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'rgba(240,235,227,0.3)' }}>Loading voices...</div>
                ) : (
                  <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }} className='sidebar-scroll'>
                    {voiceLibrary
                      .filter(v => v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                                   (v.labels?.description || '').toLowerCase().includes(voiceSearch.toLowerCase()) ||
                                   (v.labels?.accent || '').toLowerCase().includes(voiceSearch.toLowerCase()))
                      .slice(0, 40)
                      .map(v => (
                        <div key={v.voice_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 10, background: customVoiceId === v.voice_id ? '#b07ab528' : 'rgba(255,255,255,0.03)', border: `1px solid ${customVoiceId === v.voice_id ? '#b07ab566' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                             onClick={() => { setCustomVoiceId(v.voice_id); setCustomVoiceName(v.name); }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: customVoiceId === v.voice_id ? '#b07ab5' : 'rgba(240,235,227,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                            <div style={{ fontSize: 10, color: 'rgba(240,235,227,0.3)', marginTop: 1 }}>
                              {[v.labels?.accent, v.labels?.age, v.labels?.gender].filter(Boolean).join(' · ') || v.category}
                            </div>
                          </div>
                          {v.preview_url && (
                            <button onClick={e => { e.stopPropagation(); previewVoice(v.preview_url); }}
                              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', color: 'rgba(240,235,227,0.5)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              ▶
                            </button>
                          )}
                        </div>
                      ))
                    }
                    {voiceLibrary.length === 0 && !voiceLoading && (
                      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 11, color: 'rgba(240,235,227,0.25)' }}>
                        {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'No voices found' : '⚠️ Add ElevenLabs API key to browse voices'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ElevenLabs notice */}
            <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: 'rgba(240,235,227,0.3)', textAlign: 'center', lineHeight: 1.5 }}>
              {import.meta.env.VITE_ELEVENLABS_API_KEY ? '✅ ElevenLabs connected — real voices active' : '⚠️ Add VITE_ELEVENLABS_API_KEY for real voices. Using browser TTS for now.'}
            </div>

            {/* Start button */}
            <button
              disabled={false}
              onClick={() => {
                setShowPicker(false);
                setIsOpen(true);
                setConversation([]);
                setStarted(false);
                startedRef.current = false;
                setTimeout(() => startSession(), 350);
              }}
              style={{ width: '100%', padding: '11px', borderRadius: 14, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, color: '#111', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 6px 24px ${p.color}44`, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {`${p.emoji} Start with ${p.name}`}
            </button>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: 'rgba(240,235,227,0.18)' }}>Click 🎙️ again to close</div>
          </div>
        )}

        {/* Mic FAB */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { if (isOpen) { window.speechSynthesis.cancel(); stopListeningNow(); setIsOpen(false); setStarted(false); startedRef.current = false; setShowPicker(false); } else { setShowPicker(o => !o); } }} style={{ width: 58, height: 58, borderRadius: '50%', border: `2px solid ${(isOpen || showPicker) ? mode.accent : mode.accent + '55'}`, cursor: 'pointer', fontSize: 24, background: isOpen ? mode.accent : showPicker ? `${mode.accent}33` : `${mode.accent}18`, color: isOpen ? '#111' : mode.accent, boxShadow: `0 8px 32px ${mode.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform: isOpen ? 'rotate(45deg) scale(1.05)' : showPicker ? 'scale(1.08)' : 'scale(1)' }}>
            {isOpen ? '✕' : '🎙️'}
          </button>
          {isSpeaking && <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid ${mode.accent}44`, animation: 'micPulse 1.2s ease-out infinite', pointerEvents: 'none' }} />}
          {isListening && <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `2px solid #7cb99a66`, animation: 'micPulse 0.8s ease-out infinite', pointerEvents: 'none' }} />}
        </div>
      </div>

      {/* ── Main Voice Panel ── */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: 100, right: 32, width: 340, zIndex: 499, background: `color-mix(in srgb, ${mode.bg} 94%, #000 6%)`, border: `1px solid ${mode.accent}33`, borderRadius: 24, boxShadow: `0 32px 80px rgba(0,0,0,0.75)`, overflow: 'hidden', animation: 'voicePanelIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>

          {/* Header */}
          <div style={{ padding: '14px 18px 12px', background: `${mode.accent}0d`, borderBottom: `1px solid ${mode.accent}1a`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🎙️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(240,235,227,0.9)' }}>Voice Assistant</span>
              {isSpeaking  && <span style={{ fontSize: 10, color: mode.accent, background: `${mode.accent}22`, padding: '2px 8px', borderRadius: 10, animation: 'shimmerPulse 1s infinite' }}>● SPEAKING</span>}
              {isThinking  && <span style={{ fontSize: 10, color: '#c4a84f', background: '#c4a84f22', padding: '2px 8px', borderRadius: 10, animation: 'shimmerPulse 0.7s infinite' }}>● THINKING</span>}
              {isListening && <span style={{ fontSize: 10, color: '#7cb99a', background: '#7cb99a22', padding: '2px 8px', borderRadius: 10, animation: 'shimmerPulse 0.5s infinite' }}>● LISTENING</span>}
            </div>
            {/* Active persona + change */}
            <button onClick={() => { window.speechSynthesis.cancel(); stopListeningNow(); setIsOpen(false); setStarted(false); startedRef.current = false; setShowPicker(true); }} style={{ fontSize: 11, color: p.color, background: `${p.color}18`, border: `1px solid ${p.color}44`, borderRadius: 10, padding: '4px 10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {p.emoji} Change
            </button>
          </div>

          {/* Current persona badge */}
          <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${p.color}18`, border: `1px solid ${p.color}33`, borderRadius: 20, padding: '5px 12px' }}>
              <span style={{ fontSize: 16 }}>{p.emoji}</span>
              <span style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: `${p.color}88`, fontStyle: 'italic' }}>· {p.desc}</span>
            </div>
          </div>

          {/* Custom voice badge */}
          {selectedPersona === 'custom' && customVoiceId && (
            <div style={{ padding: '4px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#b07ab515', border: '1px solid #b07ab544', borderRadius: 10, padding: '8px 12px' }}>
                <span style={{ fontSize: 14 }}>🎤</span>
                <span style={{ flex: 1, fontSize: 11, color: '#b07ab5' }}>Using: {customVoiceName}</span>
              </div>
            </div>
          )}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 16px' }} />

          {/* Step progress */}
          <div style={{ padding: '12px 18px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(240,235,227,0.4)' }}>Now on</span>
              <span style={{ fontSize: 11, color: mode.accent, fontWeight: 600 }}>Step {currentStep + 1} / {totalSteps}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(240,235,227,0.85)', marginBottom: 3 }}>{step?.title}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${mode.accent}, ${mode.accent}aa)`, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Conversation */}
          {started && conversation.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: 'auto', padding: '6px 14px 8px' }} className='sidebar-scroll'>
              {conversation.map(msg => (
                <div key={msg.id} style={{ marginBottom: 8, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.2s ease' }}>
                  {msg.role === 'system' ? (
                    <div style={{ width: '100%', textAlign: 'center', fontSize: 11, color: 'rgba(240,235,227,0.25)', padding: '3px 0' }}>{msg.text}</div>
                  ) : (
                    <div style={{ maxWidth: '85%', padding: '8px 12px', fontSize: 13, lineHeight: 1.55, borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px', background: msg.role === 'user' ? `${mode.accent}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${msg.role === 'user' ? mode.accent + '44' : 'rgba(255,255,255,0.07)'}`, color: msg.role === 'user' ? mode.accent : 'rgba(240,235,227,0.8)' }}>
                      {msg.role === 'chef' && <span style={{ fontSize: 11, marginRight: 5 }}>{p.emoji}</span>}
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div style={{ display: 'flex', gap: 4, padding: '6px 12px', alignItems: 'center' }}>
                  <span style={{ fontSize: 11 }}>{p.emoji}</span>
                  {[0,1,2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: mode.accent, opacity: 0.7, animation: `typingDot 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={convEndRef} />
            </div>
          )}

          {/* Visualizer */}
          <div style={{ padding: '10px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 40 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{ width: 3, borderRadius: 3, background: (isListening || isSpeaking) ? mode.accent : 'rgba(255,255,255,0.1)', animation: (isListening || isSpeaking) ? `voiceBar ${0.35 + (i % 6) * 0.08}s ease-in-out ${i * 0.04}s infinite alternate` : 'none', minHeight: 3, maxHeight: 32, opacity: (isListening || isSpeaking) ? 0.5 + (i / 24) * 0.5 : 0.15, transition: 'background 0.3s ease' }} />
            ))}
          </div>

          {/* Status */}
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(240,235,227,0.35)', padding: '2px 0 10px', minHeight: 18 }}>
            {isListening ? (interimText ? `🎤 "${interimText}..."` : `🎤 Say "${p.name.split(' ')[0]}, ..." or a command`) : isThinking ? '🤔 Thinking...' : isSpeaking ? `${p.emoji} Speaking...` : started ? `Say "${p.name.split(' ')[0]}, [question]" · "next" · "repeat"` : 'Starting...'}
          </div>

          {/* Controls */}
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {/* Mic status + mute */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, background: micMuted ? 'rgba(255,255,255,0.04)' : isListening ? `${mode.accent}12` : isSpeaking ? 'rgba(255,165,0,0.08)' : `${mode.accent}06`, border: `1px solid ${micMuted ? 'rgba(255,255,255,0.08)' : isListening ? mode.accent + '55' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.3s ease' }}>
              <span style={{ fontSize: 18 }}>{micMuted ? '🔇' : isSpeaking ? p.emoji : isListening ? '🎤' : '🎙️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: micMuted ? 'rgba(240,235,227,0.3)' : isListening ? mode.accent : 'rgba(240,235,227,0.6)' }}>
                  {micMuted ? 'Mic muted' : isListening ? 'Listening...' : isSpeaking ? `${p.name} speaking` : 'Mic always on'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(240,235,227,0.25)', marginTop: 1 }}>
                  {interimText ? `"${interimText}"` : micMuted ? 'Tap to unmute' : `Say "${p.name.split(' ')[0]}, ..." to speak`}
                </div>
              </div>
              <button onClick={toggleMic} title={micMuted ? 'Unmute' : 'Mute'} style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${micMuted ? 'rgba(255,100,100,0.4)' : 'rgba(255,255,255,0.12)'}`, background: micMuted ? 'rgba(255,100,100,0.15)' : 'rgba(255,255,255,0.06)', color: micMuted ? 'rgba(255,130,130,0.8)' : 'rgba(240,235,227,0.4)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {micMuted ? '🎤' : '🔇'}
              </button>
            </div>

            {/* Prev / Next */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { if (currentStep > 0) { const prev = currentStep - 1; setCurrentStep(prev); currentStepRef.current = prev; readStep(prev); } }} disabled={currentStep === 0} style={{ flex: 1, padding: '9px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: currentStep === 0 ? 'rgba(240,235,227,0.2)' : 'rgba(240,235,227,0.6)', cursor: currentStep === 0 ? 'default' : 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>⏮ Previous</button>
              <button onClick={() => { if (currentStep < totalSteps - 1) { const next = currentStep + 1; setCurrentStep(next); currentStepRef.current = next; readStep(next); } }} disabled={currentStep === totalSteps - 1} style={{ flex: 1, padding: '9px', borderRadius: 12, border: `1px solid ${mode.accent}44`, background: `${mode.accent}15`, color: currentStep === totalSteps - 1 ? 'rgba(240,235,227,0.2)' : mode.accent, cursor: currentStep === totalSteps - 1 ? 'default' : 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Next ⏭</button>
            </div>

            {/* Quick tap commands */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['next step', 'repeat', 'ingredients', 'how long?'].map(cmd => (
                <button key={cmd} onClick={() => started && handleSpeech(cmd)} style={{ padding: '5px 11px', borderRadius: 20, fontSize: 11, cursor: started ? 'pointer' : 'default', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: started ? 'rgba(240,235,227,0.5)' : 'rgba(240,235,227,0.2)', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => started && (e.target.style.background = `${mode.accent}18`, e.target.style.color = mode.accent)}
                  onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.04)', e.target.style.color = started ? 'rgba(240,235,227,0.5)' : 'rgba(240,235,227,0.2)')}
                >{cmd}</button>
              ))}
            </div>

            {isSpeaking && (
              <button onClick={() => { window.speechSynthesis.cancel(); busyRef.current = false; setIsSpeaking(false); setTimeout(() => listenOnce(processAndListen), 300); }} style={{ width: '100%', padding: '7px', borderRadius: 10, border: '1px solid rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.08)', color: 'rgba(255,150,150,0.7)', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                ⏹ Stop speaking
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}


// ── AI Recipe Detail View ──
function AIRecipeView({ recipe, mode, onBack, onFavourite, isFav, selectedPersonaGlobal, setPersonaGlobal }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const toggleStep = (i, e) => {
    if (e.target.closest(".step-chat-zone")) return;
    setCurrentStep(i);
    setCompletedSteps(prev => prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]);
  };

  return (
    <div className="recipe-view" style={{ maxWidth: 720, margin: "0 auto", padding: "24px 28px", width: "100%" }}>
      <button className="back-btn" onClick={onBack} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Back</button>

      {/* Hero photo if curated */}
      {recipe._photo && (
        <div style={{ borderRadius: 20, overflow: "hidden", height: 280, marginBottom: 28, position: "relative" }}>
          <img src={recipe._photo} alt={recipe.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer"/>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
        </div>
      )}

      {/* AI Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${mode.accent}18`, border: `1px solid ${mode.accent}44`, borderRadius: 20, padding: "5px 14px", marginBottom: 20, fontSize: 12, color: mode.accent, fontWeight: 500 }}>
        ✨ AI Generated · {mode.emoji} {mode.label} mode
      </div>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>{recipe.name}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(240,235,227,0.65)", marginBottom: 28, fontStyle: "italic", fontFamily: "'Playfair Display', serif" }}>{recipe.description}</p>

      {/* Meta */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        {[{ icon: "⏱", label: recipe.totalTime }, { icon: "📊", label: recipe.difficulty }, { icon: "👨‍🍳", label: `Serves ${recipe.serves}` }, { icon: "🔥", label: recipe.calories }].map((m, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span>{m.icon}</span><span style={{ color: "rgba(240,235,227,0.75)" }}>{m.label}</span>
          </div>
        ))}
        <button onClick={onFavourite} style={{ background: isFav ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.05)", border: isFav ? "1px solid rgba(255,100,100,0.4)" : "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px", fontSize: 20, cursor: "pointer", transition: "all 0.2s ease" }}>
          {isFav ? "♥" : "♡"}
        </button>
      </div>

      {/* Ingredients */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 24px", marginBottom: 32 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16, color: mode.accent }}>🧾 Ingredients</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: mode.accent, flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontSize: 14, color: "rgba(240,235,227,0.8)", lineHeight: 1.5 }}>{ing}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20, color: mode.accent }}>👨‍🍳 Step-by-Step Method</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recipe.steps.map((step, i) => {
            const done = completedSteps.includes(i);
            return (
              <div key={i} onClick={(e) => toggleStep(i, e)} style={{
                background: done ? `${mode.accent}12` : i === currentStep ? `${mode.accent}08` : "rgba(255,255,255,0.03)",
                border: `1px solid ${done ? mode.accent + "44" : i === currentStep ? mode.accent + "33" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: "18px 20px",
                cursor: "pointer", transition: "all 0.25s ease",
                position: "relative", overflow: "hidden"
              }}>
                {done && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: mode.accent, borderRadius: "16px 0 0 16px" }} />}

                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* Step number */}
                  <div style={{
                    minWidth: 36, height: 36, borderRadius: "50%",
                    background: done ? mode.accent : `${mode.accent}22`,
                    border: `1.5px solid ${done ? mode.accent : mode.accent + "55"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: done ? 16 : 13, fontWeight: 700,
                    color: done ? "#111" : mode.accent,
                    flexShrink: 0, transition: "all 0.25s ease"
                  }}>{done ? "✓" : i + 1}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title + time */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: done ? mode.accent : "rgba(240,235,227,0.9)", textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1, transition: "all 0.2s ease" }}>{step.title}</span>
                      <span style={{ fontSize: 11, background: `${mode.accent}18`, color: mode.accent, borderRadius: 20, padding: "3px 10px", fontWeight: 500, flexShrink: 0 }}>⏱ {step.time}</span>
                    </div>

                    {/* Instruction */}
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: done ? "rgba(240,235,227,0.35)" : "rgba(240,235,227,0.7)", transition: "color 0.2s ease" }}>{step.instruction}</p>

                    {/* Tip */}
                    {step.tip && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, fontSize: 12, color: "rgba(240,235,227,0.45)", borderLeft: `2px solid ${mode.accent}55` }}>
                        💡 {step.tip}
                      </div>
                    )}

                    {/* ── Step Chat ── */}
                    <div className="step-chat-zone">
                      <StepChat
                        step={step}
                        stepIndex={i}
                        recipeName={recipe.name}
                        mode={mode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 24, padding: "14px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "rgba(240,235,227,0.4)" }}>
            <span>Progress</span>
            <span>{completedSteps.length} / {recipe.steps.length} steps</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${mode.accent}, ${mode.accent}cc)`, width: `${(completedSteps.length / recipe.steps.length) * 100}%`, transition: "width 0.4s ease" }} />
          </div>
          {completedSteps.length === recipe.steps.length && (
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: mode.accent, fontWeight: 500 }}>
              🎉 Recipe complete! Enjoy your meal.
            </div>
          )}
        </div>
      </div>
      {/* Voice Assistant */}
      <VoiceAssistant recipe={recipe} currentStep={currentStep} setCurrentStep={setCurrentStep} mode={mode} globalPersona={selectedPersonaGlobal} setGlobalPersona={setPersonaGlobal} />

      <div style={{ height: 100 }} />
    </div>
  );
}

// ── Main App ──
export default function CookingApp() {
  const [activeMode, setActiveMode]   = useState("healthy");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [aiRecipe, setAiRecipe]       = useState(null);
  const [favourites, setFavourites]   = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [customRecipes, setCustomRecipes]   = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused]   = useState(false);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [view, setView]               = useState("feed");
  const [modeTransition, setModeTransition] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({ healthy: true, tasty: true, quick: true });
  const [error, setError]             = useState(null);
  const [showAuth, setShowAuth]       = useState(false);
  const [user, setUser]               = useState(null);
  const [selectedPersonaGlobal, setPersonaGlobal] = useState('gordon');
  const searchRef = useRef(null);
  const mode = MODES[activeMode];

  // ── Auth listener ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Supabase sync hooks ──
  const { toggleFav } = useFavoritesSync(user?.id, favourites, setFavourites);
  const { trackView } = useRecentlyViewedSync(user?.id, setRecentlyViewed);
  const { saveRecipe, deleteRecipe } = useCustomRecipesSync(user?.id, setCustomRecipes);
  usePreferencesSync(user?.id, activeMode, selectedPersonaGlobal, setActiveMode, setPersonaGlobal);

  const switchMode = (newMode) => {
    if (newMode === activeMode) return;
    setModeTransition(true);
    setTimeout(() => { setActiveMode(newMode); setModeTransition(false); }, 300);
  };

  const openRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setAiRecipe(null);
    setView("loading-recipe");
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== recipe.id);
      return [recipe, ...filtered].slice(0, 9);
    });
    if (user) trackView(recipe);

    const modeObj = MODES[activeMode] || Object.values(MODES)[0];
    const prompt = `You are a professional chef. Generate a full structured recipe for: "${recipe.name}"
Description: "${recipe.desc}"
Mode: ${modeObj.label} — ${modeObj.rules}
Respond ONLY with valid JSON, no markdown:
{
  "name": "${recipe.name}",
  "description": "One enticing sentence.",
  "totalTime": "${recipe.time}",
  "difficulty": "${recipe.diff}",
  "serves": "2",
  "calories": "~XXX kcal",
  "ingredients": ["quantity + ingredient"],
  "steps": [{"title": "Short title", "time": "X min", "instruction": "Clear instruction.", "tip": "Optional tip or empty string"}]
}
Rules: 6-10 ingredients, 4-7 steps, beginner-friendly.`;

    try {
      const text = await askGroq([
        { role: "system", content: "You are a professional chef. Always respond with valid JSON only. No markdown, no explanation, just raw JSON." },
        { role: "user", content: prompt }
      ]);
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      parsed._photo = recipe.photo;
      setAiRecipe(parsed);
      setView("ai-recipe");
      try { if (user) await saveRecipe(parsed, activeMode); } catch(e) { /* Supabase optional */ }
      try { await trackView(recipe); } catch(e) { /* Supabase optional */ }
    } catch (e) {
      console.error("Recipe generation failed:", e);
      setView("feed");
    }
  };

  const toggleFavourite = (recipe) => toggleFav(typeof recipe === "object" ? recipe : { id: recipe });
  const toggleSection = (id) => setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const findCuratedMatch = (query) => {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let best = null, bestScore = 0;
    for (const recipe of mode.recipes) {
      let score = 0;
      const searchable = (recipe.name + " " + recipe.tags.join(" ") + " " + recipe.desc).toLowerCase();
      for (const word of words) { if (searchable.includes(word)) score++; }
      if (score > bestScore) { bestScore = score; best = recipe; }
    }
    return bestScore >= 2 ? best : null;
  };

  const generateRecipe = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    const curated = findCuratedMatch(searchQuery);
    if (curated) { openRecipe(curated); setSearchQuery(""); setSearchFocused(false); return; }

    setIsGenerating(true);
    const prompt = `You are a professional chef. Generate a recipe based on: "${searchQuery}"
Mode: ${mode.label} — ${mode.rules}
Respond ONLY with valid JSON, no markdown:
{
  "name": "Recipe Name",
  "description": "One enticing sentence.",
  "totalTime": "X min",
  "difficulty": "Easy|Medium|Hard",
  "serves": "2",
  "calories": "~XXX kcal",
  "ingredients": ["200g ingredient", "2 tbsp another"],
  "steps": [{"title": "Short title", "time": "X min", "instruction": "Clear instruction.", "tip": "Optional tip or empty string"}]
}
Rules: 6-10 ingredients, 4-7 steps, match ${mode.label} style strictly, beginner-friendly instructions.`;

    try {
      const text = await askGroq([
        { role: "system", content: "You are a professional chef. Always respond with valid JSON only. No markdown, no explanation, just raw JSON." },
        { role: "user", content: prompt }
      ]);
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiRecipe(parsed);
      setView("ai-recipe");
      setSearchQuery("");
      setSearchFocused(false);
    } catch (e) {
      setError("Couldn't generate recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") generateRecipe();
    if (e.key === "Escape") { setSearchFocused(false); searchRef.current?.blur(); }
  };

  const allRecipes = Object.values(MODES).flatMap(m => m.recipes);
  const favRecipes = allRecipes.filter(r => favourites.includes(r.id));
  const displayRecipes = view === "favourites" ? favRecipes : mode.recipes;

  return (
    <>
    {showAuth && <AuthModal mode={mode} onClose={() => setShowAuth(false)} />}
    <div style={{ minHeight: "100vh", background: mode.bg, fontFamily: "'DM Sans', sans-serif", color: "#f0ebe3", transition: "background 0.6s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

        .recipe-card { cursor: pointer; transition: transform 0.3s ease, box-shadow 0.3s ease; animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .recipe-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important; }
        .recipe-card:hover .card-img { transform: scale(1.05); }
        .card-img { transition: transform 0.5s ease; }
        .sidebar-item { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 8px; cursor: pointer; transition: background 0.15s ease; border: none; background: none; width: 100%; text-align: left; color: rgba(240,235,227,0.6); font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.4; }
        .sidebar-item:hover { background: rgba(255,255,255,0.06); color: rgba(240,235,227,0.9); }
        .sidebar-item.active { background: rgba(255,255,255,0.09); color: #f0ebe3; }
        .section-toggle { display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; border-radius: 6px; cursor: pointer; transition: background 0.15s ease; border: none; background: none; width: 100%; color: rgba(240,235,227,0.3); font-family: 'DM Sans', sans-serif; }
        .section-toggle:hover { background: rgba(255,255,255,0.04); }
        .mode-btn { cursor: pointer; transition: all 0.3s ease; border: none; outline: none; }
        .mode-btn:hover { transform: translateY(-2px); }
        .fav-btn { cursor: pointer; transition: transform 0.2s ease; background: none; border: none; outline: none; }
        .fav-btn:hover { transform: scale(1.2); }
        .search-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #f0ebe3; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); outline: none; font-family: 'DM Sans', sans-serif; }
        .search-input::placeholder { color: rgba(240,235,227,0.3); }
        .search-input.focused { background: rgba(255,255,255,0.09); }
        .back-btn { cursor: pointer; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #f0ebe3; transition: all 0.2s ease; }
        .back-btn:hover { background: rgba(255,255,255,0.12); }
        .tag-pill { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(240,235,227,0.6); }
        .icon-btn { background: none; border: none; cursor: pointer; color: rgba(240,235,227,0.4); transition: all 0.2s ease; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: rgba(255,255,255,0.07); color: rgba(240,235,227,0.8); }
        .nav-pill { cursor: pointer; transition: all 0.25s ease; border: none; outline: none; font-family: 'DM Sans', sans-serif; }
        .generate-btn { cursor: pointer; border: none; outline: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s ease; }
        .generate-btn:hover { transform: translateY(-1px); }
        .search-overlay { position: fixed; inset: 0; z-index: 150; pointer-events: none; transition: background 0.3s ease; }
        .search-overlay.active { background: rgba(0,0,0,0.4); pointer-events: all; backdrop-filter: blur(2px); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes sidebarIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shimmerPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes searchExpand { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes chatSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes voicePanelIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes voiceBar { from { transform: scaleY(0.3); } to { transform: scaleY(1.0); } }
        @keyframes micPulse { 0%, 100% { box-shadow: 0 0 0 0px rgba(255,255,255,0.2); } 50% { box-shadow: 0 0 0 12px rgba(255,255,255,0.0); } }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.7; } 30% { transform: translateY(-4px); opacity: 1; } }

        .mode-fade { animation: fadeIn 0.4s ease; }
        .recipe-view { animation: slideIn 0.4s ease; }
        .sidebar-content { animation: sidebarIn 0.2s ease; }
        .search-dropdown { animation: searchExpand 0.2s ease; }
        .spinner { animation: spin 0.8s linear infinite; display: inline-block; }
      `}</style>

      <div className={`search-overlay ${searchFocused ? "active" : ""}`} onClick={() => { setSearchFocused(false); searchRef.current?.blur(); }} />

      {/* ════════ SIDEBAR ════════ */}
      <div style={{ position: "fixed", top: 0, left: 0, width: sidebarOpen ? SIDEBAR_W : 0, height: "100vh", overflow: "hidden", background: `color-mix(in srgb, ${mode.bg} 82%, #000 18%)`, borderRight: sidebarOpen ? "1px solid rgba(255,255,255,0.07)" : "none", display: "flex", flexDirection: "column", zIndex: 300, transition: "width 0.25s ease, background 0.6s ease" }}>
        {sidebarOpen && (
          <div className="sidebar-content" style={{ display: "flex", flexDirection: "column", height: "100%", width: SIDEBAR_W }}>
            <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, ${mode.accent}, ${mode.accent}77)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🍳</div>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Cookr</span>
                </div>
                <button className="icon-btn" onClick={() => setSidebarOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="1" y="1" width="5" height="14" rx="1" fill="currentColor" opacity="0.15"/></svg>
                </button>
              </div>
            </div>
            <div style={{ padding: "8px 8px 2px", flexShrink: 0 }}>
              <button className={`sidebar-item ${view === "feed" ? "active" : ""}`} onClick={() => setView("feed")}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/></svg>
                Discover
              </button>
              <button className={`sidebar-item ${view === "favourites" ? "active" : ""}`} onClick={() => setView("favourites")}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 13.5C8 13.5 2 9.8 2 5.5a3.5 3.5 0 017-.35A3.5 3.5 0 0114 5.5c0 4.3-6 8-6 8z" stroke="currentColor" strokeWidth="1.3"/></svg>
                Saved recipes
                {favourites.length > 0 && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.09)", borderRadius: 10, padding: "1px 7px", fontSize: 11, color: "rgba(240,235,227,0.45)" }}>{favourites.length}</span>}
              </button>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 12px", flexShrink: 0 }} />
            <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: "2px 8px 12px" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(240,235,227,0.28)", padding: "8px 8px", fontWeight: 600 }}>Recently Tried</div>
              {Object.values(MODES).map(m => {
                const modeRecent = recentlyViewed.filter(r => m.recipes.some(mr => mr.id === r.id)).slice(0, 3);
                const isExpanded = expandedSections[m.id];
                return (
                  <div key={m.id} style={{ marginBottom: 2 }}>
                    <button className="section-toggle" onClick={() => toggleSection(m.id)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12 }}>{m.emoji}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: activeMode === m.id ? m.accent : "rgba(240,235,227,0.32)" }}>{m.label}</span>
                        {modeRecent.length > 0 && <span style={{ fontSize: 10, background: `${m.accent}20`, color: m.accent, borderRadius: 8, padding: "1px 6px" }}>{modeRecent.length}</span>}
                      </div>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: isExpanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s ease" }}><path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {isExpanded && (
                      <div>
                        {modeRecent.length === 0
                          ? <div style={{ padding: "5px 10px 8px", fontSize: 12, color: "rgba(240,235,227,0.18)", fontStyle: "italic" }}>Nothing yet</div>
                          : modeRecent.map(r => (
                            <button key={r.id} className={`sidebar-item ${selectedRecipe?.id === r.id && view === "recipe" ? "active" : ""}`} onClick={() => openRecipe(r)}>
                              <div style={{ width: 26, height: 26, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: `${mode.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{r.photo ? <img src={r.photo} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display="none"; }} referrerPolicy="no-referrer" /> : "🍽️"}</div>
                              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* My Recipes link */}
            {customRecipes.length > 0 && (
              <div style={{ padding: "4px 8px 0" }}>
                <button className={`sidebar-item ${view === "my-recipes" ? "active" : ""}`} onClick={() => setView("my-recipes")}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  My Recipes
                  <span style={{ marginLeft: "auto", background: `${mode.accent}22`, color: mode.accent, borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>{customRecipes.length}</span>
                </button>
              </div>
            )}
            <div style={{ padding: "10px 12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${mode.accent}55, ${mode.accent}22)`, border: `1px solid ${mode.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} referrerPolicy="no-referrer"/> : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,235,227,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.user_metadata?.full_name || user.email}</div>
                    <button onClick={() => supabase.auth.signOut()} style={{ fontSize: 11, color: "rgba(240,235,227,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>Sign out</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: `1px solid ${mode.accent}44`, background: `${mode.accent}12`, color: mode.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  🔑 Sign in / Sign up
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════ MAIN ════════ */}
      <div style={{ marginLeft: sidebarOpen ? SIDEBAR_W : 0, transition: "margin-left 0.25s ease", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Nav */}
        <nav style={{ position: "sticky", top: 0, zIndex: 200, padding: "11px 20px", background: `${mode.bg}f0`, backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14, transition: "background 0.6s ease" }}>
          {!sidebarOpen && (
            <button className="icon-btn" onClick={() => setSidebarOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="1" y="1" width="5" height="14" rx="1" fill="currentColor" opacity="0.15"/></svg>
            </button>
          )}
          <div style={{ display: "flex", gap: 7, flex: 1 }}>
            {Object.values(MODES).map(m => (
              <button key={m.id} className="mode-btn nav-pill" onClick={() => switchMode(m.id)} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: activeMode === m.id ? `linear-gradient(135deg, ${m.accent}, ${m.accent}cc)` : "rgba(255,255,255,0.06)", color: activeMode === m.id ? "#111" : "rgba(240,235,227,0.5)", border: activeMode === m.id ? "none" : "1px solid rgba(255,255,255,0.07)", boxShadow: activeMode === m.id ? `0 4px 18px ${m.accent}44` : "none" }}>{m.emoji} {m.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ id: "feed", label: "Discover" }, { id: "favourites", label: "♥ Saved" }].map(v => (
              <button key={v.id} className="nav-pill" onClick={() => setView(v.id)} style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, color: view === v.id ? mode.bg : "rgba(240,235,227,0.45)", background: view === v.id ? mode.accent : "transparent", border: "none" }}>{v.label}</button>
            ))}
          </div>
        </nav>

        {/* AI Recipe */}
        {view === "ai-recipe" && aiRecipe && (
          <AIRecipeView
            recipe={aiRecipe} mode={mode}
            onBack={() => setView("feed")}
            onFavourite={() => toggleFavourite(selectedRecipe?.id)}
            isFav={selectedRecipe ? favourites.includes(selectedRecipe.id) : false}
          />
        )}

        {/* Loading state when opening a curated card */}
        {view === "loading-recipe" && selectedRecipe && (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 28px", width: "100%" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", height: 320, marginBottom: 28, position: "relative", background: "rgba(255,255,255,0.04)" }}>
              <img src={selectedRecipe.photo} alt={selectedRecipe.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} onError={e => { e.target.style.display="none"; }} referrerPolicy="no-referrer" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: 28 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>{selectedRecipe.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "8px 20px", backdropFilter: "blur(10px)" }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 16 }}>⟳</span>
                  <span style={{ fontSize: 13, color: mode.accent, fontWeight: 500 }}>Generating full recipe with steps...</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 16, background: "rgba(255,255,255,0.04)", animation: "shimmerPulse 1.5s ease-in-out infinite", animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Feed */}
        {view !== "recipe" && view !== "ai-recipe" && (
          <div className={modeTransition ? "" : "mode-fade"} style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 28px", width: "100%" }}>
            <div style={{ marginBottom: 32 }}>
              {view === "feed" ? (
                <>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 8 }}>
                    {mode.emoji} {mode.label}<span style={{ fontStyle: "italic", fontWeight: 400, color: mode.accent, fontSize: 32, marginLeft: 8 }}>recipes</span>
                  </h2>
                  <p style={{ fontSize: 15, color: "rgba(240,235,227,0.45)" }}>{mode.tagline} · {mode.recipes.length} popular picks</p>
                </>
              ) : (
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em" }}>Your <span style={{ fontStyle: "italic", color: mode.accent }}>saved</span> recipes</h2>
              )}
            </div>

            {/* Search */}
            {view === "feed" && (
              <div style={{ marginBottom: 36, position: "relative", zIndex: 210 }}>
                <div style={{ maxWidth: searchFocused ? "100%" : 780, transition: "max-width 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
                  <div style={{ position: "relative", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: searchFocused ? 0.6 : 0.35, transition: "opacity 0.3s ease", pointerEvents: "none" }}>🔍</span>
                      <input ref={searchRef} className={`search-input ${searchFocused ? "focused" : ""}`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onKeyDown={handleKeyDown}
                        placeholder={searchFocused ? `Describe what you want... e.g. "paneer, no onion, under 20 mins"` : `✨  Ask AI to cook anything...`}
                        style={{ width: "100%", padding: searchFocused ? "18px 52px 18px 52px" : "15px 20px 15px 48px", borderRadius: searchFocused ? "16px 16px 0 0" : 14, fontSize: searchFocused ? 15 : 14, lineHeight: 1.5, borderColor: searchFocused ? mode.accent + "66" : "rgba(255,255,255,0.12)", boxShadow: searchFocused ? `0 0 0 3px ${mode.accent}18` : "none" }}
                      />
                      {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(240,235,227,0.5)", cursor: "pointer", fontSize: 14, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                    </div>
                    {searchFocused && (
                      <button className="generate-btn" onClick={generateRecipe} disabled={!searchQuery.trim() || isGenerating} style={{ padding: "15px 24px", borderRadius: 14, fontSize: 14, fontWeight: 600, background: searchQuery.trim() ? `linear-gradient(135deg, ${mode.accent}, ${mode.accent}cc)` : "rgba(255,255,255,0.07)", color: searchQuery.trim() ? "#111" : "rgba(240,235,227,0.3)", boxShadow: searchQuery.trim() ? `0 4px 20px ${mode.accent}44` : "none", whiteSpace: "nowrap", animation: "fadeIn 0.2s ease" }}>
                        {isGenerating ? <span className="spinner">⟳</span> : "Generate ✨"}
                      </button>
                    )}
                  </div>

                  {searchFocused && (
                    <div className="search-dropdown" style={{ background: `color-mix(in srgb, ${mode.bg} 95%, #fff 5%)`, border: `1px solid ${mode.accent}44`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "16px 20px 20px", boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: mode.accent, animation: "shimmerPulse 2s infinite" }} />
                        <span style={{ fontSize: 12, color: mode.accent, fontWeight: 500 }}>Generating in <strong>{mode.label}</strong> mode</span>
                      </div>
                      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(240,235,227,0.25)", marginBottom: 10, fontWeight: 600 }}>Try these</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                        {(activeMode === "healthy" ? ["High protein breakfast", "No-cook salad", "Low carb dinner", "Vegan bowl"] : activeMode === "tasty" ? ["Cheesy pasta", "Spicy chicken", "Comfort soup", "Sweet dessert"] : ["5-min snack", "One pan meal", "No cook lunch", "Quick stir fry"]).map(chip => (
                          <button key={chip} onClick={() => setSearchQuery(chip)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,235,227,0.6)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                            onMouseEnter={e => { e.target.style.background = `${mode.accent}22`; e.target.style.color = mode.accent; }}
                            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.color = "rgba(240,235,227,0.6)"; }}
                          >{chip}</button>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(240,235,227,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
                        <kbd style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>Enter</kbd> to generate ·
                        <kbd style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 4, padding: "2px 6px", fontSize: 10 }}>Esc</kbd> to close
                      </div>
                    </div>
                  )}
                </div>
                {error && <div style={{ marginTop: 10, fontSize: 13, color: "#e07b4a" }}>⚠️ {error}</div>}
                {isGenerating && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 13, color: mode.accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="spinner" style={{ fontSize: 16 }}>⟳</span> Crafting your recipe in <strong>{mode.label}</strong> style...
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                      <ShimmerCard /><ShimmerCard /><ShimmerCard />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recipe grid */}
            {!isGenerating && (displayRecipes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(240,235,227,0.35)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
                <p style={{ fontSize: 16 }}>No saved recipes yet. Start exploring!</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                {displayRecipes.map((recipe, i) => (
                  <div key={recipe.id} className="recipe-card" onClick={() => openRecipe(recipe)} style={{ background: mode.cardBg, borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", animationDelay: `${i * 0.07}s`, boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
                    <div style={{ height: 200, overflow: "hidden", position: "relative", background: `linear-gradient(135deg, ${mode.accent}22, ${mode.bg})` }}>
                      {/* Emoji fallback — shows when photo fails */}
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, zIndex: 0 }}>
                        {['🥗','🍗','🥘','🍝','🌮','🍔','🥙','🍜','🥗','🥚','🍱','🥞'][recipe.id % 12]}
                      </div>
                      {/* Photo — z-index 1 so it covers the emoji */}
                      <img src={recipe.photo} alt={recipe.name} className="card-img"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                        onError={e => { e.currentTarget.style.display = "none"; }}
                        referrerPolicy="no-referrer"
                      />
                      {/* Gradient + controls — z-index 2 so they sit above photo */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)", zIndex: 2 }} />
                      <button className="fav-btn" onClick={e => { e.stopPropagation(); toggleFavourite(recipe.id); }} style={{ position: "absolute", top: 12, right: 12, fontSize: 22, color: favourites.includes(recipe.id) ? "#ff6b6b" : "rgba(255,255,255,0.8)", textShadow: "0 2px 8px rgba(0,0,0,0.6)", zIndex: 3 }}>{favourites.includes(recipe.id) ? "♥" : "♡"}</button>
                      <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, zIndex: 3 }}>⏱ {recipe.time}</div>
                    </div>
                    <div style={{ padding: "18px 20px 20px" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{recipe.name}</h3>
                      <p style={{ fontSize: 13, color: "rgba(240,235,227,0.5)", lineHeight: 1.6, marginBottom: 14 }}>{recipe.desc}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="tag-pill">{recipe.diff}</span>
                        {recipe.tags.slice(0, 2).map(t => <span key={t} className="tag-pill">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ height: 60 }} />
          </div>
        )}

        {/* My Recipes View */}
        {view === "my-recipes" && (
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6, color: "rgba(240,235,227,0.95)" }}>My Recipes</h2>
            <p style={{ fontSize: 13, color: "rgba(240,235,227,0.35)", marginBottom: 24 }}>AI-generated recipes you've cooked</p>
            {customRecipes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(240,235,227,0.25)", fontSize: 14 }}>No recipes yet — generate one from the search bar!</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {customRecipes.map(r => (
                  <div key={r.id} style={{ background: mode.cardBg, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer" }}
                    onClick={() => { setAiRecipe(r); setView("ai-recipe"); }}>
                    <div style={{ width: "100%", height: 140, background: `${mode.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{r.photo ? <img src={r.photo} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => {e.target.parentNode.innerHTML="🍽️"; e.target.parentNode.style.fontSize="36px";}} referrerPolicy="no-referrer" /> : "🍽️"}</div>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(240,235,227,0.9)", marginBottom: 4 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(240,235,227,0.35)", marginBottom: 10 }}>{r.time} · {r.difficulty}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: mode.accent, background: `${mode.accent}18`, padding: "3px 10px", borderRadius: 10 }}>{r.mode || activeMode}</span>
                        <button onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", cursor: "pointer", fontSize: 18 }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </>
  );
}