

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
  { task: "Tell everything to my Diksha with proof (voice note / screenshots)", type: "Accountability", time: "22:50" },
  { task: "Night routine / prepare for bed", type: "Night", time: "23:00" }
];

const motivationalQuotes = [
  "Own today. No excuses.",
  "Small progress is still progress.",
  "Discipline is the bridge between goals and accomplishment.",
  "Push yourself, because no one else will.",
  "The pain you feel today will be your strength tomorrow",
  "One hour of focus is worth ten hours of regret later",
  "Stop scrolling. Start building."
];

const DAILY_THRESHOLD = 0.7;

export default function HardcoreDisciplineTracker() {
  const today = new Date();

  // ---- Continuous Day Counting ----
  let startDate = localStorage.getItem("routine-start-date");
  if (!startDate) {
    startDate = today.toISOString().slice(0,10); // yyyy-mm-dd
    localStorage.setItem("routine-start-date", startDate);
  }
  startDate = new Date(startDate);

  const diffTime = today - startDate;
  const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const dataKey = "discipline-progress";
  const allData = JSON.parse(localStorage.getItem(dataKey)) || {};
  const initialCompleted = allData[dayNumber] || {};

  const [completed, setCompleted] = useState(initialCompleted);
  const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);

  const computeStreak = (allData) => {
    let count = 0;
    for (let i = dayNumber - 1; i >= 1; i--) {
      const day = allData[i] || {};
      const ratio = Object.values(day).filter(Boolean).length / routine.length;
      if (ratio >= DAILY_THRESHOLD) count++;
      else break;
    }
    return count;
  };

  // ---- Save state & handle streaks ----
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const todayCompletedRatio = Object.values(completed).filter(Boolean).length / routine.length;
    if (dayNumber > 1) {
      const yesterday = allData[dayNumber - 1] || {};
      const yesterdayRatio = Object.values(yesterday).filter(Boolean).length / routine.length;

      if (yesterdayRatio < DAILY_THRESHOLD) {
        alert("You missed yesterday! Streak broken. 💪");
      }
    }

    allData[dayNumber] = completed;
    localStorage.setItem(dataKey, JSON.stringify(allData));

    setStreak(computeStreak(allData));

    const newBadges = [];
    const currentStreak = computeStreak(allData);
    if (currentStreak >= 3) newBadges.push("🔥 3-day streak");
    if (currentStreak >= 5) newBadges.push("🏆 5-day streak");
    if (currentStreak >= 7) newBadges.push("💎 7-day streak");
    if (currentStreak >= 30) newBadges.push("🌟 30-day streak");
    setBadges(newBadges);
  }, [completed]);

  const toggleCheck = (index) => {
    const now = new Date();
    const [taskHour, taskMinute] = routine[index].time.split(":").map(Number);

    const taskStart = new Date();
    taskStart.setHours(taskHour, taskMinute, 0, 0);

    let taskEnd;
    if (index < routine.length - 1) {
      const [nextHour, nextMinute] = routine[index + 1].time.split(":").map(Number);
      taskEnd = new Date();
      taskEnd.setHours(nextHour, nextMinute, 0, 0);
    } else {
      taskEnd = new Date();
      taskEnd.setHours(23, 59, 59, 999);
    }

    const last10Min = new Date(taskEnd.getTime() - 10 * 60 * 1000);

    if (now < last10Min) {
      alert("Too early! You can only mark this task in the last 10 minutes of its duration. ⏳");
      return;
    }

    if (now > taskEnd) {
      alert("Too late! You missed this task. ⛔");
      return;
    }

    setCompleted({ ...completed, [index]: !completed[index] });
  };

  // ---- Notifications ----
  useEffect(() => {
    const timers = [];

    routine.forEach((task) => {
      const [hour, minute] = task.time.split(":").map(Number);
      const now = new Date();
      const taskTime = new Date();
      taskTime.setHours(hour, minute, 0, 0);

      let delay = taskTime.getTime() - now.getTime();
      if (delay < 0) delay = 0;

      const timer = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("Task Reminder ⏰", { body: task.task });
        }
      }, delay);
      timers.push(timer);
    });

    for (let i = 0; i < 4; i++) {
      const randomDelay = Math.floor(Math.random() * 12 * 60 * 60 * 1000);
      const timer = setTimeout(() => {
        if (Notification.permission === "granted") {
          const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
          new Notification("Motivation 💪", { body: randomQuote });
        }
      }, randomDelay);
      timers.push(timer);
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / routine.length) * 100);

  const weeklyProgress = Math.round(Object.values(allData).reduce((acc, day) => {
    return acc + Object.values(day).filter(Boolean).length;
  }, 0) / (routine.length * Object.keys(allData).length) * 100);

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
        {weeklySummary ? "Hide Summary" : "Show Summary"}
      </button>

      {weeklySummary && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h3 style={{ color: "#00FFAB" }}>📊 Summary</h3>
          <p>Overall progress: {weeklyProgress}%</p>
          {Object.keys(allData).map(day => {
            const dayTasks = allData[day] || {};
            const dayCompleted = Object.values(dayTasks).filter(Boolean).length;
            return (
              <p key={day}>Day {day}: {dayCompleted}/{routine.length} tasks done</p>
            );
          })}
        </div>
      )}

      <div>
        {routine.map((item, index) => (
          <div key={index} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            marginBottom: "8px",
            background: completed[index] ? "#00FFAB33" : "#222",
            borderRadius: "8px"
          }}>
            <div>
              <strong>{item.time}</strong> - {item.task}
            </div>
            <button
              onClick={() => toggleCheck(index)}
              style={{
                background: completed[index] ? "#FFD700" : "#00FFAB",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#111"
              }}
            >
              {completed[index] ? "✔ Done" : "Mark"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";

// const routine = [
//   { task: "Wake up + splash water + 5 pushups + glass of water + 20-sec voice note", type: "Morning", time: "07:00" },
//   { task: "Breakfast + quick planning", type: "Morning", time: "07:30" },
//   { task: "DSA Deep Work (Arrays → Strings → Linked List → Trees → Graphs → DP)", type: "DSA", time: "08:00" },
//   { task: "React/JS Practice (Build one component/app per block)", type: "WebDev", time: "10:00" },
//   { task: "Soft Skill & Communication (Record 2–5 min self-explaining projects / interview questions)", type: "SoftSkill", time: "11:30" },
//   { task: "Strategic Nap (max 30 min, alarm set, no phone)", type: "Rest", time: "12:30" },
//   { task: "Lunch + 15-min walk / fresh air", type: "Lunch", time: "13:00" },
//   { task: "DSA Practice Problems (LeetCode/GFG, 4–5 per block)", type: "DSA", time: "14:00" },
//   { task: "Web Dev / React Projects (implement feature / fix bugs / clean GitHub repo)", type: "WebDev", time: "16:00" },
//   { task: "React/JS Deep Dive (Hooks, Redux, API integration)", type: "WebDev", time: "17:00" },
//   { task: "Interview Prep (System design basics, HR questions, mock coding)", type: "Interview", time: "18:00" },
//   { task: "Dinner (eat, no phone scrolling)", type: "Dinner", time: "19:00" },
//   { task: "Project / Portfolio (finish one small feature / write README / deploy)", type: "WebDev", time: "19:30" },
//   { task: "Gym / Exercise (night session, mandatory)", type: "Exercise", time: "20:30" },
//   { task: "Revision + Notes", type: "Study", time: "22:30" },
//   { task: "Tell everything to my friend with proof (voice note / screenshots)", type: "Accountability", time: "22:50" },
//   { task: "Night routine / prepare for bed", type: "Night", time: "23:00" }
// ];

// const motivationalQuotes = [
//   "Own today. No excuses.",
//   "Small progress is still progress.",
//   "Discipline is the bridge between goals and accomplishment.",
//   "Push yourself, because no one else will.",
//   "The pain you feel today will be your strength tomorrow",
//   "One hour of focus is worth ten hours of regret later",
//   "Stop scrolling. Start building."
// ];

// const DAILY_THRESHOLD = 0.7;

// export default function HardcoreDisciplineTracker() {
//   const today = new Date();

//   // ---- Continuous Day Counting ----
//   let startDate = localStorage.getItem("routine-start-date");
//   if (!startDate) {
//     startDate = today.toISOString().slice(0, 10); // yyyy-mm-dd
//     localStorage.setItem("routine-start-date", startDate);
//   }
//   startDate = new Date(startDate);

//   const diffTime = today - startDate;
//   const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
//   const todayKey = dayNumber.toString();

//   const dataKey = "discipline-progress";
//   const allData = JSON.parse(localStorage.getItem(dataKey)) || {};
//   const initialCompleted = allData[todayKey] || {};

//   const [completed, setCompleted] = useState(initialCompleted);
//   const [quote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [badges, setBadges] = useState([]);

//   const computeStreak = (allData) => {
//     let count = 0;
//     for (let i = dayNumber - 1; i >= 1; i--) {
//       const day = allData[i.toString()] || {};
//       const ratio = Object.values(day).filter(Boolean).length / routine.length;
//       if (ratio >= DAILY_THRESHOLD) count++;
//       else break;
//     }
//     return count;
//   };

//   // ---- Save state & handle streaks ----
//   useEffect(() => {
//     if (Notification.permission !== "granted") {
//       Notification.requestPermission();
//     }

//     const todayCompletedRatio = Object.values(completed).filter(Boolean).length / routine.length;
//     if (dayNumber > 1) {
//       const yesterday = allData[(dayNumber - 1).toString()] || {};
//       const yesterdayRatio = Object.values(yesterday).filter(Boolean).length / routine.length;
//       if (yesterdayRatio < DAILY_THRESHOLD) {
//         alert("You missed yesterday! Streak broken. 💪");
//       }
//     }

//     allData[todayKey] = completed;
//     localStorage.setItem(dataKey, JSON.stringify(allData));

//     const currentStreak = computeStreak(allData);
//     setStreak(currentStreak);

//     const newBadges = [];
//     if (currentStreak >= 3) newBadges.push("🔥 3-day streak");
//     if (currentStreak >= 5) newBadges.push("🏆 5-day streak");
//     if (currentStreak >= 7) newBadges.push("💎 7-day streak");
//     if (currentStreak >= 30) newBadges.push("🌟 30-day streak");
//     setBadges(newBadges);
//   }, [completed]);

//   const toggleCheck = (index) => {
//     const now = new Date();
//     const [taskHour, taskMinute] = routine[index].time.split(":").map(Number);

//     const taskEnd = index < routine.length - 1
//       ? new Date(today.setHours(...routine[index + 1].time.split(":").map(Number), 0, 0))
//       : new Date(today.setHours(23, 59, 59, 999));

//     const last10Min = new Date(taskEnd.getTime() - 10 * 60 * 1000);

//     if (now < last10Min) {
//       alert("Too early! You can only mark this task in the last 10 minutes of its duration. ⏳");
//       return;
//     }

//     if (now > taskEnd) {
//       alert("Too late! You missed this task. ⛔");
//       return;
//     }

//     setCompleted({ ...completed, [index]: !completed[index] });
//   };

//   const completedCount = Object.values(completed).filter(Boolean).length;
//   const progress = Math.round((completedCount / routine.length) * 100);

//   const overallProgress = Math.round(Object.values(allData).reduce((acc, day) => {
//     return acc + Object.values(day).filter(Boolean).length;
//   }, 0) / (routine.length * Object.keys(allData).length) * 100);

//   return (
//     <div style={{
//       padding: "25px",
//       fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//       maxWidth: "700px",
//       margin: "40px auto",
//       background: "#111111",
//       color: "#F5F5F5",
//       borderRadius: "15px",
//       boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
//     }}>
//       <h2 style={{ textAlign: "center", color: "#FFD700", marginBottom: "5px" }}>🚀 Hardcore Discipline Tracker</h2>
//       <p style={{ textAlign: "center", fontStyle: "italic", color: "#00FFAB", marginBottom: "15px" }}>{quote}</p>
//       <p style={{ textAlign: "center", marginBottom: "10px" }}>🔥 Current Streak: {streak} day(s)</p>
//       {badges.length > 0 && <p style={{ textAlign: "center", color: "#FFD700" }}>{badges.join(" | ")}</p>}

//       <div style={{ height: "14px", background: "#333", borderRadius: "7px", overflow: "hidden", margin: "10px 0 20px 0" }}>
//         <div style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00FFAB, #FFD700)", height: "100%", transition: "width 0.4s" }}></div>
//       </div>
//       <p style={{ textAlign: "center", marginBottom: "20px" }}>Today: {completedCount}/{routine.length} tasks completed</p>

//       <button
//         onClick={() => setShowHistory(!showHistory)}
//         style={{
//           background: "#FFD700",
//           border: "none",
//           color: "#1E1E2F",
//           padding: "10px 20px",
//           borderRadius: "8px",
//           cursor: "pointer",
//           fontWeight: "bold",
//           marginBottom: "20px"
//         }}
//       >
//         {showHistory ? "Hide History" : "Show History"}
//       </button>

//       {showHistory && (
//         <div style={{ marginBottom: "20px", textAlign: "center" }}>
//           <h3 style={{ color: "#00FFAB" }}>📊 Task History</h3>
//           {Object.keys(allData).sort((a,b) => a-b).map(day => {
//             const dayTasks = allData[day];
//             return (
//               <div key={day} style={{ marginBottom: "10px", borderBottom: "1px solid #444", paddingBottom: "5px" }}>
//                 <strong>Day {day}:</strong>
//                 <ul style={{ listStyle: "none", padding: 0 }}>
//                   {routine.map((task, idx) => (
//                     <li key={idx} style={{ color: dayTasks[idx] ? "#00FFAB" : "#FF4D4D" }}>
//                       {dayTasks[idx] ? "✅" : "❌"} {task.task}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             );
//           })}
//           <p>Overall progress: {overallProgress}%</p>
//         </div>
//       )}

//       <div>
//         {routine.map((item, index) => (
//           <div key={index} style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             padding: "10px",
//             marginBottom: "8px",
//             background: completed[index] ? "#00FFAB33" : "#222",
//             borderRadius: "8px"
//           }}>
//             <div>
//               <strong>{item.time}</strong> - {item.task}
//             </div>
//             <button
//               onClick={() => toggleCheck(index)}
//               style={{
//                 background: completed[index] ? "#FFD700" : "#00FFAB",
//                 border: "none",
//                 padding: "6px 12px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 color: "#111"
//               }}
//             >
//               {completed[index] ? "✔ Done" : "Mark"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
