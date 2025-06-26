import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase"; // Make sure you have a working firebase.ts file
import "./styles.css"; // Optional styling if needed

type ProfileName = "Nick" | "Charli" | "Shelma";

type Votes = Record<ProfileName, number>;

export default function App() {
  const [votes, setVotes] = useState<Votes>(() => {
    const saved = localStorage.getItem("bp-votes");
    return saved ? JSON.parse(saved) : {} as Votes;
  });

  const [photos, setPhotos] = useState<Partial<Record<ProfileName, string>>>({});
  const [voted, setVoted] = useState<boolean>(false);

  const fetchPhotos = async () => {
    const photoCollection = collection(db, "photos");
    const snapshot = await getDocs(photoCollection);
    const photoMap: Partial<Record<ProfileName, string>> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.name && data.url) {
        photoMap[data.name as ProfileName] = data.url;
      }
    });
    setPhotos(photoMap);
  };

  const fetchVotes = async () => {
    const voteCollection = collection(db, "votes");
    const snapshot = await getDocs(voteCollection);
    const voteMap: Votes = { Nick: 0, Charli: 0, Shelma: 0 };
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.name && typeof data.count === "number") {
        voteMap[data.name as ProfileName] = data.count;
      }
    });
    setVotes(voteMap);
  };

  useEffect(() => {
    fetchPhotos();
    fetchVotes();
    setVoted(!!localStorage.getItem("bp-votes"));
  }, []);

  const handleVote = async (name: ProfileName) => {
    if (voted) return;

    const voteDoc = doc(db, "votes", name);
    await updateDoc(voteDoc, {
      count: votes[name] + 1
    });

    const newVotes = {
      ...votes,
      [name]: votes[name] + 1
    };

    setVotes(newVotes);
    localStorage.setItem("bp-votes", JSON.stringify(newVotes));
    setVoted(true);
  };

  const profiles: ProfileName[] = ["Nick", "Charli", "Shelma"];

  return (
    <div className="App">
      <h1>Best Profile</h1>
      <div className="profiles">
        {profiles.map((name) => (
          <div key={name} className="profile">
            <img
              src={photos[name] || "https://via.placeholder.com/100"}
              alt={name}
              width={100}
              height={100}
            />
            <h2>{name}</h2>
            <button onClick={() => handleVote(name)} disabled={voted}>
              Vote
            </button>
            <p>{votes[name] || 0} votes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
