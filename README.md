# AI_Photoshop_App

A mobile photo-relighting prototype built with **Expo + React Native**.
The app allows users to load an image, adjust lighting properties, apply relighting effects, and preview the results in real time.

## Features

- Import a photo from device storage
- Adjustable lighting intensity
- Adjustable hue with a gradient hue slider
- Thumbnail selector with add button
- Clean mobile UI based on Figma design
- Works in Expo Go with QR scanning
- Built-in safe area handling for iPhone notch/Dynamic Island

## Tech Stack

- **React Native**
- **Expo**
- **React Navigation**
- **expo-linear-gradient** (for gradient hue slider)
- **react-native-svg** + **react-native-svg-transformer** (for SVG icons)
- **@expo/vector-icons** (UI icons)
- **react-native-safe-area-context** (notch support)

## Project Structure

my-app/
App.js
metro.config.js
babel.config.js
assets/
icons/
images/
src/
screens/
HomeScreen.js
EditorScreen.js
components/
TopBar.js
MainImage.js
SidePanel.js
SlidersPanel.js
BottomNav.js

## Getting Started

### Install dependencies:

```sh
npm install

### Start the development server:

