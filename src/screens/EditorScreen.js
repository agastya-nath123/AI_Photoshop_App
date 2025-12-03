import { View } from "react-native";
import { Text, ActivityIndicator, Platform } from "react-native";
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

const API_BASE = "http://10.10.209.66:8000";

export default function EditorScreen() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [relitImage, setRelitImage] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [zValue, setZValue] = useState(50); // default Z
    const [bounds, setBounds] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    // xy state for the draggable light
    const [pos] = useState(new Animated.ValueXY({ x: 150, y: 150 }));
    const [isLoading, setIsLoading] = useState(false);

    const LIGHT_SIZE = 40;

    function pollUntilReady(jobId) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/status/${jobId}`
                );
                const json = await res.json();

                if (json.status === "ready") {
                    clearInterval(interval);
                    setIsLoading(false);
                    console.log("Backend artifacts ready.");
                } else if (json.status === "error") {
                    clearInterval(interval);
                    setIsLoading(false);
                    console.log("Processing error:", json.error);
                }
            } catch (e) {
                clearInterval(interval);
                setIsLoading(false);
            }
        }, 1000);
    }

    async function uploadImage(imageUri) {
        setIsLoading(true);

        console.log("UPLOAD START");
        let fileToUpload;
        if (!imageUri) {
            console.log("No image selected – cannot upload.");
            return;
        }
        if (imageUri.startsWith("blob:")) {
            // fetch blob data
            const blob = await fetch(imageUri).then((res) => res.blob());
            fileToUpload = new File([blob], `upload_${Date.now()}.jpg`, {
                type: blob.type || "image/jpeg",
            });
        } else {
            // real device uri
            const filename = imageUri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            fileToUpload = {
                uri: imageUri,
                name: filename,
                type,
            };
        }
        let formData = new FormData();
        formData.append("file", fileToUpload);

        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            console.log("Uploaded:", json);
            setJobId(json["job_id"]);
            pollUntilReady(json.job_id);
        } catch (err) {
            console.error("Upload error:", err);
            setIsLoading(false);
        }
    }

    async function relightImage() {
        console.log("JOB ID BEFORE RELIGHT:", jobId);

        if (!jobId) {
            console.log("No job ID yet.");
            return;
        }
        setIsLoading(true);

        // convert screen → local coords
        const x = pos.x._value - bounds.x;
        const y = pos.y._value - bounds.y;
        const z = zValue;

        console.log("BOUNDS:", bounds);
        console.log("POS:", pos.x._value, pos.y._value);
        console.log("LIGHT COORD:", x, y, z);

        if (isNaN(x) || isNaN(y)) {
            console.log("x or y is NaN — layout not ready");
            return;
        }

        const url = `${API_BASE}/relight?job_id=${jobId}&x=${x}&y=${y}&z=${z}`;
        const res = await fetch(url, {
            method: "POST",
        });

        if (!res.ok) {
            console.log("Relight error:", await res.text());
            setIsLoading(false);
            return;
        }
        if (Platform.OS === "web") {
            const blob = await res.blob();
            const uri = URL.createObjectURL(blob);
            setRelitImage(uri);
            setIsLoading(false);
            return;
        }
        const arrayBuffer = await res.arrayBuffer();
        let binary = "";
        const bytes = new Uint8Array(arrayBuffer);

        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        const base64 = btoa(binary);

        const dataUri = `data:image/jpeg;base64,${base64}`;
        setRelitImage(dataUri);
        setIsLoading(false);
    }
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
                    imageUri={relitImage || selectedImage}
                />{" "}
                <SidePanel
                    onPickImage={(uri) => {
                        setSelectedImage(uri);
                        setRelitImage(null); // <-- CRUCIAL
                        setJobId(null); // optional: force fresh upload
                    }}
                    onUploadRequest={() => {
                        if (!selectedImage) {
                            console.log("Pick an image first.");
                            return;
                        }
                        uploadImage(selectedImage);
                    }}
                />
                <SlidersPanel zValue={zValue} onZChange={setZValue} />
            </View>

            {/* Bottom bar */}
            <BottomNav onRelight={relightImage} />
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
            {isLoading && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999,
                    }}
                >
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: "white", marginTop: 12 }}>
                        Processing...
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}
