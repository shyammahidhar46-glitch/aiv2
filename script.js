// ==========================================
// 1. PASTE YOUR GOOGLE AI STUDIO API KEY HERE
// ==========================================
const GOOGLE_API_KEY = "AIzaSyC10rdcDHK1rtikJKmbsjMTMhl6CUBoROo"; 
// ==========================================


let myChart = null;

// =====================
// DATA STATE
// =====================
const defaultData = {
    water: 0, steps: 0, calories: 0, protein: 0, mood: 'None Logged',
    historySteps: [4500, 6200, 5800, 8100, 7500, 9200, 0], 
    historyCals: [2100, 2400, 2200, 2500, 2300, 2800, 0]
};

let userData = JSON.parse(JSON.stringify(defaultData));

const workouts = {
    1: ["Pushups - 3 sets of 15", "Dumbbell Press - 3 sets of 12", "Tricep Dips - 3 sets of 15", "Plank - 60 seconds"],
    2: ["Squats - 4 sets of 15", "Lunges - 3 sets of 12 per leg", "Calf Raises - 4 sets of 20", "Wall Sit - 60 seconds"],
    3: ["Active Recovery: 30 Min Yoga", "Light Stretching", "Brisk 20 Min Walk"]
};

// =====================
// INITIALIZATION
// =====================
window.onload = () => {
    const savedUser = localStorage.getItem("user");
    if(savedUser) {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "block";
        document.getElementById("welcomeMessage").innerText = `Welcome, ${savedUser}.`;
        
        loadData();
        updateUI();
        loadWorkout();
    }
};

function login(){
    const user = document.getElementById("username").value.trim();
    if(!user){ alert("Please provide a name."); return; }

    localStorage.setItem("user", user);
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("welcomeMessage").innerText = `Welcome, ${user}.`;

    loadData();
    updateUI();
    loadWorkout();
}

function logout(){
    localStorage.removeItem("user"); 
    location.reload();
}

function wipeData() {
    if (confirm("Are you sure you want to permanently delete all your health data? This cannot be undone.")) {
        localStorage.removeItem("user");
        localStorage.removeItem("auraHealthData");
        location.reload();
    }
}

function showSection(sectionId){
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active-section"));
    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));

    document.getElementById(sectionId).classList.add("active-section");
    document.getElementById(`nav-${sectionId}`).classList.add("active");

    if(sectionId === 'analysis') renderChart();
}

// =====================
// DATA MANAGEMENT
// =====================
function loadData() {
    const savedData = localStorage.getItem('auraHealthData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        userData = { ...userData, ...parsed };
        if (!userData.historySteps) userData.historySteps = [...defaultData.historySteps];
        if (!userData.historyCals) userData.historyCals = [...defaultData.historyCals];
    }
    userData.historySteps[6] = userData.steps;
    userData.historyCals[6] = userData.calories;
}

function saveData() {
    userData.historySteps[6] = userData.steps;
    userData.historyCals[6] = userData.calories;
    localStorage.setItem('auraHealthData', JSON.stringify(userData));
    updateUI();
    
    if(myChart) {
        myChart.data.datasets[0].data = userData.historySteps;
        myChart.data.datasets[1].data = userData.historyCals;
        myChart.update();
    }
}

function updateUI() {
    document.getElementById("waterDisplay").innerText = `${userData.water} / 8 Glasses`;
    document.getElementById("stepsDisplay").innerText = `${userData.steps.toLocaleString()} Steps`;
    document.getElementById("caloriesDisplay").innerText = `${userData.calories.toLocaleString()} kcal`;
    document.getElementById("proteinDisplay").innerText = `${userData.protein} g`;
    document.getElementById("moodDisplay").innerText = userData.mood;
}

// =====================
// FEATURE FUNCTIONS
// =====================
function addWater() { userData.water += 1; saveData(); }
function subWater() { if (userData.water > 0) { userData.water -= 1; saveData(); } }

function addSteps() {
    const input = document.getElementById("stepInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.steps += val;
        input.value = '';
        saveData();
    }
}
function subSteps() {
    const input = document.getElementById("stepInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.steps = Math.max(0, userData.steps - val);
        input.value = '';
        saveData();
    }
}

function addCalories() {
    const input = document.getElementById("calInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.calories += val;
        input.value = '';
        saveData();
    }
}
function subCalories() {
    const input = document.getElementById("calInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.calories = Math.max(0, userData.calories - val);
        input.value = '';
        saveData();
    }
}

function addProtein() {
    const input = document.getElementById("proteinInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.protein += val;
        input.value = '';
        saveData();
    }
}
function subProtein() {
    const input = document.getElementById("proteinInput");
    const val = parseInt(input.value);
    if(!isNaN(val) && val > 0) {
        userData.protein = Math.max(0, userData.protein - val);
        input.value = '';
        saveData();
    }
}

function setMood(mood) { userData.mood = mood; saveData(); }

function loadWorkout() {
    const day = new Date().getDay(); 
    let routineKey = (day % 3) + 1; 
    let routineName = routineKey === 1 ? "Upper Body Focus" : (routineKey === 2 ? "Lower Body Power" : "Active Recovery");
    document.getElementById("workoutDay").innerText = routineName;

    const list = document.getElementById("workoutList");
    list.innerHTML = ""; 

    workouts[routineKey].forEach(exercise => {
        let li = document.createElement("li");
        li.innerText = exercise;
        list.appendChild(li);
    });
}

// =====================
// CHART RENDERING
// =====================
function renderChart() {
    const ctx = document.getElementById('trendChart');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
            datasets: [
                {
                    type: 'bar', label: 'Steps', data: userData.historySteps,
                    backgroundColor: '#d4af37', borderRadius: 6, yAxisID: 'y'
                },
                {
                    type: 'line', label: 'Calories', data: userData.historyCals,
                    borderColor: '#fdfdfd', borderWidth: 2, tension: 0.4,
                    pointBackgroundColor: '#070708', pointBorderColor: '#fdfdfd', yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: '#8e8e93', font: { family: 'Montserrat' } } },
                tooltip: { backgroundColor: 'rgba(18, 18, 20, 0.9)', titleColor: '#d4af37', bodyColor: '#fdfdfd', borderColor: 'rgba(212, 175, 55, 0.3)', borderWidth: 1, padding: 10 }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#8e8e93', font: { family: 'Montserrat' } } },
                y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#d4af37' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { display: false }, ticks: { color: '#fdfdfd' } }
            }
        }
    });
}

// =====================
// GOOGLE AI INTEGRATION
// =====================
async function generateReport() {
    const outputDiv = document.getElementById("aiReportOutput");
    const loadingDiv = document.getElementById("aiLoading");
    const generateBtn = document.getElementById("generateBtn");

    if (GOOGLE_API_KEY === "AIzaSyC10rdcDHK1rtikJKmbsjMTMhl6CUBoROo" || !GOOGLE_API_KEY) { 
        alert("Error: You need to paste your API key at the top of the script.js file."); 
        return; 
    }

    outputDiv.style.display = "none";
    loadingDiv.style.display = "block";
    generateBtn.disabled = true;

    const promptText = `
    You are an elite, highly analytical health and fitness coach. Analyze my current health data and provide a concise, 3-point action plan to improve my physical conditioning, optimize my gym performance, and support muscle growth.

    Here is my current data for today:
    - Water Intake: ${userData.water} glasses
    - Steps: ${userData.steps}
    - Calories: ${userData.calories} kcal
    - Protein: ${userData.protein} grams
    - Mood/Clarity: ${userData.mood}

    Format the response clearly with short headings. Do not use markdown like asterisks, just use capital letters for emphasis if needed. Keep it under 150 words. Be direct and realistic.
    `;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`;
    
    const requestBody = { contents: [{ parts: [{ text: promptText }] }] };

    try {
        const response = await fetch(endpoint, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        let aiText = data.candidates[0].content.parts[0].text;
        
        outputDiv.innerHTML = aiText.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\n/g, '<br>'); 
        outputDiv.style.display = "block";

    } catch (error) {
        console.error("Failed to generate report:", error);
        outputDiv.innerHTML = `<span style="color: #ff6b6b;">Failed to connect to the AI. Check your API key and internet connection.</span>`;
        outputDiv.style.display = "block";
    } finally {
        loadingDiv.style.display = "none";
        generateBtn.disabled = false;
    }
}
