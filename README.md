# GestureFlow — Hand Gesture Recognition MVP

## Project Overview

GestureFlow is a web-based hand gesture recognition project designed to enable touchless interaction with website elements using a webcam.

The application uses MediaPipe for hand landmark detection and React for the interactive user interface.

## Technologies Used

- React.js
- JavaScript
- MediaPipe Tasks Vision
- HTML5 and CSS3
- Vite

## MVP Features

The MVP is designed to support:

- Webcam-based hand tracking
- Detection of 21 hand landmarks
- Index-finger-based virtual cursor
- Pinch gesture recognition
- Drag-and-drop interaction with a virtual object

## How It Works

1. The browser captures video through the webcam.
2. MediaPipe processes video frames and estimates hand landmarks.
3. The application calculates the distance between the thumb and index fingertip.
4. A pinch gesture initiates object selection.
5. Hand movement changes the selected object's position.
6. Releasing the pinch ends the interaction.

## Installation

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal and allow webcam access.

## Current Status

MVP implementation in progress. Features should be marked as tested only after successful verification.

## Future Improvements

- Multiple draggable objects
- Gesture-based resizing and rotation
- Two-hand interaction
- Improved gesture stability
- Custom gesture classification

## Project Goal

To develop an intuitive, touchless web interaction system using real-time computer vision.