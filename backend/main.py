from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import fitz  # PyMuPDF
from groq import Groq
from dotenv import load_dotenv
from supabase import create_client, Client
from auth import hash_password, verify_password, create_access_token
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="AI Career Advisor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_KEY = os.getenv("GROQ_API_KEY")
SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_KEY")

if not all([GROQ_KEY, SB_URL, SB_KEY]):
    print("⚠️  Warning: Missing one or more environment variables")

client = Groq(api_key=GROQ_KEY)
supabase: Client = create_client(SB_URL, SB_KEY)

# ─── GROQ HELPER ────────────────────────────────────────────────────────────

def groq_json(system: str, user: str, max_tokens: int = 600) -> dict:
    """Optimised Groq call – always returns parsed JSON or raises."""
    res = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        max_tokens=max_tokens,
        temperature=0.4,  # lower = faster, more consistent
    )
    return json.loads(res.choices[0].message.content)


def groq_text(system: str, user: str, max_tokens: int = 350) -> str:
    """Optimised Groq call – returns plain text."""
    res = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        model="llama-3.3-70b-versatile",
        max_tokens=max_tokens,
        temperature=0.5,
    )
    return res.choices[0].message.content.strip()


# ─── MODELS ─────────────────────────────────────────────────────────────────

class RoadmapStep(BaseModel):
    title: str
    status: str
    desc: str
    skills: List[str]
    icon: str

class CareerResponse(BaseModel):
    career_path: str
    match_score: int
    steps: List[RoadmapStep]

class MarketInsightRequest(BaseModel):
    role: str
    region: str = "Global"

class GapAnalysisRequest(BaseModel):
    user_id: str
    target_role: str

class InterviewPrepRequest(BaseModel):
    target_role: str
    skills: List[str]

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: Optional[List[dict]] = []   # NEW: multi-turn support

class ProgressUpdate(BaseModel):
    user_id: str
    completed_skill: str

class UserAuth(BaseModel):
    email: str
    password: str

class RoadmapRequest(BaseModel):
    user_id: str
    target_role: str

class AssessmentRequest(BaseModel):          # NEW
    answers: List[str]                       # list of raw answers
    interests: str                           # free text e.g. "math, arts, coding"
    education_level: str                     # "school", "college", "graduate", "working"

class CareerExploreRequest(BaseModel):       # NEW
    field: str                               # e.g. "medicine", "design", "finance"

# ─── HEALTH ─────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "Backend is running", "database": "Connected" if SB_URL else "Disconnected"}


# ─── PROFILE ─────────────────────────────────────────────────────────────────

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Fetch profile by user ID — used by the dashboard for dynamic stats."""
    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── AUTH ────────────────────────────────────────────────────────────────────

@app.post("/signup")
async def signup(user: UserAuth):
    hashed = hash_password(user.password)
    try:
        existing = supabase.table("users").select("id").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="This email is already registered.")
        supabase.table("users").insert({
            "email": user.email,
            "password": hashed,
            "created_at": "now()"
        }).execute()
        return {"message": "Account created successfully", "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
async def login(user: UserAuth):
    try:
        res = supabase.table("users").select("*").eq("email", user.email).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="Email not found")
        db_user = res.data[0]
        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect password")
        token = create_access_token(data={"sub": user.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": db_user["id"],
            "email": db_user["email"],
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Authentication system error")


# ─── RESUME ──────────────────────────────────────────────────────────────────

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs allowed")
    try:
        pdf_content = await file.read()
        doc = fitz.open(stream=pdf_content, filetype="pdf")
        full_text = "".join([page.get_text() for page in doc])

        data = groq_json(
            system='Extract resume info. Return ONLY valid JSON, no extra text.',
            user=(
                'Extract: {"full_name":"","email":"","skills":[],"experience":[],"education":[]}\n'
                f'Resume (first 2500 chars):\n{full_text[:2500]}'
            ),
            max_tokens=400,
        )

        supabase.table("profiles").upsert({
            "email": data.get("email", ""),
            "full_name": data.get("full_name", ""),
            "skills": data.get("skills", []),
            "education": data.get("education", []),
        }, on_conflict="email").execute()

        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/improve-resume")
async def improve_resume(user_id: str = Query(...)):
    try:
        user = supabase.table("profiles").select("raw_resume_text").eq("id", user_id).single().execute()
        text = user.data.get("raw_resume_text", "") if user.data else ""
        if not text:
            raise HTTPException(status_code=404, detail="No resume text found. Please upload your resume first.")
        result = groq_text(
            system="You are an elite resume coach. Rewrite bullets to be impact-driven with metrics. Be concise.",
            user=f"Rewrite these resume bullets with strong action verbs and measurable results:\n{text[:1200]}",
            max_tokens=400,
        )
        return {"suggestions": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── ROADMAP ─────────────────────────────────────────────────────────────────

@app.post("/generate-roadmap", response_model=CareerResponse)
async def generate_roadmap(request: RoadmapRequest):
    try:
        res = supabase.table("profiles").select("skills").eq("id", request.user_id).execute()
        user_skills = [s.lower() for s in (res.data[0].get("skills", []) if res.data else [])]

        ai_data = groq_json(
            system='You are a career architect. Return ONLY compact JSON.',
            user=(
                f'Target: {request.target_role}\nCurrent skills: {user_skills or ["none"]}\n'
                'Return 3 phases as JSON: {"steps":[{"title":"","desc":"(max 120 chars)",'
                '"skills":["skill1","skill2","skill3"],"icon":"db|layers|cpu|rocket"}]}'
            ),
            max_tokens=500,
        )

        raw_steps = ai_data.get("steps", [])
        processed = []
        found_current = False

        for step in raw_steps:
            step_skills = [s.lower() for s in step.get("skills", [])]
            match_count = sum(1 for s in step_skills if any(u in s for u in user_skills))
            ratio = match_count / max(len(step_skills), 1)

            if ratio >= 0.5:
                status = "completed"
            elif not found_current:
                status = "current"
                found_current = True
            else:
                status = "upcoming"

            processed.append(RoadmapStep(
                title=step.get("title", "Phase"),
                status=status,
                desc=step.get("desc", ""),
                skills=step.get("skills", []),
                icon=step.get("icon", "layers"),
            ))

        match_score = min(60 + len(user_skills) * 3, 97)
        return CareerResponse(career_path=request.target_role, match_score=match_score, steps=processed)

    except Exception as e:
        print(f"Roadmap Error: {e}")
        raise HTTPException(status_code=500, detail="Trajectory calculation failed")


# ─── MARKET INSIGHTS ─────────────────────────────────────────────────────────

@app.post("/market-insights")
async def get_market_insights(request: MarketInsightRequest):
    try:
        currency_hint = "Use Indian Rupee (₹ LPA format) for salary." if "India" in request.region else "Use USD annual salary."
        data = groq_json(
            system='You are a concise labor market analyst. Return ONLY JSON.',
            user=(
                f'Role: {request.role}, Region: {request.region}. {currency_hint} '
                'Return: {"salary_range":"","demand_level":"High|Medium|Low",'
                '"trending_skills":["s1","s2","s3"],"top_companies":["c1","c2","c3"],'
                '"growth_outlook":"1 sentence","remote_friendly":true}'
            ),
            max_tokens=350,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Market data unavailable")


# ─── GAP ANALYSIS ────────────────────────────────────────────────────────────

@app.post("/analyze-gap")
async def analyze_gap(request: GapAnalysisRequest):
    try:
        res = supabase.table("profiles").select("skills").eq("id", request.user_id).execute()
        if not res.data:
            return {
                "missing_skills": ["Upload your resume first"],
                "certifications": ["No profile found"],
                "suggested_project": "Complete your profile to get a personalised project recommendation!",
            }

        current_skills = res.data[0].get("skills", [])
        data = groq_json(
            system='Career gap analyst. Return ONLY JSON. Be specific and concise.',
            user=(
                f'Current skills: {current_skills}\nTarget: {request.target_role}\n'
                'Return: {"missing_skills":["5 specific skills"],"certifications":["3 certs with provider"],'
                '"suggested_project":"1 sentence project idea that bridges the gap"}'
            ),
            max_tokens=350,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to analyze gap")


# ─── INTERVIEW PREP ──────────────────────────────────────────────────────────

@app.post("/mock-interview-prep")
async def get_interview_questions(request: InterviewPrepRequest):
    try:
        data = groq_json(
            system='Expert technical interviewer. Return ONLY JSON.',
            user=(
                f'Role: {request.target_role}, Skills: {", ".join(request.skills[:6])}.\n'
                'Return: {"technical":["3 specific technical questions"],'
                '"behavioral":["2 situational questions"]}'
            ),
            max_tokens=400,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate interview questions")


#─── SOUL CHAT ───────────────────────────────────────────────────────────────

@app.post("/career-soul-chat")
async def soul_chat(request: ChatRequest):
    system_prompt = (
        "You are 'Soul', a warm and direct career mentor for students and professionals of ALL fields — "
        "tech, medicine, arts, business, design, law, and more. "
        "Give honest, empathetic advice. Be concise (2-4 sentences max). "
        "If stressed, validate first. If stuck, give one clear next step."
    )
    try:
        # Build multi-turn history
        messages = [{"role": "system", "content": system_prompt}]
        for h in (request.history or [])[-6:]:   # keep last 6 turns for context
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": request.message})

        res = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            max_tokens=250,
            temperature=0.6,
        )
        return {"response": res.choices[0].message.content.strip()}
    except Exception:
        raise HTTPException(status_code=500, detail="Soul is resting. Try again shortly.")


# ─── MENTOR MATCH ────────────────────────────────────────────────────────────

@app.post("/mentor-match")
async def get_mentor_recommendation(user_id: str = Query(...)):
    try:
        user = supabase.table("profiles").select("skills, education").eq("id", user_id).single().execute()
        data = groq_json(
            system='Career coach. Return ONLY JSON.',
            user=(
                f'Skills: {user.data.get("skills")}, Education: {user.data.get("education")}.\n'
                'Suggest 3 mentor types. Return: {"mentors":[{"type":"","reason":"1 sentence","find_at":"platform"}]}'
            ),
            max_tokens=300,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Mentor matching failed")


# ─── PROGRESS ────────────────────────────────────────────────────────────────

@app.post("/update-progress")
async def update_progress(request: ProgressUpdate):
    try:
        user = supabase.table("profiles").select("skills").eq("id", request.user_id).single().execute()
        skills = user.data.get("skills", []) if user.data else []
        if request.completed_skill not in skills:
            skills.append(request.completed_skill)
        supabase.table("profiles").update({"skills": skills}).eq("id", request.user_id).execute()
        readiness_score = min(len(skills) * 5, 100)
        return {"message": f"Skill '{request.completed_skill}' added!", "new_readiness_score": readiness_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Progress update failed")


# ─── NEW: CAREER ASSESSMENT ──────────────────────────────────────────────────

@app.post("/career-assessment")
async def career_assessment(request: AssessmentRequest):
    """
    Takes quiz answers + interests and recommends 3 career paths across ALL fields.
    """
    try:
        data = groq_json(
            system='Career counsellor for ALL fields (tech, arts, medicine, law, business, design, etc.). Return ONLY JSON.',
            user=(
                f'Student answers: {request.answers}\n'
                f'Interests: {request.interests}\n'
                f'Education level: {request.education_level}\n'
                'Recommend 3 career paths (not only tech). '
                'Return: {"careers":[{"title":"","field":"","match_score":85,'
                '"why":"1 sentence","first_step":"1 actionable step","salary_range":""}]}'
            ),
            max_tokens=500,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Assessment failed")


# ─── NEW: EXPLORE CAREER FIELD ───────────────────────────────────────────────

@app.post("/explore-field")
async def explore_field(request: CareerExploreRequest):
    """
    Returns an overview of any career field: roles, entry paths, skills needed.
    """
    try:
        data = groq_json(
            system='Career encyclopedia. Return ONLY compact JSON.',
            user=(
                f'Field: {request.field}\n'
                'Return: {"overview":"2 sentences","top_roles":["r1","r2","r3","r4"],'
                '"entry_paths":["path1","path2"],"key_skills":["s1","s2","s3","s4"],'
                '"avg_salary":"","job_outlook":"High|Medium|Low"}'
            ),
            max_tokens=350,
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Field exploration failed")