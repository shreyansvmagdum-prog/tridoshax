import joblib
import numpy as np
import os


# ================= LOAD FILE PATHS =================

BASE_DIR = os.path.dirname(__file__)

model_path = os.path.join(BASE_DIR, "dosha_model.pkl")
encoder_path = os.path.join(BASE_DIR, "encoder.pkl")
label_path = os.path.join(BASE_DIR, "label_encoder.pkl")


# ================= LOAD OBJECTS =================

model = joblib.load(model_path)
encoder = joblib.load(encoder_path)
label_encoder = joblib.load(label_path)


# ================= PREDICTION FUNCTION =================

def predict_dosha(raw_answers):
    """
    raw_answers: list of answers ['A','B','C',...]
    Returns: (prediction_index, confidence_percent)
    """

    # Convert to 2D array
    input_array = np.array(raw_answers).reshape(1, -1)

    # Encode using SAME encoder as training
    encoded_input = encoder.transform(input_array)

    # Get probabilities
    probabilities = model.predict_proba(encoded_input)[0]

    prediction_index = np.argmax(probabilities)
    confidence = probabilities[prediction_index] * 100

    return int(prediction_index), round(confidence, 2)


# ================= CLASS NAME FUNCTION =================

def dosha_name(prediction_index):

    return label_encoder.inverse_transform([prediction_index])[0]