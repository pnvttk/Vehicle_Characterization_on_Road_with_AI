# # -*- coding: utf-8 -*-
# from pythainlp import word_tokenize  # ทำการเรียกตัวตัดคำ
# from pythainlp.word_vector import *  # ทำการเรียก thai2vec
# from sklearn.metrics.pairwise import cosine_similarity  # ใช้หาค่าความคล้ายคลึง
# import numpy as np
# model = get_model()  # ดึง model ของ thai2vec มาเก็บไว้ในตัวแปร model
# load into gensim
# model = KeyedVectors.load_word2vec_format(f'{model_path}thai2vec.bin',binary=True)
# from pythainlp import word_vector
# model = word_vector.get_model()

import pythainlp.word_vector

pythainlp.word_vector.similarity("คน", "มนุษย์")

# print('China + Beijing:', model.similarity('ปักกิ่ง', 'จีน'))
# print('Italy + Rome:', model.similarity('โรม', 'อิตาลี'))
# print('Beijing + Rome:', model.similarity('โรม', 'ปักกิ่ง'))
# print('Italy + Beijing:', model.similarity('ปักกิ่ง', 'อิตาลี'))
# print('China + Rome:', model.similarity('โรม', 'จีน'))
# print('China + Italy:', model.similarity('อิตาลี', 'จีน'))

# # ประกาศฟังก์ชัน sentence_vectorizer
# def sentence_vectorizer(ss, dim=300, use_mean=True):
#     s = word_tokenize(ss)
#     vec = np.zeros((1, dim))
#     for word in s:
#         if word in model.wv.index2word:
#             vec += model.wv.word_vec(word)
#         else:
#             pass
#     if use_mean:
#         vec /= len(s)
#     return vec


# def sentence_similarity(s1, s2):
#     s1 = "ผมเป็นนักศึกษาเรียนที่มหาวิทยาลัยขอนแก่น"
#     s2 = "ผมเป็นนักศึกษามหาวิทยาลัยขอนแก่น"
#     # print(sentence_similarity("ผมเป็นนักศึกษาเรียนที่มหาวิทยาลัยขอนแก่น","ผมเป็นนักศึกษามหาวิทยาลัยขอนแก่น"))
#     return cosine_similarity(sentence_vectorizer(str(s1)), sentence_vectorizer(str(s2)))
