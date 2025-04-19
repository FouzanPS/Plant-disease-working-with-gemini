from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import base64
from google.genai import Client
from grad_cam import get_img_array, make_gradcam_heatmap, save_and_superimpose_heatmap

app = Flask(__name__)

model = tf.keras.models.load_model("plant_disease_detection_mobilenetV2_ve2.h5")
last_conv_layer_name = "Conv_1"  # Final convolutional layer in MobileNetV2

# You must have the class labels in the same order the model was trained with
class_labels = ['Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 
                'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew',
                'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
                'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight',
                'Corn_(maize)___healthy', 'Grape___Black_rot', 'Grape___Esca_(Black_Measles)',
                'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy', 
                'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot',
                'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 
                'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
                'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
                'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot',
                'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
                'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
                'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
                'Tomato___Tomato_mosaic_virus', 'Tomato___healthy']

genai_client = Client(api_key="AIzaSyBbln8RAByNy7-8b66JSyV_k10ekM0L7vY")

def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/checkimages', methods=['POST'])
def check_images():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    image_path = "temp.jpg"
    cam_path = "cam.jpg"
    image_file.save(image_path)

    try:
        processed_image = preprocess_image(image_path)
        predictions = model.predict(processed_image)[0]
        top_idx = np.argmax(predictions)
        prediction = class_labels[top_idx]
        confidence = float(predictions[top_idx])

        # Google Gemini remedy response
        gemini_response = genai_client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Explain the remedies for {prediction} in short with bullet points, don't write big descriptions."
        )
        remedy = gemini_response.text

        # Grad-CAM
        img_array = get_img_array(image_path, size=(224, 224))
        heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=top_idx)
        heatmap_path = save_and_superimpose_heatmap(heatmap, image_path, cam_path)

        # Convert heatmap image to base64 for response
        with open(heatmap_path, "rb") as f:
            heatmap_base64 = base64.b64encode(f.read()).decode('utf-8')

        return jsonify({
            'prediction': prediction,
            'confidence': round(confidence, 3),
            'remedy': remedy,
            'heatmap': heatmap_base64  # This can be rendered directly in frontend using <img src="data:image/jpeg;base64,...">
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)
        if os.path.exists(cam_path):
            os.remove(cam_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5300)