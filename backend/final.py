from flask import Flask, request, jsonify, send_from_directory
from huggingface_hub import InferenceClient
from google.genai import Client
import os
import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import numpy as np
import cv2
import matplotlib.pyplot as plt

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/heatmaps'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Model Implementation
client = InferenceClient(
    model="linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
    token="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"
)

# Google Gemini client
genai_client = Client(api_key="AIzaSyBbln8RAByNy7-8b66JSyV_k10ekM0L7vY")

def generate_gradcam(image_path, save_path):
    print("Loading model...", flush=True)
    model = models.mobilenet_v2(pretrained=True)
    model.eval()
    
    print("Opening image...", flush=True)
    img = Image.open(image_path).convert('RGB')
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    input_tensor = preprocess(img).unsqueeze(0)
    
    features = []
    gradients = []

    def forward_hook(module, input, output):
        features.append(output)

    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])

    final_conv = model.features[-1]
    final_conv.register_forward_hook(forward_hook)
    final_conv.register_backward_hook(backward_hook)

    output = model(input_tensor)
    pred = output.argmax(dim=1)

    model.zero_grad()
    class_loss = output[0, pred]
    class_loss.backward()

    grads = gradients[0]
    fmap = features[0][0]

    weights = grads.mean(dim=[1, 2])
    cam = torch.zeros(fmap.shape[1:], dtype=torch.float32)

    for i, w in enumerate(weights):
        cam += w * fmap[i]

    # Normalize the CAM to [0, 1]
    cam = torch.maximum(cam.detach(), torch.tensor(0.0))  # Remove negative values
    cam = cam / cam.max()
    # Resize the CAM
    cam = np.array(cam.detach().numpy())
    cam = cv2.resize(cam, (224, 224))

    cam = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_HSV)
    img_np = np.array(img.resize((224, 224)))
    # Darker region hightlighter
    mask = cv2.inRange(cam, (0, 0, 0), (100, 100, 100))
    dark_highlight = cv2.bitwise_and(img_np, img_np, mask=mask)

    superimposed_img = cv2.addWeighted(img_np, 0.8, cam, 0.5, 0)

    print("Saving heatmap...", flush=True)
    cv2.imwrite(save_path, superimposed_img)

@app.route('/checkimages', methods=['POST'])
def check_images():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    image_path = "temp.jpg"
    image_file.save(image_path)

    try:
        # Prediction
        result = client.image_classification(image_path)
        if result and isinstance(result, list):
            top_result = result[0]
            prediction = top_result['label']
            confidence = round(top_result['score'] * 100, 2)

            # Gemini response
            gemini_response = genai_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"Explain the remedies for {prediction} in short with bullet points, don't write big descriptions."
            )
            remedy = gemini_response.text

            # GradCAM
            heatmap_filename = f"heatmap_{int(torch.randint(10000, (1,)).item())}.jpg"
            heatmap_path = os.path.join(app.config['UPLOAD_FOLDER'], heatmap_filename)
            print("heatmap generating!",flush=True)
            generate_gradcam(image_path, heatmap_path)

            heatmap_url = f"http://localhost:5300/static/heatmaps/{heatmap_filename}"
            print("heatmap generated!",flush=True)
            return jsonify({
                'prediction': prediction,
                'confidence': confidence,
                'remedy': remedy,
                'heatmapUrl': heatmap_url
            })
        else:
            return jsonify({'error': 'No prediction returned'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)


# Serve static files
@app.route('/static/heatmaps/<filename>')
def serve_heatmap(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5300, debug=True)
