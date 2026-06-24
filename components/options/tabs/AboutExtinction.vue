<template>
  <div class="flex flex-col gap-8 xl:max-w-1/2">
    <section class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold">About Extinction</h1>
      <p>
        Extinction is an ultra-lightweight AI content blocker browser extension
        powered by regex-based pattern matching and linguistic analysis.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold">Why Block AI?</h2>
      <p>
        The World Wide Web is becoming increasingly plagued with low-quality
        AI-generated content. The content AI produces is often misleading or
        blatantly incorrect. While some may not particularly see this is an
        issue, many people wish to escape from or completely hide such content.
      </p>
      <p>
        We, the maintainers of Extinction, aim to promote a creative, more
        trustworthy form of the incredible tool humans call the Internet,
        liberated from the hands of slop. Extinction is made specifically for
        the purpose of discouraging the consumption of AI-produced material
        distributed online.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">What Makes Extinction Different?</h2>
      <p>
        Traditional AI content detectors rely on machine learning and heavy
        analysis to product a result. Besides the irony of using such a
        mechanism, these AI detectors are often less trustworthy when it comes
        to respecting user privacy. Since the content is fed into an external
        API, users cannot reliably confirm that the data they send is kept
        confidential.
      </p>
      <p>
        Even beyond the privacy aspect, these tools are
        <a href="https://link.springer.com/article/10.1007/s40979-026-00213-1"
          >surprisingly inaccurate</a
        >. Hence, a well-tuned AI content blocker based on mere pattern-matching
        and simple structure analysis has the potential to outperform or, at
        least, be on par with machine-based AI detectors in terms of accuracy.
      </p>
      <p>
        Extinction does not send any data to an external endpoint; all analyses
        are done locally, meaning there is no compromise in user privacy. It
        does not use machine-learning to classify text, but rather simple
        pattern matching with regular expressions (regexes) paired with sentence
        variation analyses.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-bold">How Foolproof is Extinction?</h2>
      <p>
        Extinction is not 100% accurate, just like any other AI detection tool.
        However, in many cases, it appears to be nearly as accurate as
        traditional tools in correctly identifying human-written and
        AI-generated text. In rare situations, it may even perform better than
        certain detection tools.
      </p>
      <p>
        Since Extinction is based on a very simple and lightweight detection
        mechanism, it will occasionally produce false positives and false
        negatives. For this reason, Extinction has a "trusted sites" feature,
        which can be used to exclude certain pages or domains from scans.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold">License</h2>
      <p>
        Extinction is free and open-source software distributed under the terms
        of the
        <a href="https://www.gnu.org/licenses/gpl-3.0.html"
          >GNU General Public License version 3.0 or later</a
        >. You are free to use, modify, and share this extension.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
