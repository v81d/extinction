import TextClassifier from "@/utils/textClassifier";
import { Readability } from "@mozilla/readability";
import { setData, getData } from "@/utils/storage";

const chunkSize: number = 1024;
const wLex: number = 0.7;
const wBurst: number = 0.7;
const threshold: number = 0.5;

const textClassifier: TextClassifier = new TextClassifier(
  chunkSize,
  wLex,
  wBurst,
);

async function scanDocument() {
  const article = new Readability(document.cloneNode(true) as Document).parse();

  /* Should return an object with the following properties (https://github.com/mozilla/readability):
   *
   *   - `title`: article title
   *   - `content`: HTML string of processed article content
   *   - `textContent`: text content of the article, with all the HTML tags removed
   *   - `length`: length of an article, in characters
   *   - `excerpt`: article description, or short excerpt from the content
   *   - `byline`: author metadata
   *   - `dir`: content direction
   *   - `siteName`: name of the site
   *   - `lang`: content language
   *   - `publishedTime`: published time
   *
   * For our intents, only `title` and `textContent` should be fed into the analyzer.
   */

  if (article) {
    const corpus: string = (
      article.title +
      "\n\n" +
      article.textContent
    ).trim();

    console.group(
      "%cCorpus Scan Status\n%cfrom %cExtinction",
      "font-size: 2em;",
      "font-size: 1em; color: gray;",
      "font-style: italic;",
    );

    const currentDomain: string | null = window.location.hostname;
    let exceptionsList: string[] | null = await getData("exceptionsList");

    if (!exceptionsList) {
      exceptionsList = [];
      await setData("exceptionsList", exceptionsList);
    }

    if (exceptionsList.includes(currentDomain)) {
      console.log(
        "This domain has been whitelisted. No scan will be initiated.",
      );
      console.groupEnd();
      return;
    }

    if (
      exceptionsList.includes(
        window.location.hostname + window.location.pathname,
      )
    ) {
      console.log("This page has been whitelisted. No scan will be initiated.");
      console.groupEnd();
      return;
    }

    if (corpus.split(/\s+/).length < 200) {
      browser.runtime.sendMessage({
        type: `SET_CLASSIFIER_SCORE_${currentDomain}`,
        value: "ARTICLE_TOO_SHORT",
      });

      console.log(
        "The article is too short to classify accurately. No scan will be initiated.",
      );
      console.groupEnd();

      return;
    }

    const [matchMap, alpha, linguisticScore]: [
      Record<number, number>,
      number,
      number,
    ] = textClassifier.analyze(corpus);
    const patternScore: number = textClassifier.calculatePatternScore(matchMap);
    const normalizedScore: number = textClassifier.normalizeScore(
      corpus.length,
      patternScore,
      alpha,
      linguisticScore,
      2.25,
    );
    const exceededThreshold: boolean = normalizedScore > threshold;

    browser.runtime.sendMessage({
      type: `SET_CLASSIFIER_SCORE_${currentDomain}`,
      value: normalizedScore,
    });

    const results = [
      { Metric: "Corpus Size", Value: `${corpus.length} chars` },
      { Metric: "Match Map", Value: matchMap },
      { Metric: "Unscaled Alpha", Value: alpha },
      { Metric: "Raw Pattern Score", Value: patternScore },
      { Metric: "Raw Linguistic Score", Value: linguisticScore },
      {
        Metric: "Normalized Score",
        Value: normalizedScore,
      },
    ];

    console.table(results);
    console.groupEnd();

    if (exceededThreshold) showDetectionAlert(normalizedScore);
  }
}

// This function creates the warning alert and injects it onto the page
function showDetectionAlert(confidence: number) {
  const originalBodyOverflow: string = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const background: HTMLDivElement = document.createElement("div");
  background.style.cssText = `
    all: initial;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2147483647;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(24px);
  `;
  document.body.appendChild(background);

  const alertBox: HTMLDivElement = document.createElement("div");
  alertBox.style.cssText = `
    all: initial;
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-sizing: border-box;
    max-width: 800px;
    margin: 0;
    padding: 40px;
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    border: none;
    border-radius: 24px;
    background-color: #212b4f;
    color: #aab9ed;
  `;
  background.appendChild(alertBox);

  const label: HTMLParagraphElement = document.createElement("p");
  label.style.cssText = `
    all: initial;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.5;
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    color: #aab9ed;
  `;
  label.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
      fill="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;">
      <path d="M11 9h2v6h-2zm0 8h2v2h-2z"></path><path d="M12.87 2.51c-.35-.63-1.4-.63-1.75 0l-9.99 18c-.17.31-.17.69.01.99.18.31.51.49.86.49h20c.35 0 .68-.19.86-.49a1 1 0 0 0 .01-.99zM3.7 20 12 5.06 20.3 20z"></path>
    </svg>
    Potential AI Content
  `;
  alertBox.appendChild(label);

  const message: HTMLDivElement = document.createElement("div");
  message.style.cssText = `
    all: initial;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    font-size: 20px;
    line-height: 1.5;
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    color: #aab9ed;
  `;
  message.innerHTML = `
    <p style="margin-bottom: 20px;">
      We are
      <strong>${(confidence * 100).toFixed(2)}%</strong>
      confident this page contains AI-written content. You can choose to return or proceed anyway. Make sure to verify any important information.
    </p>
    <p style="margin: 0;">
      If you believe this detection is inaccurate, you can
      <strong>exclude</strong>
      this page or domain from future scans in the
      <strong>Extinction menu</strong>.
    </p>
  `;
  alertBox.appendChild(message);

  const buttonContainer: HTMLDivElement = document.createElement("div");
  buttonContainer.style.cssText = `
    display: flex;
    gap: 16px;
  `;
  alertBox.appendChild(buttonContainer);

  const buttonStyles: string = `
    all: initial;
    cursor: pointer;
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 12px 16px;
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    border: none;
    border-radius: 24px;
  `;

  const proceedButton: HTMLButtonElement = document.createElement("button");
  proceedButton.textContent = "Proceed Anyway";
  proceedButton.style.cssText = `
    ${buttonStyles}
    background-color: #4d5c91;
    color: #aab9ed;
  `;
  proceedButton.onmouseenter = () =>
    (proceedButton.style.backgroundColor = "#6373a8");
  proceedButton.onmouseleave = () =>
    (proceedButton.style.backgroundColor = "#4d5c91");
  proceedButton.onclick = () => {
    document.body.style.overflow = originalBodyOverflow;
    background.remove();
  };
  buttonContainer.appendChild(proceedButton);

  const returnButton: HTMLButtonElement = document.createElement("button");
  returnButton.textContent = "Go Back";
  returnButton.style.cssText = `
    ${buttonStyles}
    background-color: #8997c4;
    color: #212b4f;
  `;
  returnButton.onmouseenter = () =>
    (returnButton.style.backgroundColor = "#9ca9d3");
  returnButton.onmouseleave = () =>
    (returnButton.style.backgroundColor = "#8997c4");
  returnButton.onclick = () => window.history.back();
  buttonContainer.appendChild(returnButton);
}

document.addEventListener("DOMContentLoaded", () => {
  scanDocument();
});
