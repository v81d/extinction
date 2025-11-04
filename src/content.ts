import TextClassifier from "./utils/textClassifier";

const textClassifier = new TextClassifier(1024);

window.onload = () => {
  const corpus: string = document.body.innerText;
  const [matchMap, alpha]: [Record<number, number>, number] =
    textClassifier.analyze(corpus);
  const score: number = textClassifier.calculateScore(matchMap);
  const normalizedScore: number = textClassifier.normalizeScore(
    corpus,
    score,
    alpha,
    1.75,
  );

  if (normalizedScore > 0.5) {
    alert(
      `This page may contain a considerable amount of AI-generated text. The normalized score is ${(normalizedScore * 100).toFixed(2)}%.`,
    );
  }
};
