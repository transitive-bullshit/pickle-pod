# Pickle Pod

Interactive Podcast Experience Powered by ElevenLabs & Dexa

## Build locally

0. Install `pnpm`, please follow [link](https://pnpm.io/installation)
1. Run `pnpm i` to install dependencies
2. Add your own API keys to `.env` file, ours are with the following format:
```
ELEVEN_LABS_API_KEY='xxxxx'
ASSEMBLY_AI_API_KEY='yyyy'
DEXA_API_BASE_URL='dexabase'
AWS_ACCESS_KEY_ID='ttttt'
AWS_SECRET_ACCESS_KEY='bbbbb'
AWS_REGION='gggg'
AWS_S3_BUCKET='eeee'
GOOGLE_API_KEY='ddddd'
```
3. run `pnpm dev` locally

## Alternatively, you can play the Demo here

[Link](https://pickle-pod.vercel.app/)

Note, we may keep this running for a while but we will shut it down if it becomes expensive for us. Sowwy. But you should be able to run it on your own with the instructions specified under "Build Locally" section.

## Contribution
Pull requests are more than welcome.
  1. Currently we only support "Lex Fridman" since we have eleven labs' voice trained only on him. You can help us support more users. [hint, more female speakers!!]
  2. Currently only Youtube URLs are supported. Help us support more Podcast/audio type URLs.
  3. Add some way to store Q/A, timestamp, clip info in a database of some sort
  4. A way for users to view other people's Q/As on the audio, we are thinking that it should kinda look like SoundCloud's Audio Waveform. See [this](https://i.stack.imgur.com/MXAzC.png)