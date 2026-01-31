import cv2


def redact_image(input_path, output_path):
    img = cv2.imread(input_path)
    if img is None:
        raise ValueError("Image not loaded")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60),
    )

    for (x, y, w, h) in faces:
        # Expand region slightly for better blur coverage
        pad = 10
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img.shape[1], x + w + pad)
        y2 = min(img.shape[0], y + h + pad)
        roi = img[y1:y2, x1:x2]
        # Strong Gaussian blur instead of blackout
        blurred = cv2.GaussianBlur(roi, (99, 99), 30)
        img[y1:y2, x1:x2] = blurred

    cv2.imwrite(output_path, img)
