import React, { useState, useEffect } from "react";

type ProfileName = "Nick" | "Charli" | "Shelma";

const defaultPhotos: Record<ProfileName, string> = {
  Nick: "https://i.pravatar.cc/100?img=1",
  Charli: "https://i.pravatar.cc/100?img=2",
  Shelma: "https://i.pravatar.cc/100?img=3",
};

const profiles: ProfileName[] = ["Nick", "Charli", "Shelma"];

type Votes = Partial<Record<ProfileName, ProfileName>>;

type PyramidHistoryEntry = {
  round: number;
  timestamp: string;
  ranking: ProfileName[];
};

export default function BehaviorPyramidApp() {
  // Load saved data from localStorage or init fresh
  const [currentUser, setCurrentUser] = useState<ProfileName | "">(
    (localStorage.getItem("bp-currentUser") as ProfileName) || ""
  );

  const [photos, setPhotos] = useState<Record<ProfileName, string>>(() => {
    const saved = localStorage.getItem("bp-photos");
    return saved ? JSON.parse(saved) : defaultPhotos;
  });

  const [votes, setVotes] = useState<Votes>(() => {
    const saved = localStorage.getItem("bp-votes");
    return saved ? JSON.parse(saved) : {};
  });

  const [history, setHistory] = useState<PyramidHistoryEntry[]>(() => {
    const saved = localStorage.getItem("bp-history");
    return saved ? JSON.parse(saved) : [];
  });

  // Save data back to localStorage on changes
  useEffect(() => {
    localStorage.setItem("bp-votes", JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem("bp-photos", JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem("bp-currentUser", currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("bp-history", JSON.stringify(history));
  }, [history]);

  // Handle photo upload for profile
  const onPhotoChange = (
    profile: ProfileName,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos((p) => ({ ...p, [profile]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Check if all profiles have voted this round
  const allVoted = profiles.every((p) => votes[p]);

  // Compute current ranking based on votes
  const computeRanking = (): ProfileName[] => {
    const count: Record<ProfileName, number> = {
      Nick: 0,
      Charli: 0,
      Shelma: 0,
    };
    Object.values(votes).forEach((v) => {
      if (v && count[v] !== undefined) count[v]++;
    });
    return profiles.slice().sort((a, b) => count[b] - count[a]);
  };

  const ranking = computeRanking();

  // Cast vote for current user
  const castVote = (votedFor: ProfileName) => {
    if (!currentUser) {
      alert("Please select your profile first!");
      return;
    }
    if (votedFor === currentUser) {
      alert("You cannot vote for yourself!");
      return;
    }
    if (votes[currentUser]) {
      if (
        !window.confirm(
          `You already voted for ${votes[currentUser]}. Change your vote?`
        )
      )
        return;
    }
    setVotes((v) => ({ ...v, [currentUser]: votedFor }));
  };

  // Save current pyramid and start new round
  const startNewRound = () => {
    if (!allVoted) {
      alert("All profiles must vote before starting a new round.");
      return;
    }
    const newPyramid: PyramidHistoryEntry = {
      round: history.length + 1,
      timestamp: new Date().toLocaleString(),
      ranking,
    };
    setHistory((h) => [...h, newPyramid]);
    setVotes({});
  };

  return (
    <div
      style={{ maxWidth: 360, margin: "auto", fontFamily: "Arial, sans-serif" }}
    >
      <h1 style={{ textAlign: "center" }}>Best Behaved Voting</h1>

      {/* Profile selector */}
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

          {/* Photo upload */}
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPhotoChange(currentUser, e)}
            />
          </div>

          {/* Voting */}
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
                    backgroundColor:
                      votes[currentUser] === p ? "green" : "gray",
                    color: "white",
                    cursor: votes[currentUser] === p ? "default" : "pointer",
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

          {/* Current pyramid info */}
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <h3>
              Current Pyramid {history.length + 1}{" "}
              {allVoted
                ? "(All voted! Ready to start next round)"
                : "(Voting in progress)"}
            </h3>

            {/* Pyramid display */}
            <div>
              {/* Top */}
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
                <div style={{ fontWeight: "bold", marginTop: 6 }}>
                  {ranking[0]}
                </div>
              </div>

              {/* Bottom row */}
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
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

            {/* Start new round button */}
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

          {/* History */}
          <div style={{ marginTop: 40 }}>
            <h3>Past Pyramids History</h3>
            {history.length === 0 && <p>No past pyramids yet.</p>}
            <ul>
              {history.map(({ round, timestamp, ranking }) => (
                <li key={round} style={{ marginBottom: 10 }}>
                  <strong>Pyramid {round}</strong> - <em>{timestamp}</em>
                  <div style={{ display: "flex", marginTop: 5, gap: 10 }}>
                    {ranking.map((p) => (
                      <img
                        key={p}
                        src={photos[p]}
                        alt={p}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: "1px solid gray",
                        }}
                      />
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
