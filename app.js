// ----- Demo Data -----
const ALL_INTERESTS = [
  "Technology",
  "Arts",
  "Management",
  "Sports",
  "Cultural Activities",
  "Entrepreneurship"
];

const EVENTS = [
  {
    id: 1,
    title: "Inter-College Hackathon",
    interest: "Technology",
    date: "10 Dec",
    skills: ["Technical Ability", "Teamwork", "Problem Solving"]
  },
  {
    id: 2,
    title: "Drama & Theatre Night",
    interest: "Arts",
    date: "14 Dec",
    skills: ["Creativity", "Communication", "Confidence"]
  },
  {
    id: 3,
    title: "Management Case Study Competition",
    interest: "Management",
    date: "18 Dec",
    skills: ["Leadership", "Analytical Thinking", "Teamwork"]
  },
  {
    id: 4,
    title: "Football League",
    interest: "Sports",
    date: "22 Dec",
    skills: ["Teamwork", "Discipline", "Resilience"]
  },
  {
    id: 5,
    title: "Cultural Fest: Roots & Rhythms",
    interest: "Cultural Activities",
    date: "5 Jan",
    skills: ["Creativity", "Event Management", "Collaboration"]
  },
  {
    id: 6,
    title: "Campus Startup Pitch Day",
    interest: "Entrepreneurship",
    date: "12 Jan",
    skills: ["Leadership", "Communication", "Strategic Thinking"]
  }
];

const SKILL_LIST = [
  "Technical Ability",
  "Teamwork",
  "Leadership",
  "Communication",
  "Creativity",
  "Problem Solving",
  "Event Management",
  "Analytical Thinking",
  "Discipline",
  "Resilience",
  "Collaboration",
  "Strategic Thinking",
  "Confidence"
];

// ----- State stored in localStorage -----
const STORAGE_KEY = "college_event_companion_state";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        interests: [],
        attendedEventIds: [],
        skillPoints: {}
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return {
      interests: [],
      attendedEventIds: [],
      skillPoints: {}
    };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ----- UI Elements -----
const interestListEl = document.getElementById("interest-list");
const saveInterestsBtn = document.getElementById("save-interests-btn");
const interestStatusEl = document.getElementById("interest-status");

const eventsListEl = document.getElementById("events-list");
const skillsSummaryEl = document.getElementById("skills-summary");
const resumePointsEl = document.getElementById("resume-points");

// ----- Render Interests -----
function renderInterests() {
  interestListEl.innerHTML = "";
  ALL_INTERESTS.forEach((interest) => {
    const label = document.createElement("label");
    label.className = "pill";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = interest;

    if (state.interests.includes(interest)) {
      input.checked = true;
      label.classList.add("selected");
    }

    input.addEventListener("change", () => {
      label.classList.toggle("selected", input.checked);
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(interest));
    interestListEl.appendChild(label);
  });
}

// ----- Save Interests -----
function handleSaveInterests() {
  const selected = [];
  interestListEl.querySelectorAll("input[type=checkbox]").forEach((input) => {
    if (input.checked) selected.push(input.value);
  });
  state.interests = selected;
  saveState(state);

  interestStatusEl.textContent =
    selected.length > 0
      ? "Interests saved. Events are now personalised for you."
      : "No interests selected. Showing all events.";
  renderEvents();
}

// ----- Render Events -----
function renderEvents() {
  eventsListEl.innerHTML = "";

  const activeInterests = state.interests;
  const filtered =
    activeInterests.length === 0
      ? EVENTS
      : EVENTS.filter((e) => activeInterests.includes(e.interest));

  if (filtered.length === 0) {
    eventsListEl.innerHTML =
      "<p>No events match your interests right now. Try selecting more interests.</p>";
    return;
  }

  filtered.forEach((event) => {
    const card = document.createElement("div");
    card.className = "event-card";

    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = event.title;
    left.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "event-meta";
    meta.innerHTML =
      `<span class="tag">${event.interest}</span>` +
      `<span>${event.date}</span>`;
    left.appendChild(meta);

    const skillLine = document.createElement("div");
    skillLine.className = "event-meta";
    skillLine.textContent = "Skills: ";
    event.skills.forEach((s) => {
      const chip = document.createElement("span");
      chip.className = "skill-chip";
      chip.textContent = s;
      skillLine.appendChild(chip);
    });
    left.appendChild(skillLine);

    const right = document.createElement("div");
    const btn = document.createElement("button");
    const already = state.attendedEventIds.includes(event.id);

    btn.textContent = already ? "Marked as attended" : "Mark as attended";
    btn.disabled = already;

    btn.addEventListener("click", () => {
      markEventAttended(event);
    });

    right.appendChild(btn);

    card.appendChild(left);
    card.appendChild(right);

    eventsListEl.appendChild(card);
  });
}

// ----- Mark Event Attended -----
function markEventAttended(event) {
  if (!state.attendedEventIds.includes(event.id)) {
    state.attendedEventIds.push(event.id);

    event.skills.forEach((skill) => {
      if (!state.skillPoints[skill]) state.skillPoints[skill] = 0;
      state.skillPoints[skill] += 1;
    });

    saveState(state);
    renderEvents();
    renderSkillProfile();
  }
}

// ----- Render Skill Profile -----
function getSkillLevel(points) {
  if (points >= 6) return "Advanced";
  if (points >= 3) return "Intermediate";
  return "Beginner";
}

function renderSkillProfile() {
  // Skills list
  skillsSummaryEl.innerHTML = "";

  SKILL_LIST.forEach((skill) => {
    const points = state.skillPoints[skill] || 0;
    if (points === 0) return; // only show used skills

    const row = document.createElement("div");
    row.className = "skill-row";

    const name = document.createElement("span");
    name.textContent = skill;

    const level = document.createElement("span");
    level.className = "skill-level";
    level.textContent = `${getSkillLevel(points)} (${points}× activity)`;

    row.appendChild(name);
    row.appendChild(level);

    skillsSummaryEl.appendChild(row);
  });

  if (!skillsSummaryEl.innerHTML) {
    skillsSummaryEl.innerHTML =
      "<p>No skills tracked yet. Attend events to see your growth here.</p>";
  }

  // Resume points
  resumePointsEl.innerHTML = "";

  if (state.attendedEventIds.length === 0) {
    resumePointsEl.innerHTML =
      "<li>Participated in college events to build technical and soft skills (track details as you attend).</li>";
    return;
  }

  state.attendedEventIds.forEach((eventId) => {
    const event = EVENTS.find((e) => e.id === eventId);
    if (!event) return;

    const li = document.createElement("li");
    li.textContent = `Participated in "${event.title}" ${event.interest.toLowerCase()} event, strengthening ${event.skills.join(
      ", "
    )}.`;
    resumePointsEl.appendChild(li);
  });
}

// ----- Init -----
function init() {
  renderInterests();
  renderEvents();
  renderSkillProfile();

  if (saveInterestsBtn) {
    saveInterestsBtn.addEventListener("click", handleSaveInterests);
  }
}

document.addEventListener("DOMContentLoaded", init);
