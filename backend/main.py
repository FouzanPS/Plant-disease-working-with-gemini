from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import io

app = Flask(__name__)

# Load the trained model
model = load_model("plant_disease_models_improved.h5")

# Class names in the correct order
class_names = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___Pest', 'Potato___Virus', 'Potato___fungi', 'Potato___healthy']

IMG_SIZE = 224

@app.route("/checkdisease", methods=["POST"])
def check_disease():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    
    try:
        # Load and preprocess the image
        img = image.load_img(io.BytesIO(file.read()), target_size=(IMG_SIZE, IMG_SIZE))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        # Predict
        pred = model.predict(img_array)
        predicted_class = np.argmax(pred)

        return jsonify({
            "prediction": class_names[predicted_class],
            "confidence": float(np.max(pred))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
