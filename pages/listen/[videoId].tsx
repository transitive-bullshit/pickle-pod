import * as React from "react";
import cs from "clsx";
import Image from "next/image";
import SeekBar from "react-seekbar-component";
import YouTube, { YouTubeEvent } from "react-youtube";
import type RecordRTCType from "recordrtc";
import { Drawer } from "vaul";

import * as types from "@/lib/types";
import { Button } from "@/components/Button/Button";
import { Layout } from "@/components/Layout/Layout";
import { PageHead } from "@/components/PageHead/PageHead";
import { HelpCircle, Mic, Pause, Play } from "@/icons";
import {
  fetchAssemblyAIRealtimeToken,
  generateDexaAnswerFromLex,
  textToSpeech,
} from "@/lib/api";
import { YoutubeClient } from "@/server/youtube";

import styles from "./styles.module.css";

let recorder: any;
let recordedChunks: any = [];
let socket: any;

function secondsToHms(d) {
  d = Number(d);

  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? (h < 10 ? "0" : "") + h + ":" : "";
  var mDisplay = (m < 10 ? "0" : "") + m + ":";
  var sDisplay = (s < 10 ? "0" : "") + s;

  return hDisplay + mDisplay + sDisplay;
}

export default function ListenPage({ podcast }: { podcast: types.Podcast }) {
  const [playerStatus, setPlayerStatus] = React.useState<number>(-1);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [transcription, setTranscription] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [questionStatus, setQuestionStatus] = React.useState<string>("");
  const [audioUrl, setAudioUrl] = React.useState<string>();
  const [answer, setAnswer] = React.useState<string>();
  const [progress, setProgress] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  const videoPlayer = React.useRef<any>(null);
  const intervalRef = React.useRef<any>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const onPlayerReady = React.useCallback((event: YouTubeEvent) => {
    videoPlayer.current = event.target;
    const duration = videoPlayer.current.getDuration();
    setDuration(duration);
  }, []);

  const onPlayerStateChanged = React.useCallback(() => {
    if (!videoPlayer.current) return;
    const playerState: number = videoPlayer.current.getPlayerState();

    if (playerState === YouTube.PlayerState.PLAYING) {
      intervalRef.current = setInterval(updateProgressBar, 1000); // update every second
      console.log("intervalRef.current", intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }

    console.log(playerState);
    setPlayerStatus(playerState);
  }, []);

  const updateProgressBar = () => {
    const currentTime = videoPlayer.current.getCurrentTime();
    console.log({ currentTime, duration });
    setCurrentTime(currentTime);
    setProgress((currentTime / duration) * 100);
  };

  const onSeek = (value) => {
    const newTime = (value / 100) * videoPlayer.current.getDuration();
    videoPlayer.current.seekTo(newTime);
  };

  const onClickPlayPause = React.useCallback(() => {
    if (!videoPlayer.current) return;

    const playerState: number = videoPlayer.current.getPlayerState();
    if (playerState === 1) {
      videoPlayer.current.pauseVideo();
    } else {
      videoPlayer.current.playVideo();
    }
  }, []);

  const stopRecording = React.useCallback(() => {
    console.log("stop", { socket, recorder, isRecording });
    if (!socket || !recorder || !isRecording) return;

    setIsRecording(false);
    recorder.stopRecording(() => {
      if (!socket) return;

      socket.send(JSON.stringify({ terminate_session: true }));
      socket.close();
      socket = null;

      recorder.destroy();
      recorder = null;
    });

    console.log(recordedChunks);
  }, [isRecording]);

  const finishRecording = React.useCallback(async () => {
    stopRecording();

    if (!transcription || questionStatus !== "recording") {
      return;
    }
    const question = transcription;

    setAnswer("");
    setQuestionStatus("submitting");

    const { answer } = await generateDexaAnswerFromLex(question);
    if (transcription !== question) return;

    setAnswer(answer);
    const { audioUrl } = await textToSpeech(answer);
    if (transcription !== question) return;

    setAudioUrl(audioUrl);
    setQuestionStatus("complete");
  }, [stopRecording, transcription, questionStatus]);

  const onClickAskQuestion = React.useCallback(async () => {
    if (!videoPlayer.current) return;
    setTranscription("");

    videoPlayer.current.pauseVideo();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const RecordRTC = (await import("recordrtc"))
      .default as typeof RecordRTCType;

    const token = await fetchAssemblyAIRealtimeToken();
    setQuestionStatus("recording");

    socket = new WebSocket(
      `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
    );
    const texts = {};

    socket.onmessage = (message: any) => {
      let msg = "";
      const res = JSON.parse(message.data);
      const msgType = res.message_type;

      console.log("socket", res);

      texts[res.audio_start] = res.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a.localeCompare(b));

      for (const key of keys) {
        if (texts[key]) {
          if (msg.split(" ").length > 6) {
            msg = "";
          }
          msg += ` ${texts[key]}`;
        }
      }

      if (msg.endsWith(".")) {
        msg = msg.slice(0, -1) + "?";
      }

      setTranscription(msg);
      console.log("message", msg);

      if (msgType === "FinalTranscript") {
        finishRecording();
      }
    };

    socket.onerror = (event: any) => {
      console.error(event);
      stopRecording();
    };

    socket.onclose = (event: any) => {
      stopRecording();
    };

    socket.onopen = async () => {
      recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm;codecs=pcm",
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: function (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result as string;

            if (socket) {
              socket.send(
                JSON.stringify({
                  audio_data: base64data.split("base64,")[1],
                })
              );
            }
          };

          reader.readAsDataURL(blob);
        },
      });

      recorder.startRecording();
    };

    setIsRecording(true);
    setIsDialogOpen(true);
  }, [stopRecording]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      stopRecording();
      setQuestionStatus("");
    }
  }, [isDialogOpen]);

  return (
    <Layout>
      <PageHead />

      <div className={styles.homePage}>
        <div className={styles.body}>
          {podcast && (
            <div className={cs(styles.section)}>
              <Image
                className={styles.thumbnail}
                src={podcast.thumbnailUrl}
                width={podcast.thumbnailWidth}
                height={podcast.thumbnailheight}
                alt="Youtube Thumbnail"
              />
              <YouTube
                className={styles.video}
                videoId={podcast.youtubeId}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChanged}
                opts={{
                  width: "0",
                  height: "0",
                  playerVars: {
                    autoplay: 0,
                  },
                }}
              />
              <div className={styles.wrapper}>
                <div className={styles.date}>{podcast.publishedAt}</div>
                <h1 className={cs(styles.title)}>{podcast.title}</h1>
              </div>
              <div>
                <SeekBar
                  className="[&>input]:w-full"
                  getNumber={onSeek}
                  backgroundColor="#D3D3D3"
                  fillColor="#7027D3"
                  fillSecondaryColor="blue"
                  headColor="white"
                  headShadow="white"
                  headShadowSize={6}
                  progress={progress}
                />
                <div className="flex justify-between">
                  <text>{secondsToHms(currentTime)}</text>
                  <text>{secondsToHms(duration)}</text>
                </div>
              </div>
              <div className={styles.actions}>
                <Button
                  className={styles.actionButton}
                  onClick={onClickPlayPause}
                  isLoading={playerStatus < 0}
                >
                  {playerStatus !== 1 ? (
                    <Play className={styles.actionIcon} />
                  ) : (
                    <Pause className={styles.actionIcon} />
                  )}
                </Button>

                <Button
                  className={styles.actionButton}
                  onClick={onClickAskQuestion}
                >
                  <HelpCircle className={styles.actionIcon} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isMounted && podcast && (
        <Drawer.Root
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          dismissible
        >
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />

          <Drawer.Portal>
            <Drawer.Content
              className="bg-zinc-100 flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0"
              onEscapeKeyDown={() => setIsDialogOpen(false)}
              onInteractOutside={() => setIsDialogOpen(false)}
              onPointerDownOutside={() => setIsDialogOpen(false)}
            >
              <div className="p-4 bg-white rounded-t-[10px] flex-1">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />

                <div className="flex flex-col max-w-md mx-auto gap-4">
                  {(questionStatus === "recording" || !questionStatus) && (
                    <>
                      <Drawer.Title className="font-medium">
                        Recording, please speak your question for Lex.
                      </Drawer.Title>

                      <p className="text-zinc-600 mb-2">{transcription}</p>

                      <div
                        className={styles.recordButton}
                        onClick={finishRecording}
                      >
                        <Mic
                          className={
                            isRecording ? styles.micIcon : styles.micIconStatic
                          }
                        />
                      </div>
                    </>
                  )}

                  {questionStatus === "submitting" && (
                    <>
                      <Drawer.Title className="font-medium">
                        {transcription}
                      </Drawer.Title>

                      {answer && <p>{answer}</p>}

                      <p>Loading...</p>
                    </>
                  )}

                  {questionStatus === "complete" && (
                    <>
                      <Drawer.Title className="font-medium">
                        {transcription}
                      </Drawer.Title>

                      {answer && <p>{answer}</p>}

                      <audio
                        className="w-full"
                        src={audioUrl}
                        controls
                        autoPlay
                      />
                    </>
                  )}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [
      "/listen/cdiD-9MMpb0",
      "/listen/34wA_bdG6QQ",
      "/listen/gk4tEO4jDUM",
      "/listen/DxREm3s1scA",
      "/listen/4dC_nRYIDZU",
      "/listen/Ff4fRgnuFgQ",
    ],
    fallback: true,
  };
}

export const getStaticProps = async (context) => {
  const youtubeId = context.params?.videoId as string;
  if (!youtubeId) {
    return {
      notFound: true,
    };
  }

  try {
    const youtube = new YoutubeClient();
    const metadata = await youtube.getMetadata(youtubeId);

    if (!metadata?.items?.length) {
      return {
        notFound: true,
      };
    }

    const snippet = metadata.items[0]["snippet"];
    const thumbnail = snippet.thumbnails.standard;
    const contentDetails = metadata.items[0]["contentDetails"];

    const podcast: types.Podcast = {
      youtubeId,
      title: snippet.title,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      thumbnailUrl: thumbnail.url,
      thumbnailWidth: thumbnail.width,
      thumbnailheight: thumbnail.height,
      duration: contentDetails.duration,
    };

    return {
      props: {
        podcast,
      },
    };
  } catch (error) {
    console.error("youtube error", error);

    return {
      notFound: true,
    };
  }
};
