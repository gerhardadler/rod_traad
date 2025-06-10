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
