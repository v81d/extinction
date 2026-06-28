/*
 * THIS CLASSIFICATION MECHANISM IS A HEURISTIC!
 *
 * This means that the technique used to flag AI-generated articles is NOT perfectly accurate! The goal is only to find a potential solution that is "good enough" for our purposes.
 * See: https://en.wikipedia.org/wiki/Heuristic
 */

import patterns from "@/assets/patterns.json";

/** A base/template for pattern interfaces. */
interface PatternBase {
  /** The score or weight of the rule. */
  score: number;
}

/** A raw, uncompiled detection pattern with an associated score value. */
export interface RawPattern extends PatternBase {
  /** The string representation of the regular expression to match the rule. */
  regex: string;
}

/** A compiled detection pattern with an associated score value. */
export interface CompiledPattern extends PatternBase {
  /** The compiled regular expression to match the rule. */
  regex: RegExp;
}

export type MatchMap = Map<number, number>;

/** A text classifier analysis result. */
export interface TextClassifierAnalysis {
  /**
   * The accumulated pattern signal from the matches.
   * It is essentially a weighted summary of how strongly the text hits the rule set.
   */
  alpha: number;
  /**
   * The style or fluency signal from the text.
   * It acts as a heuristic (approximation) for how natural-sounding the text appears.
   * A higher fluency score means the text is less robotic and is more probably human.
   */
  fluencyScore: number;
}

/** The array of patterns with each regular expression compiled. */
const compiledPatterns: CompiledPattern[] = (patterns as RawPattern[]).map(
  ({ score, regex }) => ({
    score,
    regex: new RegExp(regex, "gimus"),
  }),
);

/** A model for classifying and scoring text. */
export class TextClassifier {
  chunkSize: number;
  wLex: number;
  wBurst: number;

  constructor(chunkSize: number, wLex: number, wBurst: number) {
    this.chunkSize = chunkSize;
    this.wLex = wLex;
    this.wBurst = wBurst;
  }

  /** Calculate statistics for a text corpus. */
  analyze(corpus: string, alphaScale: number): TextClassifierAnalysis {
    let alpha: number = 0;

    let diversitySum: number = 0;
    let windowCount: number = 0;

    const size: number = corpus.length;
    const step: number = this.chunkSize;

    // iterate over chunks
    for (let i = 0; i < size; i += step) {
      const chunk: string = corpus.slice(i, i + this.chunkSize);

      // add signals to match map
      for (const pattern of compiledPatterns) {
        const count = (chunk.match(pattern.regex) ?? []).length;
        if (count > 0) {
          // saturate rule to limit the effects of repetition
          const signal = pattern.score * Math.min(3, Math.sqrt(count));
          alpha += signal ** alphaScale;
        }
      }

      const chunkTokens = chunk.toLowerCase().match(/\b\w+\b/g) || [];

      if (chunkTokens.length > 0) {
        /**
         * TTR stands for Type-Token Ratio.
         * It is equal to the ratio of unique words to the total number of words in a corpus.
         * A higher TTR means greater lexical diversity, which makes the text sound more natural.
         */
        const ttr = new Set(chunkTokens).size / chunkTokens.length;
        diversitySum += ttr;
        windowCount++;
      }
    }

    const lexicalDiversity = windowCount > 0 ? diversitySum / windowCount : 0;

    // analyze sentence variation/burstiness as extra scan factor
    const sentences: string[] = corpus.split(/(?<=[.!?])\s+/);
    const sentenceLengths = sentences.map(
      (s) => s.match(/\b\w+\b/g)?.length ?? 0,
    );
    const meanSentenceLength: number =
      sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance: number =
      sentenceLengths.reduce((a, b) => a + (b - meanSentenceLength) ** 2, 0) /
      sentenceLengths.length; // average sentence length variance
    const burstiness =
      meanSentenceLength > 0
        ? Math.sqrt(variance) / (meanSentenceLength + 1)
        : 0;

    const fluencyScore =
      (lexicalDiversity * this.wLex +
        (1 - Math.min(burstiness, 2) / 2) * this.wBurst) /
      (this.wLex + this.wBurst);

    return {
      alpha,
      fluencyScore,
    };
  }

  /**
   * Normalize the accumulated classification signals into a score between 0 and 1.
   *
   * The alpha (accumulated signal) is normalized by the length of the text to reduce bias toward longer documents (since they will naturally contain more signals).
   * The normalized alpha is then reduced by half the fluency score.
   *
   * The full mathematical model for this is:
   *
   * `1 / (1 + e^(-(alpha / sqrt(corpusLength) - threshold - 0.5 * fluencyScore)))`,
   *
   * where:
   * - `alpha` controls how strongly the pattern matches influence the result.
   * - `corpusLength` prevents longer texts from being over-penalized or over-rewarded.
   * - `fluencyScore` reduces the final score for the text having more natural variation.
   * - `adjustmentThreshold` defines how much evidence is required before the score starts rising quickly (default: 2.5).
   *
   * This uses a sigmoid function.
   * See: https://en.wikipedia.org/wiki/Sigmoid_function
   *
   * The result is intended to stay between 0 and 1, as long as the inputs are valid.
   */
  normalizeScore(
    corpusLength: number,
    alpha: number,
    fluencyScore: number,
    adjustmentThreshold: number,
  ): number {
    const normalizedAlpha: number = alpha / Math.sqrt(corpusLength); // longer texts naturally accumulate more evidence, so we have to normalize the alpha
    const adjustedAlpha: number =
      normalizedAlpha - adjustmentThreshold - 0.5 * fluencyScore; // fluency should slightly offset the score
    return 1 / (1 + Math.exp(-adjustedAlpha));
  }
}
