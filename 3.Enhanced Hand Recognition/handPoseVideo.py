import cv2
import time
import numpy as np
import os
from pyfirmata import Arduino
board = Arduino('/dev/ttyACM0')
littleservor = board.get_pin('d:3:s')
ringservor = board.get_pin('d:5:s')
middleservor = board.get_pin('d:6:s')
thumbservor = board.get_pin('d:9:s')
indexservor = board.get_pin('d:10:s')
thumbservor.write(180)
def servothumb(thumb1,index1,middle1,ring1,little1):

    thumbservor.write(min(2*(180-thumb1),180))
    indexservor.write(min(2*(180-index1),180))
    middleservor.write(min(2*(180-middle1),180))
    ringservor.write(min(2*(180-ring1),180))
    littleservor.write(min(2*(180-little1),180))

protoFile = "hand/pose_deploy.prototxt"
weightsFile = "hand/pose_iter_102000.caffemodel"
nPoints = 22
POSE_PAIRS = [ [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20] ]

threshold = 0.2


#input_source1 = "mofang.mp4"
input_source2 = "mofang3.mp4"
cap = cv2.VideoCapture(input_source2)
hasFrame, frame = cap.read()

frameWidth = frame.shape[1]
print(frameWidth)
frameHeight = frame.shape[0]
print(frameHeight)


aspect_ratio = frameWidth/frameHeight
k = 0
inHeight = 368
inWidth = int(((aspect_ratio*inHeight)*8)//8)

vid_writer = cv2.VideoWriter('output.avi',cv2.VideoWriter_fourcc('M','J','P','G'), 15, (frame.shape[1],frame.shape[0]))

net = cv2.dnn.readNetFromCaffe(protoFile, weightsFile)

while k == 0:
    k+=1
    t = time.time()
    hasFrame, frame = cap.read()
    #print("1 = {}".format(time.time() - t))
    frameCopy = np.copy(frame)
    #print("2 = {}".format(time.time() - t))
    if not hasFrame:
        cv2.waitKey()
        break
    #print("3 = {}".format(time.time() - t))
    inpBlob = cv2.dnn.blobFromImage(frame, 1.0 / 255, (inWidth, inHeight),
                              (0, 0, 0), swapRB=False, crop=False)
    #print("4 = {}".format(time.time() - t))
    net.setInput(inpBlob)
    #print("5 = {}".format(time.time() - t))
    output = net.forward()	
    #print("forward = {}".format(time.time() - t))

    # Empty list to store the detected keypoints
    points = []

    for i in range(nPoints):
        # confidence map of corresponding body's part.
        probMap = output[0, i, :, :]
        probMap = cv2.resize(probMap, (frameWidth, frameHeight))

        # Find global maxima of the probMap.
        minVal, prob, minLoc, point = cv2.minMaxLoc(probMap)

        if prob > threshold :
            cv2.circle(frameCopy, (int(point[0]), int(point[1])), 6, (0, 255, 255), thickness=-1, lineType=cv2.FILLED)
            cv2.putText(frameCopy, "{}".format(i), (int(point[0]), int(point[1])), cv2.FONT_HERSHEY_SIMPLEX, .8, (0, 0, 255), 2, lineType=cv2.LINE_AA)

            # Add the point to the list if the probability is greater than the threshold(0.2)
            points.append((int(point[0]), int(point[1])))
            

        else :
            points.append(None)
            
    #print(points)
    if not points[0] is None:
        if not points[9] is None:                                      #get the distance between the hand and the camera
            if not points[4] is None:
            	if not points[8] is None:
            		if not points[12] is None:
            			if not points[16] is None:
            				if not points[20] is None:
            					distanceindex0 = np.square(points[0][0]-points[8][0])+np.square(points[0][1]-points[8][1])
            		        	distancethumb0 = np.square(points[0][0]-points[4][0])+np.square(points[0][1]-points[4][1])
                               	distancemiddle0 = np.square(points[0][0]-points[12][0])+np.square(points[0][1]-points[12][1])				
                               	distancering0 = np.square(points[0][0]-points[16][0])+np.square(points[0][1]-points[16][1])
                               	distancelittle0 = np.square(points[0][0]-points[20][0])+np.square(points[0][1]-points[20][1])
                               	distancenow0 = np.square(points[0][0]-points[9][0])+np.square(points[0][1]-points[9][1]) 
        #                 	else :
        #         	        	print("little not detected")
        #     			else :
        #     	            print("ring not detected")	
        #     		else :
        #     		    print("middle not detected")	
        #     	else :
        #         	print("Index not detected")
        #     else :
        #         print("Thumb not detected")                                                                                                                         #thumb distance
        # else :


        
            				

    # Draw Skeleton
    for pair in POSE_PAIRS:
        partA = pair[0]
        partB = pair[1]
        if points[partA] and points[partB]:
            cv2.line(frame, points[partA], points[partB], (0, 255, 255), 2, lineType=cv2.LINE_AA)
            cv2.circle(frame, points[partA], 5, (0, 0, 255), thickness=-1, lineType=cv2.FILLED)
            cv2.circle(frame, points[partB], 5, (0, 0, 255), thickness=-1, lineType=cv2.FILLED)
    cv2.imshow('Output-Skeleton', frame)
    key = cv2.waitKey(1)
    if key == 27:
        break
    
    print("total = {}".format(time.time() - t))

    vid_writer.write(frame)

vid_writer.release()


cap = cv2.VideoCapture(input_source2)
hasFrame, frame = cap.read()

frameWidth = frame.shape[1]
frameHeight = frame.shape[0]

aspect_ratio = frameWidth/frameHeight
k = 0
inHeight = 368
inWidth = int(((aspect_ratio*inHeight)*8)//8)

vid_writer = cv2.VideoWriter('output.avi',cv2.VideoWriter_fourcc('M','J','P','G'), 15, (frame.shape[1],frame.shape[0]))

net = cv2.dnn.readNetFromCaffe(protoFile, weightsFile)
print("confirm your hand position, press any key to continue")

while 1:
    k+=1
    t = time.time()
    hasFrame, frame = cap.read()
    frameCopy = np.copy(frame)
    if not hasFrame:
        cv2.waitKey()
        break
    inpBlob = cv2.dnn.blobFromImage(frame, 1.0 / 255, (inWidth, inHeight),
                              (0, 0, 0), swapRB=False, crop=False)
    net.setInput(inpBlob)
    output = net.forward()	
    # Empty list to store the detected keypoints
    points = []
    for i in range(nPoints):
        probMap = output[0, i, :, :]
        probMap = cv2.resize(probMap, (frameWidth, frameHeight))
        minVal, prob, minLoc, point = cv2.minMaxLoc(probMap)
        if prob > threshold :
            cv2.circle(frameCopy, (int(point[0]), int(point[1])), 6, (0, 255, 255), thickness=-1, lineType=cv2.FILLED)
            cv2.putText(frameCopy, "{}".format(i), (int(point[0]), int(point[1])), cv2.FONT_HERSHEY_SIMPLEX, .8, (0, 0, 255), 2, lineType=cv2.LINE_AA)
            points.append((int(point[0]), int(point[1])))
        else :
            points.append(None)
    if not points[0] is None:
            if not points[9] is None:
            	distancenow=np.square(points[0][0]-points[9][0])+np.square(points[0][1]-points[9][1])                                       #get the distance between the hand and the camera
            	if not points[4] is None:
            		distancethumb=np.square(points[0][0]-points[4][0])+np.square(points[0][1]-points[4][1])
                else:
                	print("Thumb not detected")                                                                                                                         #thumb distance
            	if not points[8] is None:
            		distanceindex=np.square(points[0][0]-points[8][0])+np.square(points[0][1]-points[8][1])
                else:
                	print("Index not detected")                                                                                                                         #index distance
                if not points[12] is None:
            		distancemiddle=np.square(points[0][0]-points[12][0])+np.square(points[0][1]-points[12][1])
            	else:
            		print("middle not detected")                                                                            #middle distance
            	if not points[16] is None:
            		distancering=np.square(points[0][0]-points[16][0])+np.square(points[0][1]-points[16][1])  
            	else:
            	    print("ring not detected")                                                                             #ring  distance
                if not points[20] is None:
                	distancelittle=np.square(points[0][0]-points[20][0])+np.square(points[0][1]-points[20][1])
                else:
                	print("little not detected")    	                                                                                                      #little distance
    else:
        print("please relocate your hand!")					
	
    # Draw Skeleton
    for pair in POSE_PAIRS:
        partA = pair[0]
        partB = pair[1]
        if points[partA] and points[partB]:
            cv2.line(frame, points[partA], points[partB], (0, 255, 255), 2, lineType=cv2.LINE_AA)
            cv2.circle(frame, points[partA], 5, (0, 0, 255), thickness=-1, lineType=cv2.FILLED)
            cv2.circle(frame, points[partB], 5, (0, 0, 255), thickness=-1, lineType=cv2.FILLED)
           
     #servo angel calculation
    p = 1
    little = 180*p*distancelittle/distancelittle0
    if little > 180:
    	little = 180	
    print("little",little)
    ring = 180*p*distancering/distancering0
    if ring > 180:
    	ring=180
    print("ring",ring)
    middle = 180*p*distancemiddle/distancemiddle0
    if middle > 180:
    	middle=180
    print("middle",middle)
    index = 180*p*distanceindex/distanceindex0
    if index>180:
    	index=180
    print("index",index)
    thumb = 180*p*distancethumb/distancethumb0
    if thumb>180:
    	thumb=180
    print("thumb",thumb)
    servothumb(thumb,index,middle,ring,little)
    cv2.imshow('Output-Skeleton', frame)
    key = cv2.waitKey(1)
    if key == 27:
        break
    print("total = {}".format(time.time() - t))
    vid_writer.write(frame)
vid_writer.release()
