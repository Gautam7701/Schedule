import { useState, useEffect } from "react";

const routine = [
  { task: "Wake up + splash water + 5 pushups + glass of water + 20-sec voice note", type: "Morning", time: "07:00" },
  { task: "Breakfast + quick planning", type: "Morning", time: "07:30" },
  { task: "DSA Deep Work (Arrays → Strings → Linked List → Trees → Graphs → DP)", type: "DSA", time: "08:00" },
  { task: "React/JS Practice (Build one component/app per block)", type: "WebDev", time: "10:00" },
  { task: "Soft Skill & Communication (Record 2–5 min self-explaining projects / interview questions)", type: "SoftSkill", time: "11:30" },
  { task: "Strategic Nap (max 30 min, alarm set, no phone)", type: "Rest", time: "12:30" },
  { task: "Lunch + 15-min walk / fresh air", type: "Lunch", time: "13:00" },
  { task: "DSA Practice Problems (LeetCode/GFG, 4–5 per block)", type: "DSA", time: "14:00" },
  { task: "Web Dev / React Projects (implement feature / fix bugs / clean GitHub repo)", type: "WebDev", time: "16:00" },
  { task: "React/JS Deep Dive (Hooks, Redux, API integration)", type: "WebDev", time: "17:00" },
  { task: "Interview Prep (System design basics, HR questions, mock coding)", type: "Interview", time: "18:00" },
  { task: "Dinner (eat, no phone scrolling)", type: "Dinner", time: "19:00" },
  { task: "Project / Portfolio (finish one small feature / write README / deploy)", type: "WebDev", time: "19:30" },
  { task: "Gym / Exercise (night session, mandatory)", type: "Exercise", time: "20:30" },
  { task: "Revision + Notes", type: "Study", time: "22:30" },
  { task: "Night routine / prepare for bed", type: "Night", time: "23:00" }
];

const motivationalQuotes = [
  "Own today. No excuses.",
  "Small progress is still progress.",
  "Discipline is the bridge between goals and accomplishment.",
  "Push yourself, because no one else will.",
  "The pain you feel today will be your strength tomorrow"
];

const DAILY_THRESHOLD = 0.7;

export default function HardcoreDisciplineTracker() {
  const today = new Date();
  const dayIndex = today.getDay();
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayIndex + 1); // Monday as start
  const weekKey = `routine-week-${weekStart.toISOString().slice(0,10)}`;

  const savedWeek = JSON.parse(localStorage.getItem(weekKey)) || {};
  const initialCompleted = savedWeek[dayIndex] || {};

  const [completed, setCompleted] = useState(initialCompleted);
  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  const computeStreak = (weekData) => {
    let count = 0;
    for (let i = dayIndex - 1; i >= 0; i--) {
      const day = weekData[i] || {};
      const ratio = Object.values(day).filter(Boolean).length / routine.length;
      if (ratio >= DAILY_THRESHOLD) count++;
      else break;
    }
    return count;
  };

  useEffect(() => {
    let weekData = JSON.parse(localStorage.getItem(weekKey)) || {};

    // Strict enforcement: reset if yesterday < threshold
    const yesterdayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const yesterday = weekData[yesterdayIndex] || {};
    const yesterdayCompleted = Object.values(yesterday).filter(Boolean).length / routine.length;

    if (yesterdayIndex in weekData && yesterdayCompleted < DAILY_THRESHOLD) {
      localStorage.removeItem(weekKey);
      setCompleted({});
      alert("You missed yesterday! Week reset to build hardcore discipline. 💪");
      weekData = {};
    }

    // Save today
    weekData[dayIndex] = completed;
    localStorage.setItem(weekKey, JSON.stringify(weekData));
    setStreak(computeStreak(weekData));

    // Badges
    const newBadges = [];
    const currentStreak = computeStreak(weekData);
    if (currentStreak >= 3) newBadges.push("🔥 3-day streak");
    if (currentStreak >= 5) newBadges.push("🏆 5-day streak");
    if (currentStreak >= 7) newBadges.push("💎 7-day streak");
    setBadges(newBadges);

  }, [completed, dayIndex, weekKey]);

  const toggleCheck = (index) => {
    const now = new Date();
    const taskHour = parseInt(routine[index].time.split(":")[0], 10);
    const taskMinute = parseInt(routine[index].time.split(":")[1], 10);

    // Warn if checking after scheduled time
    if (now.getHours() > taskHour || (now.getHours() === taskHour && now.getMinutes() > taskMinute)) {
      if (!window.confirm("You're checking this task after its scheduled time. Are you sure?")) return;
    }

    setCompleted({ ...completed, [index]: !completed[index] });
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / routine.length) * 100);

  const weekData = JSON.parse(localStorage.getItem(weekKey)) || {};
  const weeklyProgress = Math.round(Object.values(weekData).reduce((acc, day) => {
    return acc + Object.values(day).filter(Boolean).length;
  }, 0) / (routine.length * 7) * 100);

  return (
    <div style={{
      padding: "25px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "700px",
      margin: "40px auto",
      background: "#111111",
      color: "#F5F5F5",
      borderRadius: "15px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
    }}>
      <h2 style={{ textAlign: "center", color: "#FFD700", marginBottom: "5px" }}>🚀 Hardcore Discipline Tracker</h2>
      <p style={{ textAlign: "center", fontStyle: "italic", color: "#00FFAB", marginBottom: "15px" }}>{quote}</p>

      <p style={{ textAlign: "center", marginBottom: "10px" }}>🔥 Current Streak: {streak} day(s)</p>
      {badges.length > 0 && <p style={{ textAlign: "center", color: "#FFD700" }}>{badges.join(" | ")}</p>}

      <div style={{
        height: "14px",
        background: "#333",
        borderRadius: "7px",
        overflow: "hidden",
        margin: "10px 0 20px 0"
      }}>
        <div style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #00FFAB, #FFD700)",
          height: "100%",
          transition: "width 0.4s"
        }}></div>
      </div>
      <p style={{ textAlign: "center", marginBottom: "20px" }}>Today: {completedCount}/{routine.length} tasks completed</p>

      <button
        onClick={() => setWeeklySummary(!weeklySummary)}
        style={{
          background: "#FFD700",
          border: "none",
          color: "#1E1E2F",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          marginBottom: "20px"
        }}
      >
        {weeklySummary ? "Hide Weekly Summary" : "Show Weekly Summary"}
      </button>

      {weeklySummary && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#00FFAB" }}>🌟 Weekly Progress</h3>
          <p>{weeklyProgress}% tasks completed this week</p>
          <p>Check your discipline and consistency! 💪</p>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {routine.map((taskObj, index) => {
          const now = new Date();
          const taskHour = parseInt(taskObj.time.split(":")[0], 10);
          const taskMinute = parseInt(taskObj.time.split(":")[1], 10);
          const isLate = now.getHours() > taskHour || (now.getHours() === taskHour && now.getMinutes() > taskMinute);

          return (
            <li key={index} style={{ marginBottom: "14px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "12px",
                borderRadius: "10px",
                background: completed[index] ? "#00FFAB20" : isLate ? "#FF000020" : "#2A2A3C",
                transition: "background 0.3s, transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <input
                  type="checkbox"
                  checked={completed[index] || false}
                  onChange={() => toggleCheck(index)}
                  style={{ marginRight: "15px", transform: "scale(1.3)", accentColor: "#FFD700" }}
                />
                <span style={{
                  textDecoration: completed[index] ? "line-through" : "none",
                  flex: 1,
                  color: isLate && !completed[index] ? "#FF5555" : "#F5F5F5"
                }}>
                  {taskObj.time} — {taskObj.task}
                  {isLate && !completed[index] && " ⏰ Late!"}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  );
}
