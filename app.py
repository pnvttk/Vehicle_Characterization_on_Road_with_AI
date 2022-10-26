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
import time
from asyncio.windows_events import NULL
from distutils.command.upload import upload
from itertools import count
from datetime import datetime, timezone, timedelta
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
from pathlib import Path
# from eOCR import main

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

# ? DEFINING GLOBAL VARIABLE
EASY_OCR = easyocr.Reader(['th'])  # initiating easyocr
# ? OCR CONF
OCR_TH = 0.2

# ? Define temp path
UPLOAD_FOLDER = './results'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
# ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
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
                       path='./models_train/yolov5x_new.pt', force_reload=True)  # The repo is stored locally
# ? all classname
classes = model.names  # class names in string format
# ? confidence threshold
model.conf = 0.5


# ? Unique name generate
def generate_custom_name(original_file_name):
    unique_name = uuid.uuid4().hex
    return unique_name
    # return unique_name + pathlib.Path(original_file_name).suffix


# ? check number in string
def contains_number(string):
    return any(char.isdigit() for char in string)


# ? thefuzz string
def fuzzy(string):
    fuzzy_sort = process.extract(
        str(string), province_th, limit=2, scorer=fuzz.token_sort_ratio)

    fuzzy_sort_conf = fuzzy_sort[0][1]
    print("|---Sorting text Conf = " + str(fuzzy_sort_conf) + " ---")

    # fuzzy_set = process.extract(
    #     str(string), province_th, limit=2, scorer=fuzz.token_set_ratio)
    # fuzzy_set_conf = fuzzy_set[0][1]
    # print("|---Fuzzy Conf = " + str(fuzzy_set_conf) + " ---")

    # fuzzy_partial = process.extract(
    #     str(string), province_th, limit=2, scorer=fuzz.partial_ratio)
    # fuzzy_partial_conf = fuzzy_partial[0][1]
    # print("|---Fuzzy Conf = " + str(fuzzy_partial_conf) + " ---")

    # fuzzy_ratio = process.extract(
    #     str(string), province_th, limit=2, scorer=fuzz.ratio)
    # fuzzy_ratio_conf = fuzzy_ratio[0][1]
    # print("|---Fuzzy Conf = " + str(fuzzy_ratio_conf) + " ---")

    # max_conf = max(fuzzy_set_conf, fuzzy_sort_conf,
    #                #    fuzzy_partial_conf, fuzzy_ratio_conf)
    #                )
    # print("|** The most conf is : " + str(max_conf) + " **")

    if fuzzy_sort_conf >= 80:
        return fuzzy_sort
        # if max_conf == fuzzy_sort_conf:
        #     print("|** Using fuzzy_sort **")
        #     return fuzzy_sort
        # elif max_conf == fuzzy_set_conf:
        #     print("|** Using fuzzy_set **")
        #     return fuzzy_set

        # elif max_conf == fuzzy_partial_conf:
        #     print("|**Using fuzzy_partial**")
        #     return fuzzy_partial
        # elif max_conf == fuzzy_ratio:
        #     print("|**Using fuzzy_ratio**")
        #     return fuzzy_ratio
    else:
        fuzzy_text = NULL
        return fuzzy_text


# ? Main Yolov5 Object Detection
@ app.route('/detectObject', methods=['GET', 'POST'])
def mask_image():

    rows = 5
    for i in range(0, rows):
        # nested loop for each column
        for j in range(0, i + 1):
            # print star
            print("*", end=' ')
        # new line after each row
        print("\r")

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
    # results.pandas().xyxy[0]  # Pandas DataFrame
    # print("[INFO] : Pandas Results")
    # print(results.pandas().xyxy[0])
    print("[INFO] : Count class name")
    print(results.pandas().xyxy[0].value_counts('name'))
    count_result = results.pandas().xyxy[0].value_counts('name')

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

                # ? temp box path to access to crop image
                box_path = str("./results/" + new_name + '/image0.jpg')
                # print(box_path)

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
                print("|")

                # ? Loop to check string from extract text
                for txt in eOCR:

                    # ? if txt have number in it
                    if contains_number(txt):

                        # ? remove special character
                        r = re.compile('[@_!#$%^&*`()[];:<>?/\|}{~:]')
                        re_txt = r.sub('', str(txt))
                        re_txt2 = re.sub(r"[\[\]\:\|\!\`\&]", '', re_txt)

                        print("[INFO] Detect number in (" + txt + ")")
                        print("|Remove speacial chareater to (" + re_txt2 + ")")

                        if len(re_txt2) - re_txt2.count(' ') < 2:

                            print("[INFO] Detect number have lenth less that 4")
                            print("|Remove this from append")
                            print("|")

                        else:

                            print("|")

                            # ? append key and value to json object
                            json_ocr_txt.append({'plate': re_txt2})

                    else:

                        # ? remove specaial and english charater
                        re_txt = re.sub('[A-Za-z]+', '', txt)

                        print("[INFO] Remove special char from text : " + re_txt)

                        # ? fuzzy text looking for similiar from province_th
                        # fuzzytxt = process.extract(
                        #     str(re_txt), province_th, limit=2, scorer=fuzz.token_sort_ratio)
                        fuzzytxt = fuzzy(re_txt)

                        if fuzzytxt == NULL:
                            print("[INFO] Sorting Text for (" + str(txt) + ") : ")
                            print(fuzzytxt)
                            print("|")

                            # ? append key and value to json object
                            json_ocr_txt.append({'province': NULL})
                        else:
                            print("[INFO] Sorting Text for (" + str(txt) + ") : ")
                            print(fuzzytxt)
                            print("|")

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

    print("[PAYLOAD] : ", json_ocr_txt)
    print("|")

    rows = 5
    for i in range(rows + 1, 0, -1):
        # nested reverse loop
        for j in range(0, i - 1):
            # display star
            print("*", end=' ')
        print(" ")

    # ? make image to base64 then send to ajax
    for img in results.ims:
        buffered = BytesIO()
        img_base64 = Image.fromarray(img)
        img_base64.save(buffered, format="JPEG")
        b64str = (base64.b64encode(buffered.getvalue()).decode(
            'utf-8'))  # base64 encoded image with results

    return jsonify({'status': str(b64str), 'count_result': str(count_result), 'json_ocr_txt': json_ocr_txt, 'box_path': str(box_path)})


# ? Upload to DB
@ app.route('/sendtoDB', methods=['POST'])
def sendtoDB():

    # ? Get ajax payload
    if request.method == "POST":
        # ? Get json
        data = request.json

        print("[INFO] GET DATA FROM FRONTEND")
        print("|")
        # print(type(data))

        # ? convert json to object
        # data = json.loads(data)
        plate = data['plate']
        province = data['province']
        brand = data['brand']
        type = data['type']
        color = data['color']

        plate.replace(' ', '\n')
        province.replace(' ', '\n')

        print(data['image'])
        random_p = uuid.uuid4().hex

        print(Path(data['image']).rename(
            "./static/upload/" + random_p + ".jpg"))
        image_uploda = random_p + ".jpg"

        if plate == "":
            plate = None
        if province == "":
            province = None
        if brand == "":
            brand = None
        if type == "":
            type = None
        if color == "":
            color = None

        now = datetime.now()  # current date and time

        # year = now.strftime("%Y")
        # # print("year:", year)
        # month = now.strftime("%m")
        # # print("month:", month)
        # day = now.strftime("%d")
        # # print("day:", day)
        # time = now.strftime("%H:%M:%S")
        # # print("time:", time)

        date_time = now.strftime("%m/%d/%Y, %H:%M")
        # print("date and time:", date_time)

        upload_date = date_time

        # CURRENT_TIMESTAMP()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO detect_data (plate, province, brand, type, color, upload_date, image) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                       (plate, province, brand, type, color, upload_date, image_uploda))
        conn.commit()

        return jsonify({'status': 'success'})
    return ('', 204)


# ? Root path
@ app.route("/", methods=['GET', 'POST'])
def index():
    return render_template('index.html')


# # ? datatables
@app.route("/api/table", methods=['POST', "GET"])
def api_table():
    cur = conn.cursor()
    cur.execute('select * from detect_data')
    tb_detect_data = cur.fetchall()

    data = []
    for row in tb_detect_data:
        data.append({
            'id': row[0],
            'plate': row[1],
            'province': row[2],
            'brand': row[3],
            'type': row[4],
            'color': row[5],
            'upload_date': row[6],
            'image': row[7]
        })

    # print(data)

    response = {
        'aaData': data
    }

    return jsonify(response)


# # ? datatable path
@ app.route("/table", methods=['GET', 'POST'])
def table():
    return render_template('table.html')
    # return render_template('table_ajax.html')


# ? Set Header
@ app.after_request
def after_request(response):
    # print("log: setting cors", file=sys.stderr)
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                         'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response


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
