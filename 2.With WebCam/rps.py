# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function    
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
import  numpy as np    
import PIL.Image as Image       
import time    
import cv2
from pyfirmata import Arduino
board = Arduino('/dev/ttyACM0')
little = board.get_pin('d:3:s')
ring = board.get_pin('d:5:s')
middle = board.get_pin('d:6:s')
thumb = board.get_pin('d:9:s')
index = board.get_pin('d:10:s')
def rock():
    thumb.write(170)
    index.write(170)
    middle.write(170)
    ring.write(170)
    little.write(170)

def paper():
    thumb.write(10)
    index.write(10)
    middle.write(10)
    ring.write(10)
    little.write(10)

def scissor():
    thumb.write(170)
    index.write(10)
    middle.write(10)
    ring.write(170)
    little.write(170)
def rps(model_dir, classes):
        
    clicked = False      
    def onMouse(event, x, y, flags, param):      
        global clicked      
        if event == cv2.EVENT_LBUTTONUP:      
            clicked = True      
          
    cameraCapture = cv2.VideoCapture(2)
    cameraCapture.set(3, 100)
    cameraCapture.set(4, 100)
    cv2.namedWindow('MyWindow')      
    cv2.setMouseCallback('MyWindow', onMouse)      
          
    print('showing camera feed. Click window or press and key to stop.')      
    success, frame = cameraCapture.read()      
    print(success)      
    count = 0    
    flag = 0    
    
    saver = tf.train.import_meta_graph(model_dir+".meta")    
    with tf.Session() as sess:    
        saver.restore(sess, model_dir)    
        x = tf.get_default_graph().get_tensor_by_name("images:0")    
        keep_prob = tf.get_default_graph().get_tensor_by_name("keep_prob:0")    
        y = tf.get_default_graph().get_tensor_by_name("fc2/output:0")    
        count=0    
        while success and cv2.waitKey(1)==-1 and not clicked:    
            time1 = time.time()    
            cv2.imshow('MyWindow', frame)      
            success, frame = cameraCapture.read()    
            img = Image.fromarray(frame)
            # 将图片转化成灰度并缩小尺寸
            img = np.array(img.convert('L').resize((28, 28)),dtype=np.float32)    
                
            img = img.reshape((1,28*28))    
            img = img/255.0
            prediction = sess.run(y, feed_dict={x:img,keep_prob: 1.0})
            index = np.argmax(prediction)    
            probability = prediction[0][index]
            if index==0 and flag!=0 and probability>0.8:
                  print('you paper, me scissor')
                  scissor()
                  flag=0
            elif index==1 and flag!=1 and probability>0.8:
                  print('you rock, me paper')
                  paper()
                  flag = 1
            elif index==2 and flag!=2 and probability>0.8:
                  print('you scissor, me rock')
                  rock()
                  flag = 2
            elif index == 3 and flag != 3 and probability > 0.8:
                # rotate(p, -30)
                print('hey, show either rock, paper or scissor')
                flag = 3
        cv2.destroyWindow('MyWindow')      
        cameraCapture.release()
if __name__=="__main__":
    classes = ['paper', 'rock', 'scissors', 'others']
    model_dir="model/model.ckpt"
    time.sleep(2)
    rps(model_dir, classes)