function normalizeEmotions(raw) {
  if (!raw || !raw.length || !Array.isArray(raw[0])) {
    console.error("⚠️ No valid data returned from Hugging Face.");
    return [];
  }

  const scoresArray = raw[0];

  const total = scoresArray.reduce((sum, item) => sum + item.score, 0);
  return scoresArray.map((item) => ({
    label: item.label,
    percent: parseFloat(((item.score / total) * 100).toFixed(1)),
  }));
}

module.exports = { normalizeEmotions };
