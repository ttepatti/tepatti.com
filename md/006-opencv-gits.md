---
layout: blog
title: OpenCV and Ghost in the Shell
description: Implementing OpenCV's facial recognition for a fun Ghost in the Shell inspired script.
date: 20020127
type: blog
---

## OpenCV and Ghost in the Shell
### 2020-01-27
#### By Tim Tepatti

## Overview

The point of this project was to be able to take a live video feed and draw the Ghost in the Shell "Laughing Man" image over every detected face. It was done as a fun way to get more familiar with both Python and OpenCV.

For those of you who were stumbling around online looking for code to utilize, just like I was when I made this project: This project goes over how to draw an image over another image using OpenCV.

While doing the research for this project, I kept referring back to two main blog posts that carried me most of the way through this project. The first was Shantnu Tiwari's <a href="https://realpython.com/face-recognition-with-python/">Face Recognition with Python, in Under 25 Lines of Code</a> over on Real Python. It helped me get my feet wet with OpenCV and Python and gave me a great jumping-off point to get deeper into OpenCV. The second was the wonderful work of Noah Dietrich over at Sublime Robots - he wrote a great article called <a href="https://sublimerobots.com/2015/02/dancing-mustaches/">Adding Mustaches to Webcam Feed with OpenCV and Python</a>. After struggling for hours on RGBA Alpha channels, masks, inverted masks, and all of the other intracacies of OpenCV and image manipulation, it was Noah's post that carried me to the finish line. 

## Current Progress

Currently, it can detect faces in still images (provided via command line argument) and draw the laughing man over them. Success!

Below, you can see a side-by-side of the test image and the final product.

![Side-by-side comparison of test image and final product.](/assets/gits/results.jpg "Side-by-side comparison of test image and final product.")

## Code

First things first - if you want to view everything about this project, you can find the repository <a href="https://github.com/ttepatti/GITS-Detect">here on my GitHub</a>.

That being said, lets go over the current version of the code:

```python
import cv2
import sys

# --------------- Image Paths ---------------
# Get user supplied image
faceImagePath = sys.argv[1]

# The Ghost in the Shell image
gitsImagePath = "laughing_man_transparent.png"

# Our cascade
cascPath = "haarcascade_frontalface_default.xml"

# --------------- Loading Cascade/Images ---------------

# Create the haar cascade
faceCascade = cv2.CascadeClassifier(cascPath)

# Read the image of faces
faceImage = cv2.imread(faceImagePath)

# Load unchanged so it keeps channel 4 (alpha)
gitsImage = cv2.imread(gitsImagePath, cv2.IMREAD_UNCHANGED)

# gitsAlpha = alpha channel of gitsImage (creating mask)
gitsAlpha = gitsImage[:,:,3]

# gitsAlpha_inv = inverted mask
gitsAlpha_inv = cv2.bitwise_not(gitsAlpha)

# Convert gits image to RGB (no Alpha)
gitsRGB = gitsImage[:,:,0:3]

# --------------- Face Detection ---------------

# Gray channel of background image for cascade
gray = cv2.cvtColor(faceImage, cv2.COLOR_BGR2GRAY)

# Detect faces in the image
faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(30, 30),
    flags = cv2.CASCADE_SCALE_IMAGE
)

print("Found {0} faces!".format(len(faces)))

print(faces)

# --------------- Loop through faces ---------------

for (x, y, w, h) in faces:
    # Make x, y around 30% different from where they were (to deal with the bigger gits image)
    x = int(x - (w * 0.3))
    y = int(y - (h * 0.3))

    # Just in case we go out of bounds!
    if x < 0: x = 0
    if y < 0: y = 0


    # Grow the gits image by 50%
    w = int(w + (w * 0.5))
    h = int(h + (h * 0.5))

    # Get region of interest around faces
    # the y+h is because we're getting the y coord of the lower right corner
    # same with x+w
    roi_gray = gray[y:y+h, x:x+w]
    roi_color = faceImage[y:y+h, x:x+w]

    # Resize the RGB image, mask, and inverted mask to the size of the face
    gits = cv2.resize(gitsRGB, (w, h), interpolation = cv2.INTER_AREA)
    mask = cv2.resize(gitsAlpha, (w, h), interpolation = cv2.INTER_AREA)
    mask_inv = cv2.resize(gitsAlpha_inv, (w, h), interpolation = cv2.INTER_AREA)

    # roi_bg will contain the original image only where there is no face
    roi_bg = cv2.bitwise_and(roi_color, roi_color, mask = mask_inv)

    # roi_fg contains the image of the gits symbol without the background (afaik?)
    roi_fg = cv2.bitwise_and(gits, gits, mask = mask)

    # join the roi_bg and roi_fg
    dst = cv2.add(roi_bg, roi_fg)

    # place the joined final image in dst
    faceImage[y:y+h, x:x+w] = dst

cv2.imshow("What I thought I'd do was, I'd pretend I was one of those deaf-mutes", faceImage)
cv2.waitKey(0)
```

While I think the code is well commented, I'll go over my code block-by-block, similar to what Noah did :) For the sections below, the code will come first, and the comments about it will be underneath.

### 1 - Image Paths

```python
# --------------- Image Paths ---------------
# Get user supplied image
faceImagePath = sys.argv[1]

# The Ghost in the Shell image
gitsImagePath = "laughing_man_transparent.png"

# Our cascade
cascPath = "haarcascade_frontalface_default.xml"
```

First things first, setting up our paths. When hardcoding strings, I prefer to leave them at the top of my source code like this, and then simply reference the path's variable elsewhere in the code. This gives two main benefits: A short-hand way of writing the full path, and the ability to change the path with a single line, not having to hunt down multiple variables.

The faceImagePath is supplied by command line arguments, and is the photo in which we want to detect faces. The gitsImagePath is the path to the transparent Laughing Man image, which is what we want to draw over the faces we detect. Finally, the cascPath is our Haar Cascade, in this case for detecting faces.

### 2 - Loading the Cascade and Images

```python
# --------------- Loading Cascade/Images ---------------

# Create the haar cascade
faceCascade = cv2.CascadeClassifier(cascPath)

# Read the image of faces
faceImage = cv2.imread(faceImagePath)

# Load unchanged so it keeps channel 4 (alpha)
gitsImage = cv2.imread(gitsImagePath, cv2.IMREAD_UNCHANGED)

# gitsAlpha = alpha channel of gitsImage (creating mask)
gitsAlpha = gitsImage[:,:,3]

# gitsAlpha_inv = inverted mask
gitsAlpha_inv = cv2.bitwise_not(gitsAlpha)

# Convert gits image to RGB (no Alpha)
gitsRGB = gitsImage[:,:,0:3]
```

First, we load our Haar Cascade, and store it as faceCascasde. Next, we load both the faceImage and gitsImage. The reason we load gitsImage with cv2.IMREAD_UNCHANGED is because the image is actually an RGBA image, meaning it contains an alpha channel (transparency)! We want to load the image unchanged (eg. don't convert it in a way that would strip it of the alpha channel) so that we can properly apply the transparency later. You may also see a shorthand way of doing this in which the programmer replaces cv.IMREAD_UNCHANGED with the value -1. This accomplishes the same thing :)

Next, we create the alpha mask by taking a mask of the original gitsImage and saving it as gitsAlpha. What we're actually doing here is the same method used to create "regions of interest" in OpenCV. The empty : arguments would usually contain y1:y2,x1:x2 co-ordinates to select a certain region, and the third argument is the channel of the image. Channel 0 is red, 1 is green, 2 is blue, and 3 is alpha. (Note: This method for getting image channels is actually specific to Python and how Python stores images as NumPy arrays - If you're confused about this part, go look that up! It isn't OpenCV-related)

Next, we use OpenCV's bitwise_not to create an inverted alpha mask. The non-inverted mask defines the area of our object, while the inverted mask defines the area around our object.

Finally, we convert our original image to a 3-channel RGB image to remove the alpha layer and save it in the gitsRGB variable.

### 3 - Face Detection

```python
# --------------- Face Detection ---------------

# Gray channel of background image for cascade
gray = cv2.cvtColor(faceImage, cv2.COLOR_BGR2GRAY)

# Detect faces in the image
faces = faceCascade.detectMultiScale(
    gray,
    scaleFactor=1.1,
    minNeighbors=5,
    minSize=(30, 30),
    flags = cv2.CASCADE_SCALE_IMAGE
)

print("Found {0} faces!".format(len(faces)))

print(faces)
```

Here's where we do our actual face detection, yay! First things first, generate a gray version of our faceImage. We do this because Haar Cascades only operate on grayscale images.

Next, we run the actual Haar Cascade detection. We give detectMutliScale the following parameters:

- Image - our new grayscale image
- scaleFactor - Allows us to detect faces slightly larger or smaller than in the original cascade
- minNeighbors - You can read more about this <a href="https://stackoverflow.com/questions/22249579/opencv-detectmultiscale-minneighbors-parameter">here</a> - it's actually super interesting! Try upping this value if you're getting false positives.
- minSize - The minimum resolution of the face, in this case 30x30
- flags - This is a weird, old, undocumented feature. We use it because we're using an "old" cascade. You can read more about this oddity at <a href="https://github.com/opencv/opencv/issues/4387">this GitHub Issue.</a>

Next, we print the total number of faces we found, along with the actual Python List of faces. This terminal output isn't necessary, but I found it to be very helpful when debugging and playing around.

### 4 - Looping Through Our Found Faces

```python
# --------------- Loop through faces ---------------

for (x, y, w, h) in faces:
    # Make x, y around 30% different from where they were (to deal with the bigger gits image)
    x = int(x - (w * 0.3))
    y = int(y - (h * 0.3))

    # Just in case we go out of bounds!
    if x < 0: x = 0
    if y < 0: y = 0

    # Grow the gits image by 50%
    w = int(w + (w * 0.5))
    h = int(h + (h * 0.5))
```

We start a for loop on the "faces" list, which contains a list of coordinates for each of the faces found. The x and y coordinates are the upper left corner of the rectangle containing the face, and w and h store the overall width and height of the face's rectangle.

Because faces are only a portion of a person's overall head, and the Ghost in the Shell Laughing Man face is supposed to cover the person's entire head, we do some modifications on this value to enlargen the rectangle highlighting the face.

Since we're increasing the overall size of the rectangle by 50% later on in the code, we also need to change the position of the upper left corner of the rectangle (our x and y values). If we don't change these values, the rectangle will grow to the right and down, making it off-center of the face. I decided that even though we're increasing the overall size of the rectangle by 50%, I would only move the X and Y values as if it was growing by 30%. I simply played around with these numbers, and this combination felt the most correct.

As such, the first calculation we're doing (w * 0.3) is calculating how much the width of the rectangle will grow. If our initial value of w is 50, a 30% increase in size (w * 0.3) equals 15 extra pixels of width. We subtract this number from our x value, to shift x to the left by 15 pixels. We then int() cast the entire thing - this is because pixels have to be whole numbers, if you leave in decimals the program will error out.

After we do the same calculation for our y value and the height of our rectangle, we check to make sure both of these numbers are positive. Just like decimal points, you also can't have negative pixels! If we find any negative values, we simply set them equal to 0, to be the closest approximation.

Finally, we grow the actual rectangle. We add the current width and height to the old value multiplied by 0.5, meaning a 50% size increase. I found that a 50% increase in size generally covers people's entire heads quite well! Again, if you don't like any of these values, feel free to play around with them :)

### 5 - Face Region of Interest (ROI)

```python
    # Get region of interest around faces
    # the y+h is because we're getting the y coord of the lower right corner
    # same with x+w
    roi_color = faceImage[y:y+h, x:x+w]
```

This section is fairly short - what we're doing here is getting a region of interest that is the size of the rectangle we sized in the last step. You can think of a Region of Interest as a set of subpixels in an image, a chunk that you want to modify.

In this case, we only need a color version of the Region of Interest, since we're doing our final image manipulation. Other scripts, such as ones that are looking for sub-features on a face (like a nose, eyes, etc) will usually grab a gray region of interest here, that way they can utilize additional Haar Cascades to search for features within it. We're not doing that here, so don't worry about it!

### 6 - Resize the Image and Mask

```python
    # Resize the RGB image, mask, and inverted mask to the size of the face
    gits = cv2.resize(gitsRGB, (w, h), interpolation = cv2.INTER_AREA)
    mask = cv2.resize(gitsAlpha, (w, h), interpolation = cv2.INTER_AREA)
    mask_inv = cv2.resize(gitsAlpha_inv, (w, h), interpolation = cv2.INTER_AREA)
```

Here, we're taking our face-covering image (which was saved as gitsRGB), our alpha-channel version of that (gitsAlpha), and our inverted alpha-channel version (gitsAlpha_inv) and resizing them all to fit within the rectangle we created earlier. To do this, we simply call cv2.resize while passing it the images, the new width and height, and our interpolation type, which is cv2.INTER_AREA. If you'd like to learn more about Interpolation and how it relates to image resizing, Wenru Dong wrote a great Medium article you can <a href="https://medium.com/@wenrudong/what-is-opencvs-inter-area-actually-doing-282a626a09b3">check out here</a>.

### 7 - bitwise_and() to Remove Faces

```python
    # roi_bg will contain the cropped face region of interest with the shape of our mask_inv "cut out" of it
    roi_bg = cv2.bitwise_and(roi_color, roi_color, mask = mask_inv)

    # roi_fg contains the image of the gits symbol without the background
    roi_fg = cv2.bitwise_and(gits, gits, mask = mask)
```

We now perform a bitwise_and() on the original color region of interest (roi_color) to cut a gits-shaped hole out of it. We then apply a bitwise_and() on the gits image to cut the background out of the gits image, creating the final laughing man image that's composited over the hole. So roi_bg is the hole cut in the background, and roi_fg is the laughing man image which is copied into it.

### 8 - Combine!

```python
    # join the roi_bg and roi_fg
    dst = cv2.add(roi_bg, roi_fg)

    # add our dst image in place of the old face within faceImage
    faceImage[y:y+h, x:x+w] = dst
```

Finally, we reach the simplest part. We create an image called dst where we join roi_bg and roi_fg to create our final face image. From there, we set the old area of the face equal to our new face image, effectively copying the new laughing man-adorned image over the old face. From here, the program will continue looping until it's done these steps to all of the faces within the image.

### 9 - Done!!

```python
cv2.imshow("What I thought I'd do was, I'd pretend I was one of those deaf-mutes", faceImage)
cv2.waitKey(0)
```

All that's left now is to display the image for the user! The first argument of cv2.imshow() is the window name, which I lovingly named after the quote shown on the laughing man image. (<a href="https://www.goodreads.com/quotes/629243-i-thought-what-i-d-do-was-i-d-pretend-i-was">The original quote is by J.D. Salinger, and is quite good.</a>) We pass the name of the image as our second argument, and then call waitKey() to wait for the user to press a key to close the image. Easy stuff!

### In Conclusion...

Congrats, you made it to the end! This was just a project I did for fun, because I wanted to try playing with Python and OpenCV :) I'm sure there are many great ways it could be improved! If you find a glaring mistake or have a question about something, I'd be more than happy to chat - feel free to <a href="/contact/">contact me</a>!

## Future Additions

The current To-Do list for this project is as follows:

1. Implement reading frames from a webcam instead of a single still image
3. Possibly change the cascade to detect heads, rather than faces? It may be more accurate that way, and could cover someone who is turned around.

