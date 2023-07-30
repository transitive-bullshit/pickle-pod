<p align="center">
  <a href="https://pickle-pod.vercel.app">
    <img alt="An interactive podcast experience." src="/public/social.jpg">
  </a>
</p>

<p align="center">
  <a href="https://github.com/transitive-bullshit/pickle-pod/actions/workflows/test.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/pickle-pod/actions/workflows/test.yml/badge.svg"></a>
  <a href="https://github.com/transitive-bullshit/pickle-pod/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue"></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg"></a>
</p>

- [Intro](#intro)
- [How it works](#how-it-works)
- [Demo](#demo)
- [Local development](#local-development)
- [Contributions](#contributions)
- [License](#license)

## Intro

[ElevenLabs](https://elevenlabs.io) [hackathon](https://lablab.ai/event/eleven-labs-ai-hackathon) project exploring what an interactive podcast listening experience would where you can pause and ask questions to the host and get answers in real-time.

## How it works

- [Assembly AI](https://www.assemblyai.com) is used for real-time speech-to-text, so users can ask the podcast host questions using their voice.
- [Dexa AI](https://dexa.ai) is used to generate realistic answers to text queries in the style of Lex Fridman, with a custom private RAG API trained on the transcripts across all ~400 episodes of the [Lex Fridman Podcast](https://lexfridman.com/podcast/).
  - Dexa uses Pinecone hybrid search to retrieve the most relevant podcast chunks, applies cross-validation and re-ranking to ensure we only take into account transcript chunks that are relevant to the question, uses RAG + GPT-4 to generate an answer in the style of Lex Fridman, and then applies a post-processing step to minimize hallucination.
- [ElevenLabs](https://elevenlabs.io) is used for text-to-speech to convert the resulting answer to audio using a custom voice trained on ~7 minutes of Lex Fridman's voice.

## Demo

[Demo](https://pickle-pod.vercel.app)

Note, we may keep this running for a while but we will shut it down if it becomes expensive for us. Sowwy. But you should be able to run it on your own with the instructions specified under "Build Locally" section.

## Local development

0. [Install `pnpm`](https://pnpm.io/installation)
1. Run `pnpm i` to install dependencies
2. `cp .env.example .env` and fill in all of the environment variables:

```
ELEVEN_LABS_API_KEY=''
ASSEMBLY_AI_API_KEY=''
DEXA_API_BASE_URL=''

AWS_ACCESS_KEY_ID=''
AWS_SECRET_ACCESS_KEY=''
AWS_REGION=''
AWS_S3_BUCKET=''

GOOGLE_API_KEY=''
```

3. Run `pnpm dev`

## Contributions

PRs are more than welcome.

1. Currently we only support the "Lex Fridman Podcast" since we have eleven labs' voice trained only on him. You can help us support more users. [hint, more female speakers!!]
2. Currently only YouTube URLs are supported. Help us support more Podcast/audio type URLs.
3. Add some way to store Q/A, timestamp, clip info in a database of some sort
4. A way for users to view other people's Q/As on the audio, we are thinking that it should kinda look like SoundCloud's Audio Waveform. See [this](https://i.stack.imgur.com/MXAzC.png)

## License

MIT © [Sasha Sheng](https://twitter.com/hackgoofer) and [Travis Fischer](https://twitter.com/transitive_bs)
