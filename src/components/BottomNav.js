import { View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LightningIcon from "../../assets/icons/lightning.svg";

export default function BottomNav({ onRelight, mode, onModeChange, onSegment, canSegment }) {
    return (
        <SafeAreaView
            edges={["bottom"]}
            style={{
                backgroundColor: "#0d0d0d",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderTopWidth: 1,
                    borderTopColor: "#333",
                }}
            >
                {/* Relight Mode Button */}
                <TouchableOpacity 
                    onPress={() => onModeChange('relight')} 
                    style={{ 
                        alignItems: "center",
                        opacity: mode === 'relight' ? 1 : 0.5
                    }}
                >
                    <LightningIcon width={24} height={24} />
                    <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                        Relight
                    </Text>
                </TouchableOpacity>

                {/* Segment Mode Button */}
                <TouchableOpacity 
                    onPress={() => onModeChange('segment')} 
                    style={{ 
                        alignItems: "center",
                        opacity: mode === 'segment' ? 1 : 0.5
                    }}
                >
                    <View style={{
                        width: 24,
                        height: 24,
                        borderWidth: 2,
                        borderColor: '#fff',
                        borderRadius: 4,
                        borderStyle: 'dashed'
                    }} />
                    <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                        Segment
                    </Text>
                </TouchableOpacity>

                {/* Action Button (context-aware) */}
                {mode === 'relight' && (
                    <TouchableOpacity 
                        onPress={onRelight} 
                        style={{ 
                            alignItems: "center",
                            backgroundColor: '#3b82f6',
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: '600' }}>
                            Apply
                        </Text>
                    </TouchableOpacity>
                )}

                {mode === 'segment' && canSegment && (
                    <TouchableOpacity 
                        onPress={onSegment} 
                        style={{ 
                            alignItems: "center",
                            backgroundColor: '#9b59b6',
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            borderRadius: 8
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: '600' }}>
                            Process
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}