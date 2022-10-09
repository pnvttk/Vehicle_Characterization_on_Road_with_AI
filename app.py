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
import re
import json
from email.mime import image
from enum import unique
from operator import contains, ne
from tkinter import BOTTOM
from tkinter.tix import Tree
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from turtle import title
from unittest import result
from PIL import Image
from io import BytesIO
from werkzeug.utils import secure_filename
from province import province_th
from thefuzz import fuzz, process
# from eOCR import main

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

# DEFINING GLOBAL VARIABLE
EASY_OCR = easyocr.Reader(['th'])  # initiating easyocr
OCR_TH = 0.2

# Define path
UPLOAD_FOLDER = './results'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# ? MySQL setup
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
# ? confidence threshold
model.conf = 0.8

# # ! testing
# @app.route("/fetcg")
# def hello_world():
#
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


# ? Unique name generate
def generate_custom_name(original_file_name):

    unique_name = uuid.uuid4().hex
    return unique_name
    # return unique_name + pathlib.Path(original_file_name).suffix


# ? check number in string
def contains_number(string):
    return any(char.isdigit() for char in string)


# ? Main Yolov5 Object Detection
@app.route('/detectObject', methods=['GET', 'POST'])
def mask_image():

    # ? Get image from POST
    file = request.files["image"]

    # ? Create temp unique directory
    new_name = generate_custom_name(file.filename)

    # ? Send img to model
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))
    results = model([img])

    # ? results after detection
    results.render()  # updates results.imgs with boxes and labels
    # results.save(save_dir="results/" + new_name)
    # results.save(save_dir="results/test.jpg")

    # ? Count class number from detection
    results.pandas().xyxy[0]  # Pandas DataFrame
    # print("[INFO] : Pandas Results")
    # print(results.pandas().xyxy[0])
    print("[INFO] : Count class name")
    # results.pandas().xyxy[0].value_counts('name')  # class counts (pandas)
    print(results.pandas().xyxy[0].value_counts(
        'name'))  # class counts (pandas)

    # # Get access to class name
    # ? info for array of results
    info = results.pandas().xyxy[0].to_dict(orient='records')

    # ? if results have any detection object.
    # ? Loop to get only class name
    # ? array of check easyocr
    ocr_txt = []
    # ? json to push to frontend
    json_ocr_txt = []
    if len(info) != 0:

        # print("[INFO] : results name")
        # print(info)
        i = 0
        for result in info:

            # ? Get class name from for loop
            getClass_name = result['name']

            # ? If class == Plate crop image for EasyOCR
            if getClass_name == 'Plate':

                # print('[INFO] Croping image.')

                # ? crop plate and save in unique directory
                results.crop(save_dir="results/" + new_name)

                # ? temp crop path to access to crop image
                crop_path = new_name + '/crops/Plate/'

                # ? loop to check new directory
                for f in os.listdir("./results/"):
                    j = ""
                    # print("[TEMP PATH] = "+f)

                # ! Random 00 bug fix
                if i == '00':
                    i = '0'

                # ? path of image to use for easyocr
                img_ocr = str("./results/" + crop_path +
                              'image' + str(i) + '.jpg')

                # print("[INFO] path for ocr")
                # print(img_ocr)

                # ? Extract text from Plate image
                eOCR = EASY_OCR.readtext(str(img_ocr), detail=0)

                # ? storing extract text
                ocr_txt.append(eOCR)
                print("[INFO] EasyOCR TEXT : ")
                print(ocr_txt)

                # ? Loop to check string from extract text
                for txt in eOCR:

                    # ? if txt have number in it
                    if contains_number(txt):

                        # ? remove special character
                        r = re.compile('[@_!#$%^&*`()[];:<>?/\|}{~:]')
                        re_txt = r.sub('', str(txt))
                        re_txt2 = re.sub(r"[\[\]\:\|\!\`]", '', re_txt)

                        print("[INFO] Detect number in " + txt + " SKIP Fuzzy")
                        print("Re plate = " + re_txt2)

                        # ? append key and value to json object
                        json_ocr_txt.append({'plate': re_txt2})

                    else:

                        # ? remove specaial and english charater
                        re_txt = re.sub('[A-Za-z]+', '', txt)

                        print("[INFO] Re text : " + re_txt)

                        # ? fuzzy text looking for similiar from province_th
                        fuzzytxt = process.extract(
                            str(re_txt), province_th, limit=2, scorer=fuzz.token_sort_ratio)

                        print("[INFO] Fuzzy Text for (" + str(txt) + ") : ")
                        print(fuzzytxt)

                        # ? append key and value to json object
                        json_ocr_txt.append({'province': fuzzytxt[0][0]})

                # ? add 1 i = 1
                i = int(i)+1
                # print(i)

            # ? because image1 not exist
            # ? add 1 i = 2
            if i == 1:
                i += 1
            # print(i)
            #  ? then add 0 in front of i => i = 02
            i = str(i).zfill(2)
            # print(str(i))

    # ? if results not detect any thing
    else:
        # ? return alert msg to ajax
        return jsonify({'alert': "alert('error')"})

    print("last check : ", json_ocr_txt)

    # ? make image to base64 then send to ajax
    for img in results.ims:
        buffered = BytesIO()
        img_base64 = Image.fromarray(img)
        img_base64.save(buffered, format="JPEG")
        b64str = (base64.b64encode(buffered.getvalue()).decode(
            'utf-8'))  # base64 encoded image with results

    return jsonify({'status': str(b64str), 'json_ocr_txt': json_ocr_txt})


# ? Set Header
@ app.after_request
def after_request(response):
    # print("log: setting cors", file=sys.stderr)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


# ? Root path
@ app.route("/", methods=['GET', 'POST'])
def new():
    return render_template('new.html')


# ? server and port setup
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
