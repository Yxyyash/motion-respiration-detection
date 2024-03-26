from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
import dlib
import time
from scipy import signal
import matplotlib.pyplot as plt
from scipy.interpolate import interp1d
from scipy.signal import find_peaks

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
BREATH_SIGNAL_PLOT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'plot')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['BREATH_SIGNAL_PLOT_FOLDER'] = BREATH_SIGNAL_PLOT_FOLDER

threshold = [0.1]
width = [0]

def find_peak(signal):
    peaks, _ = find_peaks(signal, prominence=threshold, width=width)
    return len(peaks)

def save_peak_count_to_file(timestamp, peak_count):
    filename = f"breath_signal_plot_{timestamp}.txt"
    filepath = os.path.join(BREATH_SIGNAL_PLOT_FOLDER, filename)
    with open(filepath, 'w') as file:
        file.write(str(peak_count))
    return filename

def create_edge_img(img):
    if img is None:
        print("Error: Input image is None.")
        return None
    elif isinstance(img, np.ndarray):
        if img.size == 0:
            print("Error: Input image is empty.")
            return None
    elif isinstance(img, cv2.UMat):
        if img.empty():
            print("Error: Input image is empty.")
            return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.medianBlur(gray, 7)
    laplacian = cv2.Laplacian(blur, -1, 7, 5)
    return laplacian

def filter_and_average_movement(mov_points):
    if len(mov_points.shape) < 4:
        raise ValueError("Error in filter_and_average_movement: mov_points should have at least 4 dimensions")
    y_coords = mov_points[:,:,0,1]
    variances = np.var(y_coords, axis=0)
    sorted_indices = np.argsort(variances)
    significant_indices = sorted_indices[10:]
    filtered_indices = significant_indices[:-10]
    filtered_y_coords = y_coords[:, filtered_indices]
    avg_movement = np.mean(filtered_y_coords, axis=1)
    return avg_movement

def count_frames(video_path):
    # Open the video
    cap = cv2.VideoCapture(video_path)

    # Check if video opened successfully
    if not cap.isOpened():
        print("Error: Could not open video.")
        return -1

    # Initialize frame count
    total_frames = 0

    # Read until video is completed
    while cap.isOpened():
        # Capture frame-by-frame
        ret, frame = cap.read()
        if ret:
            total_frames += 1
        else:
            break

    # Release the video capture object
    cap.release()

    return total_frames

@app.route('/uploads', methods=['GET'])
def list_files():
    try:
        files = os.listdir(app.config['UPLOAD_FOLDER'])
        return jsonify(files)
    except Exception as e:
        print('Error reading upload directory:', str(e))
        return 'Internal Server Error', 500

@app.route('/uploads', methods=['POST'])
def upload_file():
    try:
        timestamp = int(time.time())
        video = request.files['video']
        filename = f"{timestamp}-{secure_filename(video.filename)}"
        video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        video.save(video_path)

        total_frames = count_frames(video_path)
        print("Total number of frames:", total_frames)

        if total_frames <= 0:
            print("Error: No frames found in the video.")
            return 'Internal Server Error', 500

        cap = cv2.VideoCapture(video_path)

        chest_bbox = None
        previous_p = None
        previous_img = None
        track_point_movement = []
        st_history = []

        for frame_no in range(total_frames):
            ret, frame = cap.read()
            if ret:
                if frame_no == 0:
                    img = frame
                    detector = dlib.get_frontal_face_detector()
                    detections = detector(img, 1)
                    if not detections:
                        print("Error: No face detected in the first frame.")
                        continue
                    bbox = detections[0]
                    chest_lefttop = (int(bbox.left() * 0.9), int(bbox.bottom() * 1.02))
                    chest_rightbot = (int(bbox.right() * 1.08), int(bbox.bottom() * 1.42))
                    chest_bbox = [chest_lefttop[0], chest_lefttop[1], chest_rightbot[0], chest_rightbot[1]]
                    chest_img = img[chest_bbox[1]:chest_bbox[3], chest_bbox[0]:chest_bbox[2]]
                    chest_corner = create_edge_img(chest_img)
                    rawimg_withcorner = img.copy()
                    if chest_corner is not None:
                        rawimg_withcorner[chest_bbox[1]:chest_bbox[3], chest_bbox[0]:chest_bbox[2]] = cv2.cvtColor(chest_corner, cv2.COLOR_GRAY2BGR)
                    
                    rawimg_cornermask = np.zeros(img.shape[:2], dtype=np.uint8)
                    if chest_bbox is not None:
                        rawimg_cornermask[chest_bbox[1]:chest_bbox[3], chest_bbox[0]:chest_bbox[2]] = 1

                    rawimg_withcorner_gray = cv2.cvtColor(rawimg_withcorner, cv2.COLOR_BGR2GRAY)

                    p0 = cv2.goodFeaturesToTrack(
                        image=rawimg_withcorner_gray,
                        maxCorners=60,
                        qualityLevel=0.1,
                        minDistance=1,
                        mask=rawimg_cornermask,
                        blockSize=3,
                        useHarrisDetector=False,
                    )

                    previous_p = p0
                    previous_img = rawimg_withcorner_gray

                else:
                    img = frame
                    next_chest_img = img[chest_bbox[1]:chest_bbox[3], chest_bbox[0]:chest_bbox[2]]
                    next_chest_corner = create_edge_img(next_chest_img)
                    next_rawimg_withcorner = img.copy()
                    if chest_corner is not None:
                        next_rawimg_withcorner[chest_bbox[1]:chest_bbox[3], chest_bbox[0]:chest_bbox[2]] = cv2.cvtColor(next_chest_corner, cv2.COLOR_GRAY2BGR)
                    
                    next_rawimg_withcorner_gray = cv2.cvtColor(next_rawimg_withcorner, cv2.COLOR_BGR2GRAY)

                    p1, st, err = cv2.calcOpticalFlowPyrLK(
                        prevImg=previous_img,
                        nextImg=next_rawimg_withcorner_gray,
                        prevPts=previous_p,
                        nextPts=None,
                        winSize=(50, 50),
                        maxLevel=3,
                        criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01),
                        flags=0,
                        minEigThreshold=1e-5,
                    )

                    previous_img = next_rawimg_withcorner_gray

                    if p1 is None:
                        print("Error: Optical flow tracking failed in frame", frame_no)
                        continue

                    track_point_movement.append(p1 - previous_p)
                    previous_p = p1
                    st_history.append(st)

        cap.release()

        if not st_history:
            print("Error: No movement data collected.")
            return 'Internal Server Error', 500

        process_mov_point = np.array(track_point_movement)
        process_mov_point = filter_and_average_movement(process_mov_point)

        b, a = signal.butter(3, [0.1, 0.45], btype='bandpass', fs=30)
        process_mov_point = np.insert(process_mov_point, 0, process_mov_point[0])
        process_mov_point = signal.filtfilt(b, a, process_mov_point)

        # Integrate peak detection
        pake = find_peak(process_mov_point)
        apex = pake*3

        # Save peak count to a text file
        filename = save_peak_count_to_file(timestamp, apex)
        print("Text Filename:", filename)

        # Calculate time intervals
        total_time = 20  # seconds
        num_frames = 600
        frame_rate = 30  # frames per second
        time_per_frame = total_time / num_frames

        # Create array for frame numbers (1 to 600)
        frame_numbers = np.arange(1, 601)

        # Calculate time intervals
        total_time = 20  # seconds
        frame_rate = 30  # frames per second
        num_frames = total_time * frame_rate

        # Calculate time per frame
        time_per_frame = total_time / num_frames

        # Create array for time recorded (0 to 20)
        time_recorded = np.arange(0, total_time + time_per_frame, time_per_frame)

        # Interpolate process_mov_point to match the length of frame_numbers
        interp_func = interp1d(np.linspace(1, 600, len(process_mov_point)), process_mov_point)

        # Generate interpolated process_mov_point
        interpolated_mov_point = interp_func(frame_numbers)

        plt.figure(figsize=(8, 5), facecolor=(0, 0, 0, 0.6))
        plt.plot(frame_numbers, interpolated_mov_point, color='red')
        plt.title('Sinyal Gerak Pernapasan', color='white')
        plt.xlabel('Waktu (s)',color='white')
        plt.ylabel('Nilai Pergerakan', color='White')
        plt.tick_params(axis='x', colors='white')
        plt.tick_params(axis='y', colors='white')
        plt.gca().set_facecolor((0, 0, 0, 0.4))

        # Plot the detected peaks as red dots
        plt.plot(pake, interpolated_mov_point[pake], 'bo') 

        # Set x-axis ticks to represent time
        plt.xticks(np.arange(0, num_frames + 1, frame_rate), np.arange(0, total_time + 1, total_time/20).astype(int))

        breath_signal_plot_filename = f"breath_signal_plot_{timestamp}.png"
        breath_signal_plot_path = os.path.join(app.config['BREATH_SIGNAL_PLOT_FOLDER'], breath_signal_plot_filename)
        plt.savefig(breath_signal_plot_path)
        plt.close()

        return 'File uploaded and processed!'
    except Exception as e:
        print('Error uploading or processing video:', str(e))
        return 'Internal Server Error', 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/plot/<filename>')
def txt_signal_plot(filename):
    return send_from_directory(app.config['BREATH_SIGNAL_PLOT_FOLDER'], filename)

@app.route('/plot/<filename>')
def breath_signal_plot(filename):
    return send_from_directory(app.config['BREATH_SIGNAL_PLOT_FOLDER'], filename)

@app.route('/plot')
def breath_signal_plots():
    plot_files = os.listdir(app.config['BREATH_SIGNAL_PLOT_FOLDER'])
    return jsonify(plot_files) if request.headers.get('Content-Type') == 'application/json' else jsonify(plot_files)

app.run(port=4000)