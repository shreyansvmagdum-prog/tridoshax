def generate_recommendations(primary_dosha):
    if primary_dosha == "Vata":
        return {
            "diet": {
                "include": ["Warm cooked foods", "Healthy fats", "Root vegetables"],
                "avoid": ["Cold foods", "Dry snacks"]
            },
            "lifestyle": [
                "Maintain routine",
                "Stay warm",
                "Gentle yoga",
                "Prioritize sleep"
            ],
            "panchakarma": [
                "Basti",
                "Abhyanga",
                "Shirodhara"
            ]
        }

    elif primary_dosha == "Pitta":
        return {
            "diet": {
                "include": ["Cooling foods", "Sweet fruits"],
                "avoid": ["Spicy foods", "Alcohol"]
            },
            "lifestyle": [
                "Avoid overheating",
                "Meditation",
                "Nature walks"
            ],
            "panchakarma": [
                "Virechana",
                "Abhyanga"
            ]
        }

    else:  # Kapha
        return {
            "diet": {
                "include": ["Light foods", "Spices"],
                "avoid": ["Heavy dairy", "Sugary foods"]
            },
            "lifestyle": [
                "Regular exercise",
                "Avoid oversleeping"
            ],
            "panchakarma": [
                "Vamana",
                "Udvartana"
            ]
        }