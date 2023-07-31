import { useRouter } from "next/router";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

import { Layout } from "@/components/Layout/Layout";
import { PageHead } from "@/components/PageHead/PageHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getYoutubeMetadata } from "@/lib/api";

import styles from "./index.module.css";

const IndexPage = () => {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");

  const handleStart = async () => {
    // Handle the start button click here
    if (isValidYoutubeUrl(url)) {
      const videoId = getVideoId(url);
      setVideoId(videoId);

      try {
        const metadata = await getYoutubeMetadata(videoId);

        if (metadata == undefined) {
          handleError("Please enter a valid YouTube URL. Metadata not found.");
          return;
        }

        if (
          !metadata.snippet.channelTitle.toLowerCase().includes("lex") ||
          !metadata.snippet.channelTitle.toLowerCase().includes("fridman")
        ) {
          handleError("Please make sure only lex fridman videos are used.");
          return;
        }
      } catch {
        handleError(
          "Please enter a valid YouTube URL. Metadata fetch errored."
        );
        return;
      }

      router.push(`/listen/${videoId}`);
    } else {
      toast.error("Please enter a valid YouTube URL. URL not valid.");
      return;
    }
  };

  const handleError = (error: string) => {
    setVideoId("");
    setUrl("");
    toast.error(error);
  };

  const handleURLOnChange = async (e) => {
    const enteredURL: string = e.target.value;
    setUrl(enteredURL);
  };

  const getVideoId = (url) => {
    const urlObj = new URL(url);
    var videoId;
    if (urlObj.hostname === "www.youtube.com") {
      videoId = new URLSearchParams(urlObj.search).get("v");
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.split("/")[1];
    }

    return videoId;
  };

  function isValidYoutubeUrl(url) {
    const regex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  }

  return (
    <Layout>
      <PageHead />

      <div className={styles.body}>
        <h2 className="text-2xl font-bold text-center mt-4">
          Welcome to Pickle Pod 👋
        </h2>

        <p className="text-center mt-2 w-full">
          Please enter the URL of a YouTube podcast video you'd like to listen
          and talk to.
        </p>

        <div className={styles.form}>
          <Input
            type="youtube"
            className="mt-4 w-full p-2 border rounded"
            value={url}
            onChange={handleURLOnChange}
            placeholder="YouTube URL"
          />

          <Button className="mt-4" variant="outline" onClick={handleStart}>
            Go
          </Button>
        </div>

        <div className="text-center mt-2 w-full">
          <div className={styles.example}>Or choose an example video:</div>
          <p className={styles.links}>
            <Link className={styles.link} href="/listen/gk4tEO4jDUM">
              Lex & Joe Rogan
            </Link>{" "}
            |{" "}
            <Link className={styles.link} href="/listen/DxREm3s1scA">
              Lex & Elon Musk
            </Link>{" "}
            |{" "}
            <Link className={styles.link} href="/listen/4dC_nRYIDZU">
              Lex & Sam Harris
            </Link>{" "}
            |{" "}
            <Link className={styles.link} href="/listen/Ff4fRgnuFgQ">
              Lex & Mark Zuckerberg
            </Link>
          </p>
        </div>
      </div>

      <Toaster />
    </Layout>
  );
};

export default IndexPage;
