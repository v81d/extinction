import { Readability } from "@mozilla/readability";
import { setData, getData } from "@/utils/storage";
import { TextClassifierAnalysis, TextClassifier } from "@/utils/textClassifier";

/* The size of each text chunk used by the classifier. */
const CHUNK_SIZE = 1024;
/* The weight applied to lexical features. */
const W_LEX = 0.7;
/* The weight applied to burstiness features. */
const W_BURST = 0.7;
/* The threshold above which the detector triggers an alert. */
const THRESHOLD = 0.5;
/* The exponent used to scale the alpha during normalization. */
const SCALE = 2.25;

const textClassifier = new TextClassifier(CHUNK_SIZE, W_LEX, W_BURST);

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  main(ctx) {
    /** Scan the document and, if the resulting score exceeds the threshold, show an alert. */
    const scanDocument = async () => {
      /**
       * Should return an object with the following properties (https://github.com/mozilla/readability):
       * - `title`: article title
       * - `content`: HTML string of processed article content
       * - `textContent`: text content of the article, with all the HTML tags removed
       * - `length`: length of an article, in characters
       * - `excerpt`: article description, or short excerpt from the content
       * - `byline`: author metadata
       * - `dir`: content direction
       * - `siteName`: name of the site
       * - `lang`: content language
       * - `publishedTime`: published time
       *
       * For our intents, only `title` and `textContent` should be fed into the analyzer.
       */
      const article = new Readability(
        document.cloneNode(true) as Document,
      ).parse();

      if (article) {
        const corpus: string = (
          article.title +
          "\n\n" +
          article.textContent
        ).trim();

        console.group(
          "%cArticle Scan Status\n%cfrom %cExtinction",
          "font-size: 2rem;",
          "font-size: 1rem; color: gray;",
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
          console.log(
            "This page has been whitelisted. No scan will be initiated.",
          );
          console.groupEnd();
          return;
        }

        if (corpus.split(/\s+/).length < 200) {
          await browser.runtime.sendMessage({
            type: `SET_CLASSIFIER_SCORE_${currentDomain}`,
            value: "ARTICLE_TOO_SHORT",
          });

          console.log(
            "The article is too short to classify accurately. No scan will be initiated.",
          );
          console.groupEnd();

          return;
        }

        const analysis: TextClassifierAnalysis = textClassifier.analyze(corpus);
        const patternScore: number = textClassifier.calculatePatternScore(
          analysis.matchMap,
        );
        const normalizedScore: number = textClassifier.normalizeScore(
          corpus.length,
          patternScore,
          analysis.alpha,
          analysis.fluencyScore,
          SCALE,
        );
        const exceeded: boolean = normalizedScore > THRESHOLD;

        await browser.runtime.sendMessage({
          type: `SET_CLASSIFIER_SCORE_${currentDomain}`,
          value: normalizedScore,
        });

        const results = [
          { Metric: "Corpus Size", Value: `${corpus.length} chars` },
          { Metric: "Match Map", Value: analysis.matchMap },
          { Metric: "Unscaled Alpha", Value: analysis.alpha },
          { Metric: "Raw Pattern Score", Value: patternScore },
          { Metric: "Raw Linguistic Score", Value: analysis.fluencyScore },
          {
            Metric: "Normalized Score",
            Value: normalizedScore,
          },
        ];

        console.table(results);
        console.groupEnd();

        if (exceeded) showDetectionAlert(normalizedScore);
      }
    };

    /** Create the warning alert and injects it onto the page. */
    function showDetectionAlert(score: number) {
      const originalBodyOverflow: string = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const wrapper: HTMLDivElement = document.createElement("div");
      wrapper.style.all = "unset";
      wrapper.style.position = "fixed";
      wrapper.style.top = "0";
      wrapper.style.left = "0";
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      wrapper.style.zIndex = "2147483647";
      wrapper.style.lineHeight = "1.5";
      wrapper.style.fontFamily =
        "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

      const shadow = wrapper.attachShadow({ mode: "closed" });
      document.body.appendChild(wrapper);

      const background: HTMLDivElement = document.createElement("div");
      background.style.position = "fixed";
      background.style.display = "flex";
      background.style.justifyContent = "center";
      background.style.alignItems = "center";
      background.style.width = "100%";
      background.style.height = "100%";
      background.style.top = "0";
      background.style.left = "0";
      background.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
      background.style.backdropFilter = "blur(36px)";
      shadow.appendChild(background);

      const alertBox: HTMLDivElement = document.createElement("div");
      alertBox.style.position = "fixed";
      alertBox.style.display = "flex";
      alertBox.style.flexDirection = "column";
      alertBox.style.justifyContent = "center";
      alertBox.style.gap = "24px";
      alertBox.style.boxSizing = "border-box";
      alertBox.style.width = "800px";
      alertBox.style.margin = "0";
      alertBox.style.padding = "40px";
      alertBox.style.borderRadius = "24px";
      alertBox.style.backgroundColor = "#212b4f";
      alertBox.style.color = "#aab9ed";
      background.appendChild(alertBox);

      const label: HTMLParagraphElement = document.createElement("p");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "8px";
      label.style.margin = "0";
      label.style.padding = "0";
      label.style.fontSize = "24px";
      label.style.fontWeight = "600";
      label.style.color = "#aab9ed";

      const svgns = "http://www.w3.org/2000/svg";
      const icon = document.createElementNS(svgns, "svg");
      icon.setAttribute("width", "24");
      icon.setAttribute("height", "24");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("fill", "none");
      icon.setAttribute("stroke", "currentColor");
      icon.setAttribute("stroke-width", "2");
      icon.setAttribute("stroke-linecap", "round");
      icon.setAttribute("stroke-linejoin", "round");
      icon.style.flexShrink = "0";

      const path1 = document.createElementNS(svgns, "path");
      path1.setAttribute(
        "d",
        "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      );

      const path2 = document.createElementNS(svgns, "path");
      path2.setAttribute("d", "M12 8v4");

      const path3 = document.createElementNS(svgns, "path");
      path3.setAttribute("d", "M12 16h.01");

      icon.appendChild(path1);
      icon.appendChild(path2);
      icon.appendChild(path3);
      label.appendChild(icon);

      const labelText: HTMLSpanElement = document.createElement("span");
      labelText.textContent = "Potential AI Content";
      label.appendChild(labelText);

      alertBox.appendChild(label);

      const message: HTMLDivElement = document.createElement("div");
      message.style.display = "flex";
      message.style.flexDirection = "column";
      message.style.gap = "20px";
      message.style.margin = "0";
      message.style.padding = "0";
      message.style.fontSize = "20px";
      message.style.color = "#aab9ed";

      const p1: HTMLParagraphElement = document.createElement("p");
      p1.style.margin = "0";
      p1.append("We are ");

      const confidenceStrong: HTMLElement = document.createElement("strong");
      confidenceStrong.textContent = `${(score * 100).toFixed(2)}%`;
      p1.appendChild(confidenceStrong);
      p1.append(
        " confident this page contains machine-generated content. You can choose to return or proceed anyway. Make sure to verify any important information.",
      );

      const p2: HTMLParagraphElement = document.createElement("p");
      p2.style.margin = "0";
      p2.append("If you believe this detection is inaccurate, you can ");

      const excludeStrong: HTMLElement = document.createElement("strong");
      excludeStrong.textContent = "exclude";
      p2.appendChild(excludeStrong);
      p2.append(" this page or domain from future scans in the ");

      const menuStrong: HTMLElement = document.createElement("strong");
      menuStrong.textContent = "Extinction menu";
      p2.appendChild(menuStrong);
      p2.append(".");

      message.appendChild(p1);
      message.appendChild(p2);
      alertBox.appendChild(message);

      const buttonContainer: HTMLDivElement = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.gap = "16px";
      alertBox.appendChild(buttonContainer);

      const applyButtonStyles = (button: HTMLButtonElement) => {
        button.style.cursor = "pointer";
        button.style.display = "block";
        button.style.flex = "1";
        button.style.boxSizing = "border-box";
        button.style.width = "100%";
        button.style.padding = "12px 48px";
        button.style.fontFamily =
          'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
        button.style.fontSize = "20px";
        button.style.fontWeight = "600";
        button.style.textAlign = "center";
        button.style.border = "none";
        button.style.borderRadius = "12px";
      };

      const proceedButton: HTMLButtonElement = document.createElement("button");
      proceedButton.textContent = "Proceed Anyway";
      applyButtonStyles(proceedButton);
      proceedButton.style.backgroundColor = "#4d5c91";
      proceedButton.style.color = "#aab9ed";
      proceedButton.addEventListener("click", () => {
        document.body.style.overflow = originalBodyOverflow;
        wrapper.remove();
      });
      buttonContainer.appendChild(proceedButton);

      const returnButton: HTMLButtonElement = document.createElement("button");
      returnButton.textContent = "Go Back";
      applyButtonStyles(returnButton);
      returnButton.style.backgroundColor = "#8997c4";
      returnButton.style.color = "#212b4f";
      returnButton.addEventListener("click", () => window.history.back());
      buttonContainer.appendChild(returnButton);

      function adjustAlertSizing() {
        const narrow = window.innerWidth <= 850;
        const short = window.innerHeight <= 550;

        if (narrow || short) {
          alertBox.style.width = "100%";
          alertBox.style.height = "100%";
          alertBox.style.borderRadius = "0";
          if (narrow) buttonContainer.style.flexDirection = "column";
          else buttonContainer.style.flexDirection = "row";
        } else {
          alertBox.style.width = "800px";
          alertBox.style.height = "auto";
          alertBox.style.borderRadius = "12px";
          buttonContainer.style.flexDirection = "row";
        }
      }

      adjustAlertSizing();
      window.addEventListener("resize", adjustAlertSizing);
    }

    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    )
      scanDocument();
    else
      document.addEventListener("DOMContentLoaded", scanDocument, {
        once: true,
      });

    ctx.addEventListener(window, "wxt:locationchange", scanDocument);
  },
});
