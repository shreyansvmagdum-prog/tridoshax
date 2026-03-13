from fastapi import APIRouter, Depends
from app.questionnaire_config import QUESTIONNAIRE
from app.auth import get_current_user
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.scoring_service import calculate_dosha_scores
from app.models import Result
from app.recommendation import generate_recommendations
from app.health_logic import calculate_bmi, generate_disease_risk
from app.ml_model import predict_dosha, dosha_name
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi import Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from reportlab.platypus import ListFlowable, ListItem, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime
from app.database import get_db
from app.auth import get_current_user
from app import models
from app.models import User, Result
from app.health_logic import calculate_bmi
from app.recommendation import generate_recommendations
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import HRFlowable, KeepTogether
from reportlab.platypus.flowables import Flowable
import os


router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)

@router.get("/questions")
def get_questions(current_user: models.User = Depends(get_current_user)):
    return {"questions": QUESTIONNAIRE}

router = APIRouter(prefix="/assessment", tags=["Assessment"])

from app.questionnaire_config import QUESTIONNAIRE

@router.get("/questionnaire")
def get_questionnaire():
    return {
        "sections": QUESTIONNAIRE
    }

@router.post("/submit")
def submit_assessment(
    assessment_data: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)   # ⭐ AUTH ENABLED
):
    # 1️⃣ Create Assessment linked to logged-in user
    new_assessment = models.Assessment(user_id=current_user.id)
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    # 2️⃣ Store Answers
    saved_answers = []

    for ans in assessment_data.answers:
        new_answer = models.Answer(
            assessment_id=new_assessment.id,
            question_id=ans.question_id,
            selected_option=ans.selected_option
        )
        db.add(new_answer)
        saved_answers.append(new_answer)

    db.commit()

    # 3️⃣ Prepare ML Features
    mapping = {"A": 0, "B": 1, "C": 2}
    features = [mapping.get(ans.selected_option) for ans in saved_answers]

    prediction = predict_dosha(features)
    ml_primary_dosha = dosha_name(prediction)

    # 4️⃣ Calculate Dosha Scores
    scores = calculate_dosha_scores(saved_answers)

    # 5️⃣ Store Result in DB
    result = models.Result(
        assessment_id=new_assessment.id,
        vata_score=scores["vata"],
        pitta_score=scores["pitta"],
        kapha_score=scores["kapha"],
        primary_dosha=ml_primary_dosha,
        secondary_dosha=scores["secondary"],
        confidence=scores["confidence"]
    )

    db.add(result)
    db.commit()
    db.refresh(result)

    # 6️⃣ Return Response
    return {
        "message": "Assessment submitted successfully",
        "result": {
            "primary_dosha": result.primary_dosha,
            "secondary_dosha": result.secondary_dosha,
            "vata_score": result.vata_score,
            "pitta_score": result.pitta_score,
            "kapha_score": result.kapha_score,
            "confidence": result.confidence
        }
    }

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1️⃣ Get latest assessment of user
    latest_assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.created_at.desc())
        .first()
    )

    if not latest_assessment:
        return {"message": "No assessment found"}

    # 2️⃣ Get result linked to assessment
    result = (
        db.query(models.Result)
        .filter(models.Result.assessment_id == latest_assessment.id)
        .first()
    )

    if not result:
        return {"message": "Result not found"}

    # 3️⃣ Temporary recommendation logic (we improve later)
    recommendations = generate_recommendations(result.primary_dosha)

    # 3.5️⃣ Calculate BMI
    bmi_value, bmi_category = calculate_bmi(
    current_user.weight_kg,
    current_user.height_cm
    )

    # 3.6️⃣ Generate Disease Risk
    disease_risk = generate_disease_risk(
    result.primary_dosha,
    bmi_category
    )

    # 4️⃣ Return full dashboard response
    return {
        "user": {
            "name": current_user.name,
            "age": current_user.age,
            "gender": current_user.gender,
            "height_cm": current_user.height_cm,
            "weight_kg": current_user.weight_kg
        },
        "dosha": {
            "assessment_id": latest_assessment.id, 
            "primary": result.primary_dosha,
            "secondary": result.secondary_dosha,
            "vata_score": result.vata_score,
            "pitta_score": result.pitta_score,
            "kapha_score": result.kapha_score,
            "confidence": result.confidence
        },
            "health_metrics": {
            "bmi": bmi_value,
            "bmi_category": bmi_category
        },
            "disease_risk": disease_risk,
            "recommendations": recommendations
    }

@router.get("/history")
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.created_at.desc())
        .all()
    )

    history = []

    for assessment in assessments:

        result = (
            db.query(models.Result)
            .filter(models.Result.assessment_id == assessment.id)
            .first()
        )

        if result:
            history.append({
                "assessment_id": assessment.id,
                "date":  assessment.created_at.strftime("%Y-%m-%d"),
                "primary_dosha": result.primary_dosha,
                "secondary_dosha": result.secondary_dosha,
                "vata_score": result.vata_score,
                "pitta_score": result.pitta_score,
                "kapha_score": result.kapha_score,
                "confidence": result.confidence
            })

    return {
        "user": current_user.name,
        "total_assessments": len(history),
        "history": history
    }

# ── Palette ────────────────────────────────────────────────────────────────
_C_DARK  = colors.HexColor("#1B4332")
_C_MID   = colors.HexColor("#2D6A4F")
_C_LIGHT = colors.HexColor("#D8F3DC")
_C_ACC   = colors.HexColor("#40916C")
_C_RULE  = colors.HexColor("#B7E4C7")
_C_TXT   = colors.HexColor("#1A1A2E")
_C_MUTE  = colors.HexColor("#6B7280")

_DOSHA_CLR = {
    "Vata":  colors.HexColor("#7B9CCF"),
    "Pitta": colors.HexColor("#D4813E"),
    "Kapha": colors.HexColor("#5B8A5B"),
}


# ── Canvas header/footer drawn on every page ───────────────────────────────
def _draw_page(canvas, doc, report_id, patient_name):
    w, h = letter
    canvas.saveState()

    # Dark brand band across the top
    canvas.setFillColor(_C_DARK)
    canvas.rect(0, h - 52, w, 52, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 15)
    canvas.drawString(40, h - 28, "TriDoshaX")
    canvas.setFont("Helvetica", 9)
    canvas.drawString(40, h - 42, "AI-Based Ayurvedic Constitution Analysis")
    canvas.setFillColor(_C_RULE)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(w - 40, h - 28, f"Report ID: {report_id}")
    canvas.drawRightString(w - 40, h - 40, datetime.now().strftime("%d %B %Y"))

    # Slim footer line + disclaimer + page number
    canvas.setStrokeColor(_C_RULE)
    canvas.setLineWidth(0.5)
    canvas.line(40, 36, w - 40, 36)
    canvas.setFont("Helvetica-Oblique", 7.5)
    canvas.setFillColor(_C_MUTE)
    canvas.drawString(40, 22,
        "This report is AI-generated and not a substitute for professional medical advice.")
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(w - 40, 22, f"Page {doc.page}")

    canvas.restoreState()


# ── Summary card (custom Flowable) ─────────────────────────────────────────
class _SummaryBox(Flowable):
    """Mint-tinted result card with dosha-coloured left accent bar."""
    def __init__(self, primary, secondary, confidence, width):
        super().__init__()
        self._p, self._s, self._c = primary, secondary, confidence
        self._width, self._height = width, 72

    def wrap(self, *_):
        return self._width, self._height

    def draw(self):
        c, w, h = self.canv, self._width, self._height
        c.setFillColor(_C_LIGHT)
        c.roundRect(0, 0, w, h, 6, fill=1, stroke=0)
        c.setFillColor(_DOSHA_CLR.get(self._p, _C_ACC))
        c.roundRect(0, 0, 6, h, 3, fill=1, stroke=0)
        labels = ["Primary Dosha", "Secondary Dosha", "AI Confidence"]
        values = [self._p, self._s or "—", f"{self._c}%"]
        for i, (lbl, val) in enumerate(zip(labels, values)):
            x = 20 + i * (w / 3)
            c.setFont("Helvetica", 7.5)
            c.setFillColor(_C_MUTE)
            c.drawString(x, h - 22, lbl.upper())
            c.setFont("Helvetica-Bold", 16)
            c.setFillColor(_DOSHA_CLR.get(val, _C_DARK))
            c.drawString(x, h - 52, val)


# ── Section helpers ─────────────────────────────────────────────────────────
def _srule():
    return HRFlowable(width="100%", thickness=0.8, color=_C_ACC,
                      spaceAfter=6, spaceBefore=2)

def _trule():
    return HRFlowable(width="100%", thickness=0.3, color=_C_RULE,
                      spaceAfter=4, spaceBefore=4)

def _bullets(items, sty):
    return ListFlowable(
        [ListItem(Paragraph(item, sty), leftIndent=12, bulletColor=_C_ACC)
         for item in items],
        bulletType="bullet", leftIndent=16, spaceBefore=4, spaceAfter=4,
    )


# ── Main endpoint ───────────────────────────────────────────────────────────
@router.get("/report/{assessment_id}")
def download_report(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # ================= VERIFY ASSESSMENT =================

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    result: Result = (
        db.query(models.Result)
        .filter(models.Result.assessment_id == assessment_id)
        .first()
    )

    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    # ================= FILE PATH =================

    file_path: str = f"report_{assessment_id}.pdf"

    # ================= PAGE GEOMETRY =================

    LEFT = RIGHT = 40
    TOP  = 72          # clears the canvas header band
    BOT  = 52          # clears the canvas footer
    page_w, _ = letter
    cw = page_w - LEFT - RIGHT   # usable content width ≈ 6.35 in

    # ================= PDF DOCUMENT =================

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=RIGHT,
        leftMargin=LEFT,
        topMargin=TOP,
        bottomMargin=BOT,
    )

    # Canvas callbacks supply the persistent header/footer on every page
    def _first(c, d):  _draw_page(c, d, assessment_id, current_user.name)
    def _later(c, d):  _draw_page(c, d, assessment_id, current_user.name)

    # ================= STYLES =================

    _base = getSampleStyleSheet()

    _sec = ParagraphStyle("_sec", fontName="Helvetica-Bold", fontSize=10,
                           textColor=_C_MID, spaceBefore=14, spaceAfter=4)
    _sub = ParagraphStyle("_sub", fontName="Helvetica-Bold", fontSize=9,
                           textColor=_C_MID, spaceBefore=10, spaceAfter=3)
    _bod = ParagraphStyle("_bod", parent=_base["Normal"], fontName="Helvetica",
                           fontSize=9, textColor=_C_TXT, leading=13)
    _dis = ParagraphStyle("_dis", fontName="Helvetica-Oblique", fontSize=8,
                           textColor=_C_MUTE, alignment=TA_CENTER, spaceBefore=8)
    _ttl = ParagraphStyle("_ttl", fontName="Helvetica-Bold", fontSize=18,
                       textColor=_C_DARK, alignment=TA_CENTER, spaceAfter=2,
                       leading=22)
    _stl = ParagraphStyle("_stl", fontName="Helvetica", fontSize=9,
                       textColor=_C_MUTE, alignment=TA_CENTER, spaceAfter=10,
                       leading=13)
    _cpy = ParagraphStyle("_cpy", fontName="Helvetica", fontSize=7.5,
                           textColor=_C_MUTE, alignment=TA_CENTER)

    elements = []

    # ================= TITLE BLOCK =================

    elements += [
        Spacer(1, 6),
        Paragraph("WELLNESS ASSESSMENT REPORT", _ttl),
        Paragraph("Ayurvedic Prakriti Analysis  ·  Powered by TriDoshaX AI", _stl),
        _srule(),
    ]

    # ================= SUMMARY CARD =================

    elements += [
        Spacer(1, 8),
        _SummaryBox(result.primary_dosha, result.secondary_dosha,
                    result.confidence, width=cw),
        Spacer(1, 14),
    ]

    # ================= PATIENT INFORMATION =================

    patient_data = [
        ["Name",   current_user.name],
        ["Age",    str(current_user.age)],
        ["Gender", current_user.gender],
        ["Height", f"{current_user.height_cm} cm"],
        ["Weight", f"{current_user.weight_kg} kg"],
    ]
    patient_table = Table(patient_data, colWidths=[1.6 * inch, cw - 1.6 * inch])
    patient_table.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, -1), _C_LIGHT),
        ("TEXTCOLOR",     (0, 0), (0, -1), _C_DARK),
        ("FONTNAME",      (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",      (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS",(0, 0), (-1, -1),
            [colors.white, colors.HexColor("#F8FAF8")]),
        ("GRID",          (0, 0), (-1, -1), 0.4, _C_RULE),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]))
    elements.append(KeepTogether([
        Paragraph("PATIENT INFORMATION", _sec), _srule(), patient_table
    ]))
    elements.append(Spacer(1, 16))

    # ================= DOSHA SCORES =================

    _th = ParagraphStyle("_th", fontName="Helvetica-Bold", fontSize=8.5,
                      textColor=colors.white, alignment=TA_CENTER)

    score_data = [
        [Paragraph("Dosha", _th), Paragraph("Score", _th)],
        *[
            [
                Paragraph(d, ParagraphStyle(f"_dn{d}", fontName="Helvetica-Bold",
                    fontSize=9, textColor=colors.white, alignment=TA_CENTER)),
                Paragraph(str(s), ParagraphStyle(f"_ds{d}", fontName="Helvetica-Bold",
                    fontSize=12, textColor=_C_TXT, alignment=TA_CENTER)),
            ]
            for d, s in [
                ("Vata",  result.vata_score),
                ("Pitta", result.pitta_score),
                ("Kapha", result.kapha_score),
            ]
        ]
    ]

    score_table = Table(score_data, colWidths=[cw * 0.4, cw * 0.6])

    score_style = [
        ("BACKGROUND",    (0, 0), (-1, 0), _C_MID),
        ("GRID",          (0, 0), (-1, -1), 0.4, _C_RULE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1),
            [colors.white, colors.HexColor("#F8FAF8")]),
        ("TOPPADDING",    (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i, dosha in enumerate(["Vata", "Pitta", "Kapha"], 1):
        score_style.append(("BACKGROUND", (0, i), (0, i), _DOSHA_CLR[dosha]))

    score_table.setStyle(TableStyle(score_style))

    elements.append(KeepTogether([
        Paragraph("DOSHA SCORES", _sec), _srule(), score_table
    ]))
    elements.append(Spacer(1, 16))

    # ================= RECOMMENDATIONS =================

    recommendations = generate_recommendations(result.primary_dosha)

    elements.append(KeepTogether([
        Paragraph("RECOMMENDATIONS", _sec),
        _srule(),
        Paragraph(
            f"The following recommendations are tailored for a "
            f"<b>{result.primary_dosha}</b>-dominant constitution.", _bod),
        Spacer(1, 8),
    ]))

    # Diet
    elements.append(Paragraph("Dietary Recommendations", _sub))
    elements.append(_trule())
    elements.append(_bullets(recommendations["diet"]["include"][:5], _bod))
    elements.append(Spacer(1, 8))

    # Lifestyle
    elements.append(Paragraph("Lifestyle Advice", _sub))
    elements.append(_trule())
    elements.append(_bullets(recommendations["lifestyle"][:5], _bod))
    elements.append(Spacer(1, 8))

    # Panchakarma
    elements.append(Paragraph("Panchakarma Therapy", _sub))
    elements.append(_trule())
    elements.append(_bullets(recommendations["panchakarma"][:5], _bod))
    elements.append(Spacer(1, 24))

    # ================= DISCLAIMER =================

    elements += [
        _srule(),
        Paragraph(
            "This report is generated by an AI system for informational purposes only. "
            "It does not constitute medical advice, diagnosis, or treatment. "
            "Please consult a qualified Ayurvedic or medical practitioner before "
            "making any health decisions.",
            _dis),
        Spacer(1, 4),
        Paragraph("TriDoshaX © 2026  |  Confidential Patient Document", _cpy),
    ]

    # ================= BUILD PDF =================

    doc.build(elements, onFirstPage=_first, onLaterPages=_later)

    # ================= RETURN FILE =================

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="TriDoshaX_Report.pdf"
    )