export async function share(el, shareData) {
  const tooltip = el.querySelector(".tooltip");

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error("Error when sharing:", err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareData.text + " " + shareData.url);

      // Show tooltip
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";

      // Hide after 2 seconds
      setTimeout(() => {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
      }, 2000);
    } catch (err) {
      console.error("Kunne ikke kopiere lenken:", err);
    }
  }
}

export function getGuessesEmojis(guesses, solutions) {
  const emojiRows = [];
  for (const guess of guesses) {
    const emojis = [];
    guess.words.map((word) => {
      const solutionIndex = Object.values(solutions).findIndex(
        (solutionWords) => solutionWords.includes(word)
      );
      switch (solutionIndex) {
        case 0:
          emojis.push("🟩");
          break;
        case 1:
          emojis.push("🟦");
          break;
        case 2:
          emojis.push("🟪");
          break;
        case 3:
          emojis.push("🟥");
          break;
      }
    });
    emojiRows.push(emojis.join(""));
  }
  return emojiRows.join("\n");
}

export function shareGameResult(el, guesses, solutions) {
  const shareData = {
    title: "Rod tråd",
    text: "",
    url: "https://rodtraad.no",
  };

  if (guesses.filter((g) => g.correct).length >= 4) {
    shareData.text = "Jeg vant i Rød Tråd!\n";
  } else if (guesses.length >= 4) {
    shareData.text = "Jeg tapte i Rød Tråd...\n";
  }
  shareData.text += `${getGuessesEmojis(guesses, solutions)}\n`;
  shareData.text += `Prøv selv:`; // url is automatically appended

  return share(el, shareData);
}

export function sharePage(el) {
  const shareData = {
    title: "Rød Tråd",
    text: "Sjekk ut Rød Tråd!",
    url: "https://rodtraad.no",
  };

  return share(el, shareData);
}
