import { View, Image } from "react-native";

export default function MainImage({ imageUri, onLayout }) {
    const source = imageUri
        ? { uri: imageUri }
        : require("../../assets/images/halloween.png");

    return (
        <View
            onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                onLayout(layout);
            }}
            style={{
                backgroundColor: "#111",
                marginHorizontal: 16,
                borderRadius: 20,
                overflow: "hidden",
                padding: 16,
                justifyContent: "center",
                alignItems: "center",
                height: 400,
            }}
        >
            <Image
                source={source}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
        </View>
    );
}
