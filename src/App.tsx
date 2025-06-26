import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

const defaultPhotos = {
  Nick: "https://i.pravatar.cc/100?img=1",
  Charli: "https://i.pravatar.cc/100?img=2",
  Shelma: "https://i.pravatar.cc/100?img=3",
};

const profiles = ["Nick", "Charli", "Shelma"];

export default function BehaviorPyramidApp() {
  const [currentUser, setCurrentUser] = useState("");
  const [photos, setPhotos] = useState(defaultPhotos);
  const [votes, setVotes] = useState({});
  const [history, setHistory] = useState([]);

  // 🔄 Load from Firestore on start
  useEffect(() => {
    const unsubPhotos = onSnapshot(collection(db, "photos"), (snapshot) => {
      const data = {};
      snapshot.forEach((doc) => (data[doc.id] = doc.data().photo));
      setPhotos((prev) => ({ ...defaultPhotos, ...data }));
    });

    const unsubVotes = onSnapshot(collection(db, "votes"), (snapshot) => {
      const data = {};
      snapshot.forEach((doc) => (data[doc.id] = doc.data().votedFor));
      setVotes(data);
    });

    const loadHistory = async () => {
      const snap = await getDocs(collection(db, "pyramids"));
      const data = snap.docs
        .map((doc) => doc.data())
        .sort((a, b) => a.round - b.round);
      setHistory(data);
    };
    loadHistory();

    return () => {
      unsubPhotos();
      unsubVotes();
    };
  }, []);

  // 📸 Upload Photo (base64)
  const onPhotoChange = (profile, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      await setDoc(doc(db, "photos", profile), { photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const allVoted = profiles.every((p) => votes[p]);

  const computeRanking = () => {
    const count = {};
    profiles.forEach((p) => (count[p] = 0));
    Object.values(votes).forEach((v) => {
      if (count[v] !== undefined) count[v]++;
    });
    return profiles.slice().sort((a, b) => count[b] - count[a]);
  };

  const ranking = computeRanking();

  const castVote = async (votedFor) => {
    if (!currentUser) return alert("Please select your profile first!");
    if (votedFor === currentUser)
      return alert("You cannot vote for yourself!");

    const prevVote = votes[currentUser];
    if (prevVote && !window.confirm(`Change vote from ${prevVote} to ${votedFor}?`)) {
      return;
    }

    await setDoc(doc(db, "votes", currentUser), { votedFor });
  };

  const startNewRound = async () => {
    if (!allVoted) return alert("Everyone must vote first.");
    const newPyramid = {
      round: history.length + 1,
      timestamp: new Date().toLocaleString(),
      ranking,
    };
    await addDoc(collection(db, "pyramids"), newPyramid);

    // Reset votes
    const voteDocs = await getDocs(collection(db, "votes"));
    voteDocs.forEach(async (d) => await setDoc(doc(db, "votes", d.id), {}));
  };

  return (
    <div style={{ maxWidth: 360, margin: "auto", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Best Behaved Voting</h1>

      {!currentUser && (
        <div style={{ marginBottom: 16 }}>
          <h3>Select Your Profile</h3>
          {profiles.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentUser(p)}
              style={{ marginRight: 8, padding: "6px 12px" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {currentUser && (
        <>
          <div style={{ marginBottom: 20 }}>
            <strong>You are:</strong> {currentUser}{" "}
            <button onClick={() => setCurrentUser("")} style={{ marginLeft: 10 }}>
              Change
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <img
              src={photos[currentUser]}
              alt={currentUser}
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                display: "block",
                marginBottom: 8,
              }}
            />
            <input type="file" accept="image/*" onChange={(e) => onPhotoChange(currentUser, e)} />
          </div>

          <div>
            <h3>Vote for the Best Behaved</h3>
            {profiles
              .filter((p) => p !== currentUser)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => castVote(p)}
                  disabled={votes[currentUser] === p}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    padding: "8px 16px",
                    backgroundColor: votes[currentUser] === p ? "green" : "gray",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  {p}
                </button>
              ))}
            {votes[currentUser] && (
              <div style={{ marginTop: 10, fontStyle: "italic" }}>
                You voted for <b>{votes[currentUser]}</b>.
              </div>
            )}
          </div>

          <div style={{ marginTop: 30, textAlign: "center" }}>
            <h3>
              Current Pyramid {history.length + 1}{" "}
              {allVoted ? "(All voted! Ready to start next round)" : "(Voting in progress)"}
            </h3>

            <div>
              <div>
                <img
                  src={photos[ranking[0]]}
                  alt={ranking[0]}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: "4px solid gold",
                  }}
                />
                <div style={{ fontWeight: "bold", marginTop: 6 }}>{ranking[0]}</div>
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 20 }}>
                {[ranking[1], ranking[2]].map((p) => (
                  <div key={p}>
                    <img
                      src={photos[p]}
                      alt={p}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "2px solid gray",
                      }}
                    />
                    <div>{p}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                onClick={startNewRound}
                disabled={!allVoted}
                style={{
                  padding: "10px 20px",
                  backgroundColor: allVoted ? "#007bff" : "gray",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  cursor: allVoted ? "pointer" : "not-allowed",
                }}
              >
                Start Next Pyramid Round
              </button>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3>Past Pyramids History</h3>
            {history.length === 0 && <p>No past pyramids yet.</p>}
            <ul>
              {history.map(({ round, timestamp, ranking }) => (
                <li key={round} style={{ marginBottom: 10 }}>
                  <strong>Pyramid {round}</strong> - <em>{timestamp}</em>
                  <div style={{ display: "flex", marginTop: 5, gap: 10 }}>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={photos[ranking[0]]}
                        alt={ranking[0]}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          border: "3px solid gold",
                          display: "block",
                          margin: "auto",
                        }}
                      />
                      <div style={{ fontWeight: "bold" }}>{ranking[0]}</div>
                    </div>
                    {[ranking[1], ranking[2]].map((p) => (
                      <div key={p} style={{ textAlign: "center" }}>
                        <img
                          src={photos[p]}
                          alt={p}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            border: "2px solid gray",
                            display: "block",
                            margin: "auto",
                          }}
                        />
                        <div>{p}</div>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
