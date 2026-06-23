"""Clinical PDF Report Generator for Sentinel AI Sepsis CDSS.

Produces a clean, white-background, print-ready Sepsis Risk Assessment
report styled after industry-standard medical documents (Epic, Cerner).
Uses ReportLab with professional typography, structured tables, and
color-coded risk indicators on a clinical white layout.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Rect, String

if TYPE_CHECKING:
    from .schemas import Explanation, FeatureAttribution


# ---------------------------------------------------------------------------
# Color Palette — Clinical / Print-Optimized
# ---------------------------------------------------------------------------

_WHITE = colors.HexColor("#FFFFFF")
_OFF_WHITE = colors.HexColor("#F8F9FA")
_LIGHT_GRAY = colors.HexColor("#E9ECEF")
_MID_GRAY = colors.HexColor("#ADB5BD")
_DARK_GRAY = colors.HexColor("#495057")
_CHARCOAL = colors.HexColor("#212529")
_BLUE_PRIMARY = colors.HexColor("#0D47A1")
_BLUE_LIGHT = colors.HexColor("#E3F2FD")
_BLUE_ACCENT = colors.HexColor("#1565C0")
_TEAL = colors.HexColor("#00897B")

_RISK_COLORS = {
    "Critical": colors.HexColor("#C62828"),
    "Surveillance": colors.HexColor("#E65100"),
    "Stable": colors.HexColor("#2E7D32"),
}

_RISK_BG_COLORS = {
    "Critical": colors.HexColor("#FFEBEE"),
    "Surveillance": colors.HexColor("#FFF3E0"),
    "Stable": colors.HexColor("#E8F5E9"),
}

_DIRECTION_COLORS = {
    "elevated": colors.HexColor("#C62828"),
    "reduced": colors.HexColor("#1565C0"),
    "normal": colors.HexColor("#2E7D32"),
}


# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------

def _build_styles() -> dict[str, ParagraphStyle]:
    return {
        "report_title": ParagraphStyle(
            "ReportTitle",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=_BLUE_PRIMARY,
            alignment=TA_CENTER,
            spaceAfter=2 * mm,
            leading=22,
        ),
        "report_subtitle": ParagraphStyle(
            "ReportSubtitle",
            fontName="Helvetica",
            fontSize=9,
            textColor=_DARK_GRAY,
            alignment=TA_CENTER,
            spaceAfter=1 * mm,
        ),
        "section_header": ParagraphStyle(
            "SectionHeader",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=_BLUE_PRIMARY,
            spaceBefore=5 * mm,
            spaceAfter=2.5 * mm,
            leading=14,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName="Helvetica",
            fontSize=9.5,
            textColor=_CHARCOAL,
            leading=13.5,
            spaceAfter=2 * mm,
        ),
        "body_italic": ParagraphStyle(
            "BodyItalic",
            fontName="Helvetica-Oblique",
            fontSize=8.5,
            textColor=_DARK_GRAY,
            leading=12,
            spaceAfter=1 * mm,
        ),
        "risk_score_large": ParagraphStyle(
            "RiskScoreLarge",
            fontName="Helvetica-Bold",
            fontSize=42,
            alignment=TA_CENTER,
            leading=46,
        ),
        "risk_category_label": ParagraphStyle(
            "RiskCategoryLabel",
            fontName="Helvetica-Bold",
            fontSize=13,
            alignment=TA_CENTER,
            spaceAfter=2 * mm,
        ),
        "recommendation_num": ParagraphStyle(
            "RecommendationNum",
            fontName="Helvetica-Bold",
            fontSize=9.5,
            textColor=_CHARCOAL,
            leading=13,
        ),
        "recommendation_body": ParagraphStyle(
            "RecommendationBody",
            fontName="Helvetica",
            fontSize=9,
            textColor=_CHARCOAL,
            leading=12.5,
            leftIndent=5 * mm,
        ),
        "protocol_ref": ParagraphStyle(
            "ProtocolRef",
            fontName="Helvetica-Oblique",
            fontSize=7.5,
            textColor=_TEAL,
            leading=10,
            leftIndent=5 * mm,
            spaceAfter=2 * mm,
        ),
        "disclaimer": ParagraphStyle(
            "Disclaimer",
            fontName="Helvetica",
            fontSize=7,
            textColor=_MID_GRAY,
            leading=9.5,
            alignment=TA_CENTER,
            spaceBefore=6 * mm,
        ),
        "footer": ParagraphStyle(
            "Footer",
            fontName="Helvetica",
            fontSize=7,
            textColor=_MID_GRAY,
            alignment=TA_CENTER,
        ),
    }


# ---------------------------------------------------------------------------
# Reusable Drawing: Horizontal Importance Bar
# ---------------------------------------------------------------------------

def _importance_bar(score: float, max_score: float, direction: str, width: float = 80, height: float = 8) -> Drawing:
    """Draw a small horizontal bar showing relative importance."""
    d = Drawing(width, height)
    # Background track
    d.add(Rect(0, 1, width, height - 2, fillColor=_LIGHT_GRAY, strokeColor=None, strokeWidth=0))
    # Fill bar
    bar_width = (score / max(max_score, 1e-6)) * width
    bar_width = max(bar_width, 2)  # minimum visible width
    fill_color = _DIRECTION_COLORS.get(direction, _MID_GRAY)
    d.add(Rect(0, 1, bar_width, height - 2, fillColor=fill_color, strokeColor=None, strokeWidth=0))
    return d


# ---------------------------------------------------------------------------
# Section Builders
# ---------------------------------------------------------------------------

def _build_header_block(
    styles: dict[str, ParagraphStyle],
    patient_name: str,
    patient_id: str,
    timestamp: str,
) -> list:
    """Professional medical report header with institution branding."""
    elements: list = []

    # Top blue accent line
    elements.append(HRFlowable(width="100%", thickness=3, color=_BLUE_PRIMARY, spaceAfter=4 * mm))

    elements.append(Paragraph("COMPREHENSIVE SEPSIS RISK ASSESSMENT", styles["report_title"]))
    elements.append(Paragraph("Sentinel AI Clinical Decision Support System", styles["report_subtitle"]))

    elements.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY, spaceBefore=2 * mm, spaceAfter=3 * mm))

    # Patient demographics table — 2 columns
    demo_data = [
        [
            Paragraph(f"<b>Patient:</b> {patient_name}", styles["body"]),
            Paragraph(f"<b>Patient ID:</b> {patient_id}", styles["body"]),
        ],
        [
            Paragraph(f"<b>Report Date:</b> {timestamp}", styles["body"]),
            Paragraph("<b>Ordering Provider:</b> Clinical AI System", styles["body"]),
        ],
        [
            Paragraph("<b>Facility:</b> Sentinel AI Medical Center", styles["body"]),
            Paragraph("<b>Department:</b> Critical Care / Emergency", styles["body"]),
        ],
    ]

    demo_table = Table(demo_data, colWidths=[250, 250])
    demo_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(demo_table)
    elements.append(Spacer(1, 4 * mm))
    return elements


def _build_risk_score_section(
    styles: dict[str, ParagraphStyle],
    probability: float,
    risk_category: str,
) -> list:
    """Large risk score with color-coded category badge."""
    from reportlab.platypus import PageBreak
    elements: list = []
    
    elements.append(Paragraph("1. EXECUTIVE SUMMARY & RISK STRATIFICATION", styles["section_header"]))
    elements.append(Paragraph("This section provides the top-level sepsis risk probability calculated by the Sentinel AI predictive model based on the patient's current physiologic and laboratory parameters.", styles["body"]))
    elements.append(Spacer(1, 2 * mm))

    pct = round(probability * 100, 1)
    risk_color = _RISK_COLORS.get(risk_category, _CHARCOAL)
    risk_bg = _RISK_BG_COLORS.get(risk_category, _OFF_WHITE)

    # Risk score box — centered table with background
    score_para = Paragraph(f"{pct}%", ParagraphStyle(
        "ScoreInline", parent=styles["risk_score_large"], textColor=risk_color,
    ))
    category_para = Paragraph(f"Risk Category: {risk_category.upper()}", ParagraphStyle(
        "CatInline", parent=styles["risk_category_label"], textColor=risk_color,
    ))

    score_table_data = [[score_para], [category_para]]
    score_table = Table(score_table_data, colWidths=[500])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), risk_bg),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (0, 0), 4 * mm),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 4 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOX", (0, 0), (-1, -1), 1, risk_color),
        ("ROUNDEDCORNERS", [3, 3, 3, 3]),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 4 * mm))
    return elements


def _build_narrative_section(
    styles: dict[str, ParagraphStyle],
    narrative: str,
) -> list:
    """Clinical narrative in a clean bordered box."""
    elements: list = []
    elements.append(Paragraph("2. AI-GENERATED CLINICAL NARRATIVE", styles["section_header"]))
    elements.append(Paragraph("The following narrative translates the quantitative feature attributions into a qualitative clinical assessment, highlighting the primary physiologic drivers of the current risk score.", styles["body"]))

    narrative_table = Table(
        [[Paragraph(narrative, styles["body"])]],
        colWidths=[500],
    )
    narrative_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _BLUE_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.5, _BLUE_ACCENT),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm),
    ]))
    elements.append(narrative_table)
    elements.append(Spacer(1, 6 * mm))
    
    from reportlab.platypus import PageBreak
    elements.append(PageBreak())
    return elements


def _build_full_vitals_table(styles: dict[str, ParagraphStyle], explanation: "Explanation") -> list:
    """Detailed table of all vital signs and their status."""
    elements = []
    elements.append(Paragraph("3. COMPREHENSIVE PHYSIOLOGIC PROFILE", styles["section_header"]))
    elements.append(Paragraph("A complete breakdown of the analyzed physiological and laboratory parameters, comparing the patient's current values against standard clinical reference ranges.", styles["body"]))
    
    header_style = ParagraphStyle("TH", fontName="Helvetica-Bold", fontSize=8, textColor=_WHITE, leading=10)
    header = [
        Paragraph("Parameter", header_style),
        Paragraph("Measured Value", header_style),
        Paragraph("Reference Range", header_style),
        Paragraph("Clinical Status", header_style),
    ]
    rows = [header]

    cell_style = ParagraphStyle("TD", fontName="Helvetica", fontSize=8.5, textColor=_CHARCOAL, leading=11)

    direction_labels = {
        "elevated": "▲ ELEVATED",
        "reduced": "▼ REDUCED",
        "normal": "● NORMAL",
    }

    # Assuming all features passed to explanation are the ones we want to show
    for attr in sorted(explanation.feature_attributions, key=lambda x: x.display_name):
        dir_label = direction_labels.get(attr.direction.value, "—")
        
        rows.append([
            Paragraph(f"<b>{attr.display_name}</b>", cell_style),
            Paragraph(f"{attr.raw_value} {attr.unit}", cell_style),
            Paragraph(f"{attr.normal_range_low}–{attr.normal_range_high} {attr.unit}", cell_style),
            Paragraph(dir_label, ParagraphStyle(
                "DirCell", parent=cell_style,
                textColor=_DIRECTION_COLORS.get(attr.direction.value, _CHARCOAL),
                fontName="Helvetica-Bold",
            )),
        ])

    table = Table(rows, colWidths=[150, 100, 130, 120])
    style_cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), _DARK_GRAY),
        ("TEXTCOLOR", (0, 0), (-1, 0), _WHITE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, 0), 1, _CHARCOAL),
        ("LINEBELOW", (0, 1), (-1, -1), 0.3, _LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.5, _MID_GRAY),
    ]

    for i in range(1, len(rows)):
        bg = _OFF_WHITE if i % 2 == 0 else _WHITE
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))

    table.setStyle(TableStyle(style_cmds))
    elements.append(table)
    elements.append(Spacer(1, 6 * mm))
    from reportlab.platypus import PageBreak
    elements.append(PageBreak())
    return elements


def _build_attribution_table(
    styles: dict[str, ParagraphStyle],
    explanation: "Explanation",
) -> list:
    """Clean, professional feature attribution table."""
    elements: list = []
    elements.append(Paragraph("4. EXPLAINABLE AI: FEATURE ATTRIBUTION", styles["section_header"]))
    elements.append(Paragraph("This section utilizes SHAP (SHapley Additive exPlanations) values to quantify the impact of each variable on the final risk prediction. Higher scores indicate a stronger contribution to the model's output.", styles["body"]))

    if not explanation.feature_attributions:
        elements.append(Paragraph("No significant risk factors identified.", styles["body"]))
        return elements

    # Header row
    header_style = ParagraphStyle("TH", fontName="Helvetica-Bold", fontSize=8, textColor=_WHITE, leading=10)
    header = [
        Paragraph("Risk Factor", header_style),
        Paragraph("Value", header_style),
        Paragraph("Status", header_style),
        Paragraph("Relative Impact (SHAP)", header_style),
        Paragraph("Score", header_style),
    ]
    rows = [header]

    max_importance = max(
        (a.importance_score for a in explanation.feature_attributions), default=1.0
    )

    cell_style = ParagraphStyle("TD", fontName="Helvetica", fontSize=8.5, textColor=_CHARCOAL, leading=11)

    direction_labels = {
        "elevated": "▲ HIGH",
        "reduced": "▼ LOW",
        "normal": "● NORMAL",
    }

    # Sort by importance descending
    sorted_attrs = sorted(explanation.feature_attributions, key=lambda x: x.importance_score, reverse=True)

    for attr in sorted_attrs:
        dir_label = direction_labels.get(attr.direction.value, "—")
        bar = _importance_bar(attr.importance_score, max_importance, attr.direction.value, width=120, height=8)

        rows.append([
            Paragraph(f"<b>{attr.display_name}</b>", cell_style),
            Paragraph(f"{attr.raw_value} {attr.unit}", cell_style),
            Paragraph(dir_label, ParagraphStyle(
                "DirCell", parent=cell_style,
                textColor=_DIRECTION_COLORS.get(attr.direction.value, _CHARCOAL),
                fontName="Helvetica-Bold",
            )),
            bar,
            Paragraph(f"{attr.importance_score:.3f}", cell_style),
        ])

    table = Table(rows, colWidths=[110, 80, 80, 150, 60])
    style_cmds = [
        # Header styling
        ("BACKGROUND", (0, 0), (-1, 0), _BLUE_PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), _WHITE),
        # Alternating row colors
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        # Grid
        ("LINEBELOW", (0, 0), (-1, 0), 1, _BLUE_PRIMARY),
        ("LINEBELOW", (0, 1), (-1, -1), 0.3, _LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 0.5, _MID_GRAY),
    ]

    # Alternating row backgrounds
    for i in range(1, len(rows)):
        bg = _OFF_WHITE if i % 2 == 0 else _WHITE
        style_cmds.append(("BACKGROUND", (0, i), (-1, i), bg))

    table.setStyle(TableStyle(style_cmds))
    elements.append(table)
    elements.append(Spacer(1, 6 * mm))
    return elements


def _build_recommendations_section(
    styles: dict[str, ParagraphStyle],
    explanation: "Explanation",
) -> list:
    """Numbered actionable recommendations with protocol references."""
    elements: list = []
    elements.append(Paragraph("5. CLINICAL ACTION PLAN & PROTOCOL PATHWAYS", styles["section_header"]))
    elements.append(Paragraph("Based on the identified physiological derangements, the following evidence-based interventions are recommended in alignment with the Surviving Sepsis Campaign (SSC) guidelines.", styles["body"]))

    if not explanation.clinical_insights:
        elements.append(Paragraph(
            "All monitored vital signs are within normal reference ranges. "
            "Continue standard monitoring and reassess per institutional protocol.",
            styles["body"],
        ))
        from reportlab.platypus import PageBreak
        elements.append(PageBreak())
        return elements

    for i, insight in enumerate(explanation.clinical_insights, 1):
        elements.append(Paragraph(
            f"<b>{i}. Management of abnormal {insight.trigger_feature}:</b>",
            styles["recommendation_num"],
        ))
        elements.append(Paragraph(f"<b>Recommendation:</b> {insight.recommendation}", styles["recommendation_body"]))
        elements.append(Paragraph(
            f"<b>Protocol Pathway:</b> {insight.protocol_reference}",
            styles["protocol_ref"],
        ))
        elements.append(Spacer(1, 2 * mm))

    elements.append(Spacer(1, 4 * mm))
    from reportlab.platypus import PageBreak
    elements.append(PageBreak())
    return elements


def _build_methodology_appendix(styles: dict[str, ParagraphStyle]) -> list:
    """Detailed appendix explaining the model and methodology to add depth."""
    elements = []
    elements.append(Paragraph("APPENDIX A: MODEL METHODOLOGY & VALIDATION", styles["section_header"]))
    
    elements.append(Paragraph("<b>A.1 Predictive Algorithm</b>", styles["body"]))
    elements.append(Paragraph(
        "The Sentinel AI predictive model employs an ensemble machine learning architecture, specifically an optimized Random Forest classifier. "
        "It was trained on a comprehensive retrospective cohort of ICU patient records (MIMIC-III dataset), encompassing thousands of critical care encounters. "
        "The model continuously evaluates a multivariate feature space including hemodynamics, respiratory parameters, and point-of-care laboratory values.",
        styles["body"]
    ))

    elements.append(Paragraph("<b>A.2 Explainability Framework (SHAP)</b>", styles["body"]))
    elements.append(Paragraph(
        "To ensure clinical transparency, the system utilizes SHapley Additive exPlanations (SHAP). This game-theoretic approach assigns each feature an importance value "
        "for a specific prediction. The SHAP score represents the marginal contribution of a specific vital sign to the final risk probability, allowing clinicians to rapidly "
        "identify the physiologic derangements driving the alert.",
        styles["body"]
    ))

    elements.append(Paragraph("<b>A.3 Guideline Integration</b>", styles["body"]))
    elements.append(Paragraph(
        "Actionable recommendations are systematically mapped from identified abnormal features to the established pathways of the Surviving Sepsis Campaign (SSC) Hour-1 Bundle. "
        "This ensures that the AI output is not only predictive but directly tied to internationally recognized standards of care for sepsis resuscitation and management.",
        styles["body"]
    ))
    elements.append(Spacer(1, 4 * mm))
    return elements


def _build_footer(styles: dict[str, ParagraphStyle], timestamp: str) -> list:
    """Disclaimer and compliance footer."""
    elements: list = []

    elements.append(HRFlowable(width="100%", thickness=0.5, color=_LIGHT_GRAY, spaceBefore=4 * mm, spaceAfter=3 * mm))

    elements.append(Paragraph(
        "<b>⚠ CLINICAL DISCLAIMER:</b> This report is generated by an AI-based Clinical Decision Support System. "
        "It is intended as a supplementary tool to enhance situational awareness and does NOT constitute a medical diagnosis. "
        "The model's predictions and recommendations should always be interpreted in the context of the patient's full clinical presentation. "
        "All clinical decisions, including the initiation of therapy, must be made by qualified healthcare professionals in accordance with "
        "institutional protocols and clinical judgment.",
        styles["disclaimer"],
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"Generated by Sentinel AI CDSS v2.0 · {timestamp} · CONFIDENTIAL — Protected Health Information",
        styles["footer"],
    ))
    elements.append(Spacer(1, 1 * mm))
    elements.append(HRFlowable(width="100%", thickness=2, color=_BLUE_PRIMARY))

    return elements


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_pdf_report(
    probability: float,
    explanation: "Explanation",
    patient_name: str = "John Doe",
    patient_id: str = "PID-000000",
) -> bytes:
    """Generate a professional, print-ready 3-4 page Sepsis Risk Assessment PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        title="Sepsis Risk Assessment Report",
        author="Sentinel AI CDSS",
    )

    styles = _build_styles()
    timestamp = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    risk_category = explanation.risk_category.value

    story: list = []
    
    # Page 1: Header, Risk Score, Narrative
    story.extend(_build_header_block(styles, patient_name, patient_id, timestamp))
    story.extend(_build_risk_score_section(styles, probability, risk_category))
    story.extend(_build_narrative_section(styles, explanation.clinical_narrative))
    
    # Page 2: Full Vitals Table (forces page break at end)
    story.extend(_build_full_vitals_table(styles, explanation))
    
    # Page 3: SHAP Attribution & Recommendations (forces page break at end)
    story.extend(_build_attribution_table(styles, explanation))
    story.extend(_build_recommendations_section(styles, explanation))
    
    # Page 4: Appendix & Footer
    story.extend(_build_methodology_appendix(styles))
    story.extend(_build_footer(styles, timestamp))

    doc.build(story)
    return buffer.getvalue()
