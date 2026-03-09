import joblib
import numpy as np

# Load trained model
model = joblib.load("dosha_model.pkl")

def predict_dosha(features):
    """
    features: list of encoded questionnaire answers
    """

    input_data = np.array(features).reshape(1, -1)

    prediction = model.predict(input_data)

    return int(prediction[0])

def dosha_name(prediction):

    mapping = {
        0: "Vata",
        1: "Pitta",
        2: "Kapha"
    }

    return mapping.get(prediction, "Unknown")