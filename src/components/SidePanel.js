import { View, Image, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import UpIcon from "../../assets/icons/up.svg";

export default function SidePanel({ onPickImage }) {
    async function pickImage() {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission required to access photos.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            onPickImage(result.assets[0].uri);
        }
    }

    return (
        <View
            style={{
                position: "absolute",
                right: 20,
                top: 260, // adjust for image height
                alignItems: "center",
                zIndex: 10,
            }}
        >
            <TouchableOpacity
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#2A2A2A", // dark circle behind arrow
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <UpIcon width={40} height={40} />
            </TouchableOpacity>

            <Image
                source={require("../../assets/images/thumb.png")}
                style={{
                    width: 60,
                    height: 80,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#3b82f6",
                }}
            />

            <View
                style={{
                    height: 4,
                    width: 60,
                    backgroundColor: "#666",
                    borderRadius: 2,
                    marginTop: 4,
                }}
            />

            <TouchableOpacity
                onPress={pickImage}
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 12,
                }}
            >
                <Text style={{ fontSize: 40, lineHeight: 40 }}>+</Text>
            </TouchableOpacity>
        </View>
    );
}
