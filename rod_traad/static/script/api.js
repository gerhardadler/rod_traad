export async function updateGameSession(gameSessionId, gameSession) {
  return fetch(`/api/game-session/?game_session_id=${gameSessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gameSession),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to update game session today");
    }
    return response.json();
  });
}
