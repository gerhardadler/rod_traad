export function drawEmail() {
  // Draw contact email
  const user = "gerhard";
  const domain = "rodtraad.no";
  const contactEmail = document.querySelector("#contact-email");
  contactEmail.href = `mailto:${user}@${domain}`;
  contactEmail.innerHTML += `${user}@${domain}`;
}
