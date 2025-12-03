import { View, Text, ActivityIndicator, Platform, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Animated, PanResponder } from "react-native";
import TopBar from "../components/TopBar";
import MainImage from "../components/MainImage";
import SidePanel from "../components/SidePanel";
import SlidersPanel from "../components/SlidersPanel";
import BottomNav from "../components/BottomNav";

const RELIGHT_API = "http://10.10.209.66:8000";
const SEGMENT_API = "http://localhost:8000"; // Update with your segmentation server IP

export default function EditorScreen() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [relitImage, setRelitImage] = useState(null);
    const [mode, setMode] = useState('relight'); // 'relight' or 'segment'
    
    // Relighting state
    const [relightJobId, setRelightJobId] = useState(null);
    const [zValue, setZValue] = useState(50);
    const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [pos] = useState(new Animated.ValueXY({ x: 150, y: 150 }));
    const [isRelightReady, setIsRelightReady] = useState(false);
    
    // Segmentation state
    const [segmentJobId, setSegmentJobId] = useState(null);
    const [clickPoints, setClickPoints] = useState([]);
    const [segmentedObjects, setSegmentedObjects] = useState([]); // [{id, croppedUri, position, size}]
    const [inpaintedBackground, setInpaintedBackground] = useState(null);
    const [isSegmentReady, setIsSegmentReady] = useState(false);
    const [activeObjectId, setActiveObjectId] = useState(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');

    const LIGHT_SIZE = 40;

    // ========== RELIGHTING FUNCTIONS ==========
    function pollRelightStatus(jobId) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${RELIGHT_API}/status/${jobId}`);
                const json = await res.json();

                if (json.status === "ready") {
                    clearInterval(interval);
                    setIsLoading(false);
                    setIsRelightReady(true);
                    console.log("Relight backend ready.");
                } else if (json.status === "error") {
                    clearInterval(interval);
                    setIsLoading(false);
                    console.log("Relight error:", json.error);
                }
            } catch (e) {
                clearInterval(interval);
                setIsLoading(false);
            }
        }, 1000);
    }

    async function uploadForRelighting(imageUri) {
        setIsLoading(true);
        setLoadingMessage('Uploading for relighting...');

        let fileToUpload;
        if (imageUri.startsWith("blob:")) {
            const blob = await fetch(imageUri).then((res) => res.blob());
            fileToUpload = new File([blob], `upload_${Date.now()}.jpg`, {
                type: blob.type || "image/jpeg",
            });
        } else {
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
            const res = await fetch(`${RELIGHT_API}/upload`, {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            console.log("Uploaded for relighting:", json);
            setRelightJobId(json["job_id"]);
            pollRelightStatus(json.job_id);
        } catch (err) {
            console.error("Upload error:", err);
            setIsLoading(false);
        }
    }

    async function relightImage() {
        if (!relightJobId) {
            console.log("No relight job ID yet.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage('Applying relight...');

        const x = pos.x._value - bounds.x;
        const y = pos.y._value - bounds.y;
        const z = zValue;

        const url = `${RELIGHT_API}/relight?job_id=${relightJobId}&x=${x}&y=${y}&z=${z}`;
        const res = await fetch(url, { method: "POST" });

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

    // ========== SEGMENTATION FUNCTIONS ==========
    async function uploadForSegmentation(imageUri) {
        setIsLoading(true);
        setLoadingMessage('Uploading for segmentation...');

        let fileToUpload;
        if (imageUri.startsWith("blob:")) {
            const blob = await fetch(imageUri).then((res) => res.blob());
            fileToUpload = new File([blob], `segment_${Date.now()}.jpg`, {
                type: blob.type || "image/jpeg",
            });
        } else {
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
            const res = await fetch(`${SEGMENT_API}/upload`, {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            console.log("Uploaded for segmentation:", json);
            setSegmentJobId(json["job_id"]);
            setIsSegmentReady(true);
            setIsLoading(false);
        } catch (err) {
            console.error("Segment upload error:", err);
            setIsLoading(false);
        }
    }

    function pollSegmentStatus(jobId) {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${SEGMENT_API}/status/${jobId}`);
                const json = await res.json();

                if (json.status === "ready") {
                    clearInterval(interval);
                    setIsLoading(false);
                    console.log("Segmentation complete!");
                    
                    // Fetch results
                    const numObjects = json.num_objects || 0;
                    const objects = [];
                    
                    for (let i = 0; i < numObjects; i++) {
                        try {
                            const croppedUrl = `${SEGMENT_API}/download/${jobId}/cropped_${i}.png`;
                            objects.push({
                                id: i,
                                croppedUri: croppedUrl,
                                position: new Animated.ValueXY({ 
                                    x: clickPoints[i][0], 
                                    y: clickPoints[i][1] 
                                }),
                                originalPos: { x: clickPoints[i][0], y: clickPoints[i][1] },
                                hasMoved: false
                            });
                        } catch (e) {
                            console.log(`Failed to fetch result ${i}`);
                        }
                    }
                    
                    setSegmentedObjects(objects);
                    
                    // Fetch full inpainted background
                    const bgUrl = `${SEGMENT_API}/download/${jobId}/full_inpainted.png`;
                    setInpaintedBackground(bgUrl);
                    
                } else if (json.status === "error") {
                    clearInterval(interval);
                    setIsLoading(false);
                    console.log("Segmentation error:", json.error);
                }
            } catch (e) {
                clearInterval(interval);
                setIsLoading(false);
            }
        }, 1000);
    }

    async function processSegmentation() {
        if (!segmentJobId || clickPoints.length === 0) {
            alert('Please click on objects to segment first!');
            return;
        }

        setIsLoading(true);
        setLoadingMessage('Segmenting objects...');

        try {
            const res = await fetch(`${SEGMENT_API}/segment?job_id=${segmentJobId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates_list: clickPoints })
            });

            const json = await res.json();
            console.log("Segmentation started:", json);
            pollSegmentStatus(segmentJobId);
        } catch (err) {
            console.error("Segmentation error:", err);
            setIsLoading(false);
        }
    }

    // Handle image click for segmentation
    function handleImageClick(event) {
        if (mode !== 'segment' || !isSegmentReady) return;
        if (segmentedObjects.length > 0) return; // Don't allow more clicks after segmentation

        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        setClickPoints(prev => [...prev, [Math.round(x), Math.round(y)]]);
        console.log('Click point added:', x, y);
    }

    // Create pan responder for each segmented object
    function createObjectPanResponder(objectId) {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setActiveObjectId(objectId);
            },
            onPanResponderMove: (evt, gesture) => {
                const object = segmentedObjects.find(obj => obj.id === objectId);
                if (!object) return;

                // Update position
                object.position.setValue({
                    x: gesture.moveX - bounds.x,
                    y: gesture.moveY - bounds.y
                });

                // Mark as moved
                if (!object.hasMoved) {
                    const newObjects = segmentedObjects.map(obj =>
                        obj.id === objectId ? { ...obj, hasMoved: true } : obj
                    );
                    setSegmentedObjects(newObjects);
                }
            },
            onPanResponderRelease: () => {
                setActiveObjectId(null);
            },
        });
    }

    // Pan responder for relight mode light dragging
    const lightPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => mode === 'relight',
        onPanResponderMove: (evt, gesture) => {
            if (mode !== 'relight') return;
            
            let newX = gesture.moveX - LIGHT_SIZE / 2;
            let newY = gesture.moveY - LIGHT_SIZE / 2;

            newX = Math.max(bounds.x, Math.min(newX, bounds.x + bounds.width - LIGHT_SIZE));
            newY = Math.max(bounds.y, Math.min(newY, bounds.y + bounds.height - LIGHT_SIZE));

            pos.setValue({ x: newX, y: newY });
        },
    });

    const insets = useSafeAreaInsets();

    // Determine which image to show
    const displayImage = mode === 'segment' && segmentedObjects.length > 0 
        ? inpaintedBackground 
        : (relitImage || selectedImage);

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#101010" }}>
            <View style={{ flex: 1, paddingBottom: insets.bottom + 80 }}>
                <TopBar />
                
                <MainImage
                    onLayout={(layout) => setBounds(layout)}
                    imageUri={displayImage}
                    onImagePress={handleImageClick}
                />
                
                {/* Show click points in segment mode (before processing) */}
                {mode === 'segment' && segmentedObjects.length === 0 && clickPoints.map((point, idx) => (
                    <View
                        key={idx}
                        style={{
                            position: 'absolute',
                            left: bounds.x + point[0] - 5,
                            top: bounds.y + point[1] - 5,
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: 'lime',
                            borderWidth: 2,
                            borderColor: 'white',
                            zIndex: 1000
                        }}
                    />
                ))}
                
                <SidePanel
                    onPickImage={(uri) => {
                        setSelectedImage(uri);
                        setRelitImage(null);
                        setRelightJobId(null);
                        setSegmentJobId(null);
                        setIsRelightReady(false);
                        setIsSegmentReady(false);
                        setClickPoints([]);
                        setSegmentedObjects([]);
                        setInpaintedBackground(null);
                    }}
                    onUploadRequest={() => {
                        if (!selectedImage) {
                            alert('Pick an image first.');
                            return;
                        }
                        if (mode === 'relight') {
                            uploadForRelighting(selectedImage);
                        } else {
                            uploadForSegmentation(selectedImage);
                        }
                    }}
                />
                
                {mode === 'relight' && (
                    <SlidersPanel
                        zValue={zValue}
                        onZChange={setZValue}
                        isReady={isRelightReady && !isLoading}
                    />
                )}
                
                {/* Info panel for segment mode */}
                {mode === 'segment' && (
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: '#fff', fontSize: 14 }}>
                            {segmentedObjects.length === 0 
                                ? `Click on objects to segment (${clickPoints.length} selected)` 
                                : 'Drag objects to move them'}
                        </Text>
                        {clickPoints.length > 0 && segmentedObjects.length === 0 && (
                            <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
                                Tap "Process" to segment selected objects
                            </Text>
                        )}
                    </View>
                )}
            </View>

            <BottomNav 
                onRelight={relightImage}
                mode={mode}
                onModeChange={(newMode) => {
                    setMode(newMode);
                    // Reset segment state when switching modes
                    if (newMode === 'relight') {
                        setClickPoints([]);
                        setSegmentedObjects([]);
                        setInpaintedBackground(null);
                    }
                }}
                onSegment={processSegmentation}
                canSegment={clickPoints.length > 0 && segmentedObjects.length === 0}
            />

            {/* Draggable light (only in relight mode) */}
            {mode === 'relight' && (
                <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <Animated.View
                        {...lightPanResponder.panHandlers}
                        style={{
                            position: 'absolute',
                            width: LIGHT_SIZE,
                            height: LIGHT_SIZE,
                            borderRadius: LIGHT_SIZE / 2,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            borderWidth: 2,
                            borderColor: '#fff',
                            zIndex: 9999,
                            transform: [{ translateX: pos.x }, { translateY: pos.y }],
                        }}
                    />
                </View>
            )}

            {/* Draggable segmented objects */}
            {mode === 'segment' && segmentedObjects.map((obj) => {
                const panResponder = createObjectPanResponder(obj.id);
                return (
                    <Animated.View
                        key={obj.id}
                        {...panResponder.panHandlers}
                        style={{
                            position: 'absolute',
                            left: bounds.x,
                            top: bounds.y,
                            zIndex: activeObjectId === obj.id ? 10000 : 9000 + obj.id,
                            transform: [
                                { translateX: obj.position.x },
                                { translateY: obj.position.y }
                            ],
                        }}
                    >
                        <Animated.Image
                            source={{ uri: obj.croppedUri }}
                            style={{
                                width: 100, // Will be auto-sized by the actual image
                                height: 100,
                                opacity: activeObjectId === obj.id ? 0.8 : 1,
                            }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                );
            })}

            {/* Loading overlay */}
            {isLoading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 99999,
                }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: 'white', marginTop: 12 }}>{loadingMessage}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}