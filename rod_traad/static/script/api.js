export function updateGameSessionToday(guesses) {
  return fetch("/api/game-session/today", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      guesses: guesses,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to update game session today");
    }
    return response.json();
  });
}
