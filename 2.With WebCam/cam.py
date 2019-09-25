# -*- coding: utf-8 -*-
import cv2
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
while success and cv2.waitKey(1)==-1 and not clicked:  
    cv2.imshow('MyWindow', frame)
    success, frame = cameraCapture.read()  
    name = 'images/image'+str(count)+'.jpg'  
    cv2.imwrite(name,frame)
    count+=1  
  
cv2.destroyWindow('MyWindow')  
cameraCapture.release()  
