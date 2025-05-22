export function areArraysEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length && arr1.every((word) => arr2.includes(word))
  );
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

    const handle = (e) => {
      if (e.animationName === name) {
        el.removeEventListener("animationend", handle);
        resolve();

        // Optional: Clean up animation
        const animations = el.style.animation
          .split(",")
          .filter((anim) => !anim.includes(name))
          .join(",")
          .trim();

        el.style.animation = animations;
      }
    };

    el.addEventListener("animationend", handle);
  });
}
