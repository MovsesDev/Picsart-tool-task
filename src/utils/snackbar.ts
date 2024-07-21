const snackbarContainer = document.getElementById(
  "snackbar-container"
) as HTMLElement;
const snackbarButton = document.getElementById("copy-btn") as HTMLButtonElement;

let timeoutId: number | undefined;

export function showSnackbar(message: string) {
  navigator.clipboard.writeText(message);

  const existingSnackbar = snackbarContainer.querySelector(
    ".snackbar"
  ) as HTMLElement;
  if (existingSnackbar) {
    existingSnackbar.remove();
    clearTimeout(timeoutId);
  }

  const snackbar = document.createElement("div");
  snackbar.className = "snackbar";
  snackbar.innerHTML = `Copied to clipboard.`;

  snackbarContainer.appendChild(snackbar);

  timeoutId = window.setTimeout(() => {
    snackbar.style.animationName = "fadeOut";
    snackbar.addEventListener("animationend", () => snackbar.remove());
  }, 1000);
}

snackbarButton.addEventListener("click", () => {
  const hexText = document.querySelector(".color-dropper-hex");
  showSnackbar(hexText?.innerHTML ?? "");
});
