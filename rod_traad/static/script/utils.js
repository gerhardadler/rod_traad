export function areArraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length && arr1.every((word) => arr2.includes(word))
  );
}

export function ensureShuffle(arr) {
  let originalOrder = [...arr];

  // Keep shuffling until a change occurs
  do {
    arr.sort(() => Math.random() - 0.5);
  } while (arr.every((word, i) => word === originalOrder[i]));
}

export function animateElement(
  el,
  name,
  duration,
  easing = "ease",
  fillMode = "forwards"
) {
  return new Promise((resolve) => {
    const animationString = `${name} ${duration}ms ${easing} ${fillMode}`;

    // Allow multiple animations by appending
    const prev = el.style.animation ? el.style.animation + ", " : "";
    el.style.animation = prev + animationString;

    // reflow
    void el.offsetHeight; // Trigger reflow to apply the new animation

    setTimeout(() => {
      // Optional: Clean up animation
      el.style.animation = el.style.animation
        .split(",")
        .filter((anim) => !anim.includes(name))
        .join(",")
        .trim();
      resolve();
    }, duration);
  });
}
