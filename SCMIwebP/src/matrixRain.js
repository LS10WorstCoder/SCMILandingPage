// Matrix rain of advanced math symbols
const symbols = [
  // Statistics
  'Σ', 'μ', 'σ', 'ρ', '∑', '∏', 'E', 'P', 'Var', 'Cov',
  // Linear Algebra
  'λ', 'Λ', '∥', '⊤', '⊥', 'det', 'tr', '⋅', '∘', '∈', '∉', '∩', '∪', '⊕', '⊗',
  // Calculus
  '∫', '∂', '∇', '∞', 'dx', 'dy', 'lim', 'Δ', 'ε', '→', '←', '⇌', '≈', '≠', '≤', '≥',
  // Misc
  'ℝ', 'ℤ', 'ℕ', 'ℚ', 'ℂ', '∀', '∃', '∅', '∝', '∴', '∵', '∧', '∨', '¬', '⇒', '⇔', '⊂', '⊃', '⊆', '⊇'
];

const canvas = document.createElement('canvas');
canvas.id = 'matrix-rain';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '0';
canvas.style.pointerEvents = 'none';
canvas.style.opacity = '0.18';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const fontSize = 28;
const columns = Math.floor(width / fontSize);
const drops = Array(columns).fill(1);

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${fontSize}px Courier New, monospace`;
  ctx.fillStyle = '#00ff00';
  for (let i = 0; i < columns; i++) {
    const text = symbols[Math.floor(Math.random() * symbols.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
    if (drops[i] * fontSize > height) {
      drops[i] = 0;
    }
  }
}

setInterval(draw, 55);

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});
