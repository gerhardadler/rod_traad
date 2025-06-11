export function updateGameSession(puzzle_id, guesses) {
  return fetch(`/api/game-session/?puzzle_id=${puzzle_id}`, {
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
