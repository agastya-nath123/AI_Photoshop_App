import { View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState } from "react";
import { Animated } from "react-native";
import TopBar from "../components/TopBar";
import MainImage from "../components/MainImage";
import SidePanel from "../components/SidePanel";
import SlidersPanel from "../components/SlidersPanel";
import BottomNav from "../components/BottomNav";
import { PanResponder } from "react-native";

export default function EditorScreen() {
    const LIGHT_SIZE = 40;

    const [bounds, setBounds] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    // xy state for the draggable light
    const [pos] = useState(new Animated.ValueXY({ x: 150, y: 150 }));

    // Drag logic
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,

        onPanResponderMove: (evt, gesture) => {
            // raw screen coords
            let newX = gesture.moveX - LIGHT_SIZE / 2;
            let newY = gesture.moveY - LIGHT_SIZE / 2;

            // clamp X
            newX = Math.max(
                bounds.x,
                Math.min(newX, bounds.x + bounds.width - LIGHT_SIZE)
            );

            // clamp Y
            newY = Math.max(
                bounds.y,
                Math.min(newY, bounds.y + bounds.height - LIGHT_SIZE)
            );

            pos.setValue({ x: newX, y: newY });
        },
        onPanResponderRelease: () => {
            // You can clamp here AFTER dropping
        },
    });

    const [selectedImage, setSelectedImage] = useState(null);
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, backgroundColor: "#101010" }}
        >
            {/* Main content */}
            <View
                style={{
                    flex: 1,
                    paddingBottom: insets.bottom + 80, // hard space for sliders
                }}
            >
                <TopBar />
                <MainImage
                    onLayout={(layout) => setBounds(layout)}
                    imageUri={selectedImage}
                />
                <SidePanel onPickImage={setSelectedImage} />
                <SlidersPanel />
            </View>

            {/* Bottom bar */}
            <BottomNav />
            <View
                pointerEvents="box-none"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                }}
            >
                {/* This container doesn't block touches. Put the light inside it (pointerEvents auto) */}
                <Animated.View
                    {...panResponder.panHandlers}
                    // panHandlers from your PanResponder or GestureHandler
                    style={{
                        position: "absolute",
                        width: LIGHT_SIZE,
                        height: LIGHT_SIZE,
                        borderRadius: LIGHT_SIZE / 2,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderWidth: 2,
                        borderColor: "#fff",
                        zIndex: 9999,
                        elevation: 9999,
                        transform: [
                            { translateX: pos.x },
                            { translateY: pos.y },
                        ],
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
