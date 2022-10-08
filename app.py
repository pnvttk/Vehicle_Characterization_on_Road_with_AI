from email.mime import image
from enum import unique
from operator import ne
from tkinter import BOTTOM
from tkinter.tix import Tree
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from turtle import title
from unittest import result
from PIL import Image
from io import BytesIO
from eOCR import main
import base64
import cv2
import numpy as np
import sys
import io
import os
import pymysql
import argparse
import torch
import easyocr
import uuid
import pathlib

from werkzeug.utils import secure_filename

# DEFINING GLOBAL VARIABLE
EASY_OCR = easyocr.Reader(['th'])  # initiating easyocr
OCR_TH = 0.2

UPLOAD_FOLDER = './results'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


# upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
conn = pymysql.connect(host='localhost',
                       user='root',
                       passwd='',
                       db='flask'
                       #    cursorclass=pymysql.cursors.DictCursor
                       )

# ? Local custom model
model = torch.hub.load('./yolov5', 'custom', source='local',
                       path='./models_train/yolov5x.pt', force_reload=True)  # The repo is stored locally

# ? all classname
classes = model.names  # class names in string format
# print(classes[0])
# quit()

# ? confidence threshold
model.conf = 0.8


# # ! testing
# @app.route("/fetcg")
# def hello_world():
#     cur = conn.cursor()
#     cur.execute('select * from student')
#     rows = cur.fetchall()
#     return render_template('fetch.html', data=rows)


# # ? datatables
@app.route("/dttb")
def dttb():
    cur = conn.cursor()
    cur.execute('select * from detect_data')
    tb_detect_data = cur.fetchall()
    return render_template('dttb.html', title='datatables', data=tb_detect_data)
# img_base64 = ""

# ? Unique name generate


def generate_custom_name(original_file_name):
    unique_name = uuid.uuid4().hex
    return unique_name
    # return unique_name + pathlib.Path(original_file_name).suffix


# ? Main Yolov5 Object Detection
@app.route('/detectObject', methods=['GET', 'POST'])
def mask_image():
    # ? Get image from POST
    file = request.files["image"]

    new_name = generate_custom_name(file.filename)

    # ? Pass img to model
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))
    results = model([img])

    # ? results after detection
    results.render()  # updates results.imgs with boxes and labels
    # results.save(save_dir="results/" + new_name)
    # results.save(save_dir="results/test.jpg")

    # ? Count class number
    results.pandas().xyxy[0]  # Pandas DataFrame
    print("[INFO] : Pandas Results")
    print(results.pandas().xyxy[0])
    print("[INFO] : Count class name")
    # results.pandas().xyxy[0].value_counts('name')  # class counts (pandas)
    print(results.pandas().xyxy[0].value_counts(
        'name'))  # class counts (pandas)

    # ? Get access to class name
    # ? info for array of results
    info = results.pandas().xyxy[0].to_dict(orient='records')
    # ? Loop to get only class name
    i = 0
    if len(info) != 0:
        # print("[INFO] : results name")
        # print(info)
        for result in info:
            getClass_name = result['name']
            # left = result['xmin']
            # top = result['ymin']
            # right = result['xmax']
            # bottom = result['ymax']
            # # print(getClass_name)
            # print('[LEFT] = ', left)
            # print('[top] = ', top)
            # print('[right] = ', right)
            # print('[bottom] = ', bottom)

            # crop
            if getClass_name == 'Plate':
                print('[INFO] Croping image.')
                # crops = results.crop((left, top, right, bottom))
                # crops.show()
                # crops = results.crop(save=True)
                results.crop(save_dir="results/" + new_name)
                image_temp_path = "/results/" + new_name + "/image0.jpg"
                crop_path = new_name + '/crops/Plate/'

                for f in os.listdir("./results/"):
                    print("[TEMP PATH] = "+f)
                    # img_ocr = open('/' + crop_path + 'image' + str(i) + '.jpg')

                img_ocr = str("./results/" + crop_path +
                              'image' + str(i) + '.jpg')
                print("[INFO] path for ocr")
                print(img_ocr)
                # os.path.exists(img_ocr)
                # os.path.isfile(img_ocr)
                # os.listdir(img_ocr)
                eOCR = EASY_OCR.readtext(str(img_ocr), detail=0)
                print(eOCR)
                i = int(i)+1
                print(i)
            if i == 1:
                i += 1
                print(i)
                i = str(i).zfill(2)
                print(str(i))
            # break
    else:
        image_temp_path = ""
        return jsonify({'alert': "alert('error')"})

    # img_ocr.show()

    # # ? Crop results
    # # results = model(img)  # inference
    # if getClass_name == 'Plate':
    #     print('[INFO] Croping image.')
    #     crops = results.crop(save=True)
    # # crops.save(save_dir="results/")
    # # quit()

    # results.save(save_dir="results/")
    # return redirect("results/image0.jpg")

    # print(results.ims)
    # return jsonify({'status': str(result.ims)})
    # quit()
    # main(results.ims)

    # ? Img to B64
    for img in results.ims:
        buffered = BytesIO()
        img_base64 = Image.fromarray(img)
        img_base64.save(buffered, format="JPEG")
        b64str = (base64.b64encode(buffered.getvalue()).decode(
            'utf-8'))  # base64 encoded image with results

    # ? Send to console
    return jsonify({'status': str(b64str), 'temp_image': str(image_temp_path)})


# ? Set Header
@ app.after_request
def after_request(response):
    # print("log: setting cors", file=sys.stderr)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


@ app.route("/", methods=['GET', 'POST'])
def new():
    return render_template('new.html')


if __name__ == "__main__":
    # ? Set port
    parser = argparse.ArgumentParser(
        description="Flask app exposing yolov5 models")
    parser.add_argument("--port", default=5000, type=int, help="port number")
    args = parser.parse_args()

    # ? Online Model
    # model = torch.hub.load('./', 'yolov5x_model', pretrained=True)

    # ? local path
    # model = torch.hub.load('./yolov5', 'custom', source='local',
    #                        path='./models_train/yolov5x.pt', force_reload=True)  # The repo is stored locally

    # model.eval()
    app.run(host="0.0.0.0", port=args.port, debug=True)
