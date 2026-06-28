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
  /** The match dictionary mapping unique scores to the number of matches for each score. */
  matchMap: MatchMap;
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

  /** Create a match map and calculate statistics for a text corpus. */
  analyze(corpus: string): TextClassifierAnalysis {
    const matchMap: MatchMap = new Map<number, number>();
    let alpha: number = 0;

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
          const signal: number = 1 - Math.exp(-count);
          alpha += signal * pattern.score;

          matchMap.set(
            pattern.score,
            (matchMap.get(pattern.score) ?? 0) + count,
          );
        }
      }
    }

    const tokens: string[] = corpus.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueTokens: Set<string> = new Set(tokens);
    const lexicalDiversity = uniqueTokens.size / tokens.length;

    // analyze sentence variation/burstiness as extra scan factor
    const sentences: string[] = corpus.split(/(?<=[.!?])\s+/);
    const sentenceLengths: number[] = sentences.map(
      (s) => s.split(/\b\w+\b/).length,
    );
    const meanSentenceLength: number =
      sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance: number =
      sentenceLengths.reduce((a, b) => a + (b - meanSentenceLength) ** 2, 0) /
      sentenceLengths.length; // average sentence length variance
    const burstiness: number = Math.sqrt(variance) / meanSentenceLength;

    const fluencyScore: number =
      lexicalDiversity * this.wLex +
      (1 - Math.min(burstiness, 2) / 2) * this.wBurst;

    return {
      matchMap,
      alpha,
      fluencyScore,
    };
  }

  /** Calculate the sum of all scores multiplied by their counts. */
  calculatePatternScore(matchMap: Map<number, number>): number {
    let total: number = 0;
    for (const [score, count] of matchMap) total += score * count;
    return total;
  }

  /**
   * Normalize the score between 0 and 1.
   *
   * The mathematical model for this is:
   *
   * `1 - e^((-|alpha|^scale * patternScore^fluencyScore) / corpusLength)`,
   *
   * where:
   * - `alpha` controls how strongly the pattern matches influence the result.
   * - `scale` increases or decreases the effect of `alpha`.
   * - `patternScore` is the weighted total from matched rules (determined using `calculatePatternScore()`).
   * - `fluencyScore` adjusts the impact based on writing style.
   * - `corpusLength` prevents longer texts from being over-penalized or over-rewarded.
   *
   * A larger `alpha` makes the score move faster toward 1, a larger `patternScore` increases the final score, and a larger `corpusLength` reduces the effect of the same evidence
   * These values should all be fine-tuned.
   *
   * The result is intended to stay between 0 and 1, as long as the inputs are valid.
   */
  normalizeScore(
    corpusLength: number,
    patternScore: number,
    alpha: number,
    fluencyScore: number,
    scale: number,
  ): number {
    const scaledAlpha: number = Math.abs(alpha) ** scale;
    return (
      1 - Math.exp((-scaledAlpha * patternScore ** fluencyScore) / corpusLength)
    );
  }
}
