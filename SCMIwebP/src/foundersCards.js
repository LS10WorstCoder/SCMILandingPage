// Flippable founders cards
const cards = document.querySelectorAll('.founder-flip-card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});
