import React, { useEffect, useRef, useState } from "react";
import { PlusCircle } from "react-bootstrap-icons";

function Audioplayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState("");
  const [playList, setPlayList] = useState([]);
  const audioRef = useRef(new Audio());
  const inputRef = useRef(null);

  useEffect(() => {
    const savedAudio = JSON.parse(localStorage.getItem("songs")) || [];
    setPlayList(savedAudio);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    const playNextTrack = () => playNext();

    audio.addEventListener("ended", playNextTrack);

    return () => {
      audio.removeEventListener("ended", playNextTrack);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    const file = playList[currentTrackIndex];
    if (file) {
      const audio = audioRef.current;
      audio.src = file.base64;
      audio.play().catch(error => console.error("Error playing audio:", error));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const updatePlaybackPosition = () => {
      localStorage.setItem("currentTrackIndex", currentTrackIndex);
      localStorage.setItem("currentTrackTime", audioRef.current.currentTime);
    };

    audioRef.current.addEventListener("timeupdate", updatePlaybackPosition);

    return () =>
      audioRef.current.removeEventListener(
        "timeupdate",
        updatePlaybackPosition
      );
  }, [currentTrackIndex]);

  useEffect(() => {
    const savedTrackIndex = localStorage.getItem("currentTrackIndex");
    const savedTrackTime = localStorage.getItem("currentTrackTime");

    if (savedTrackIndex) {
      setCurrentTrackIndex(Number(savedTrackIndex));
    }

    if (savedTrackTime) {
      audioRef.current.currentTime = Number(savedTrackTime);
    }
  }, [playList]);

  const playNext = () => {
    const tempIndex = (currentTrackIndex + 1) % playList.length;
    setCurrentTrackIndex(tempIndex);
  };

  const onFileUpload = (base64, name) => {
    const newTrack = { base64, name };

    const tempData = JSON.parse(localStorage.getItem("songs")) || [];
    const metadata = [...tempData, newTrack];
    localStorage.setItem("songs", JSON.stringify(metadata));
    setPlayList([...metadata]);
  };

  const handleFileChange = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const base64 = e.target.result;
        onFileUpload(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayNow = i => {
    setCurrentTrackIndex(i);
  };

  return (
    <div className="mx-md-4 mx-sm-3 mx-2 px-lg-4 px-md-3 px-2 border shadow rounded">
      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between">
          <p className="mb-0 fs-4 me-3 fw-semibold">My Playlist</p>
          <button
            className="add-buttton"
            onClick={() => inputRef.current.click()}
          >
            New Song <PlusCircle />
          </button>

          <input
            ref={inputRef}
            className="d-none"
            value=""
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="my-2 playlist">
          {playList.map((item, i) => (
            <div
              key={i}
              className="d-flex align-items-center justify-content-start py-2"
            >
              <p
                className={`fs-6 mb-0 me-2 ${
                  currentTrackIndex === i
                    ? "text-dark-blue fw-medium"
                    : "text-dark"
                }`}
              >
                {i + 1}
              </p>

              <p
                className={`fs-5 mb-0 cursor-pointer ${
                  currentTrackIndex === i
                    ? "text-dark-blue fw-bold"
                    : "text-dark"
                }`}
                onClick={() => handlePlayNow(i)}
              >
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="py-3">
        <audio ref={audioRef} controls src="" preload="auto" />
      </div>
    </div>
  );
}

export default Audioplayer;
