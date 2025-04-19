from flask import Flask, request, jsonify
from huggingface_hub import InferenceClient
import os
from google.genai import Client

app = Flask(__name__)

# HuggingFace model client
client = InferenceClient(
    model="linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
    token="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"
)

# Google Gemini client
genai_client = Client(api_key="AIzaSyBbln8RAByNy7-8b66JSyV_k10ekM0L7vY")

@app.route('/checkimages', methods=['POST'])
def check_images():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    image_path = "temp.jpg"
    image_file.save(image_path)

    try:
        # Perform image classification with HuggingFace model
        result = client.image_classification(image_path)
        if result and isinstance(result, list):
            top_result = result[0]
            prediction = top_result['label']
            confidence = top_result['score']
            
            # Call Google Gemini to explain the remedy for the predicted disease
            gemini_response = genai_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"Explain the remedies for {prediction} in short with bullet points, dont write big descriptions."
            )
            
            # Log the response from Gemini
            print("Gemini AI response:", gemini_response.text)

            # Get the remedy explanation from Gemini's response
            remedy = gemini_response.text

            return jsonify({
                'prediction': prediction,
                'confidence': confidence,
                'remedy': remedy
            })
        else:
            return jsonify({'error': 'No prediction returned'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5300)
