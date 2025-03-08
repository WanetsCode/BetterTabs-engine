document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("findOldest").addEventListener("click", () => {
        window.FindOldest();
    });
    document.getElementById("autoSortButton").addEventListener("click", () => {
        window.autoSortFunction();
    });
    document.getElementById("transferButton").addEventListener("click", () => {
        window.transferFunction();
    });
    document.getElementById("importButton").addEventListener("click", () => {
        window.importFunction();
    });
    document.getElementById("githubDocsButton").addEventListener("click", () => {
        window.open("https://github.com/WanetsCode/BetterTabs-engine", "_blank", "noopener");
    });
    document.getElementById("apiButton").addEventListener("click", () => {
        window.apiFunction();
    });
});
