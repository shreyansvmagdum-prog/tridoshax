def calculate_dosha_scores(answers):
    vata = 0
    pitta = 0
    kapha = 0

    for answer in answers:
        option = answer.selected_option

        if option == "A":
            vata += 1
        elif option == "B":
            pitta += 1
        elif option == "C":
            kapha += 1

    total = vata + pitta + kapha

    scores = {
        "Vata": vata,
        "Pitta": pitta,
        "Kapha": kapha
    }

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    primary = sorted_scores[0][0]
    secondary = sorted_scores[1][0]

    confidence = (sorted_scores[0][1] / total) * 100 if total > 0 else 0

    return {
        "vata": vata,
        "pitta": pitta,
        "kapha": kapha,
        "primary": primary,
        "secondary": secondary,
        "confidence": round(confidence, 2)
    }