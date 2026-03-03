def calculate_bmi(weight_kg: float, height_cm: float):
    if not weight_kg or not height_cm:
        return None, None

    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    if bmi < 18.5:
        category = "Underweight"
    elif 18.5 <= bmi < 25:
        category = "Normal"
    elif 25 <= bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    return round(bmi, 2), category

def generate_disease_risk(primary_dosha: str, bmi_category: str):
    
    risk = {
        "Digestive Issues": "Low",
        "Inflammation": "Low",
        "Respiratory Congestion": "Low",
        "Stress & Anxiety": "Low"
    }

    # Dosha-based baseline risk
    if primary_dosha == "Vata":
        risk["Stress & Anxiety"] = "High"
        risk["Digestive Issues"] = "Medium"

    elif primary_dosha == "Pitta":
        risk["Inflammation"] = "High"
        risk["Digestive Issues"] = "Medium"

    elif primary_dosha == "Kapha":
        risk["Respiratory Congestion"] = "High"
        risk["Digestive Issues"] = "Medium"

    # BMI adjustment layer
    if bmi_category == "Overweight":
        risk["Digestive Issues"] = "High"

    if bmi_category == "Obese":
        risk["Respiratory Congestion"] = "High"
        risk["Inflammation"] = "High"

    return risk