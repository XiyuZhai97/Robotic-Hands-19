from PIL import Image  
from matplotlib.pylab import *  
import numpy as np  
import argparse
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf  
import time  
  
w = 28  
h = 28  
classes = ['paper','rock','scissors','others']
  
def main(args):  
    filename = 'images/others/image1.jpg'
    model_dir = 'model/model.ckpt'  
      
    # Restore model  
    saver = tf.train.import_meta_graph(model_dir+".meta")  
      
    with tf.Session() as sess:  
        saver.restore(sess, model_dir)  
        x = tf.get_default_graph().get_tensor_by_name("images:0")  
        keep_prob = tf.get_default_graph().get_tensor_by_name("keep_prob:0")  
        y = tf.get_default_graph().get_tensor_by_name("fc2/output:0")
        # Read image  
        pil_im = array(Image.open(filename).convert('L').resize((w,h)),dtype=float32)  
        pil_im = pil_im/255.0  
        pil_im = pil_im.reshape((1,w*h))
        time1 = time.time()  
        prediction = sess.run(y, feed_dict={x:pil_im,keep_prob: 1.0})
        print(prediction)
        index = np.argmax(prediction)  
        time2 = time.time()  
        print("The classes is: %s. (the probability is %g)" % (classes[index], prediction[0][index]))
          
        print("Using time %g" % (time2-time1))  
def parse_arguments(argv):  
    parser = argparse.ArgumentParser()  
  
    parser.add_argument('--filename', type=str,  
                        help="The image name",default="images/paper/image104.jpg")  
    parser.add_argument('--model_dir', type=str,  
                        help="model file", default="model/model.ckpt")  
    return parser.parse_args(argv)  
  
if __name__=="__main__":  
    main(parse_arguments(sys.argv[1:]))  
