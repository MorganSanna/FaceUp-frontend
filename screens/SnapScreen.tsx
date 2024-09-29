import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Camera, CameraType, FlashMode } from "expo-camera/legacy";
import { useDispatch } from "react-redux";
import { addPhoto } from "../reducers/user";
import _FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from "@react-navigation/native";

const FontAwesome = _FontAwesome as React.ElementType;

export default function SnapScreen() {
	const dispatch = useDispatch();
	const isFocused = useIsFocused();

	const [hasPermission, setHasPermission] = useState(false);
	const [type, setType] = useState(CameraType.back);
	const [flashMode, setFlashMode] = useState(FlashMode.off);

	let cameraRef: any = useRef(null);

	useEffect(() => {
		(async () => {
			const result = await Camera.requestCameraPermissionsAsync();
			if (result) {
				console.log(result)
				setHasPermission(result.status === "granted");
			}
		})();
	}, []);

	const takePicture = async () => {
		const photo = await cameraRef.takePictureAsync({ quality: 0.3 });
		if (photo) {
			console.log(photo)
			const formData = new FormData();
			formData.append('photoFromFront', {
				uri: photo.uri,
				name: 'photo.jpg',
				type: 'image/jpeg'
			} as any);
			const reponse = await fetch('http://10.0.2.133:3000/upload', {
				method: 'POST',
				body: formData
			}).then((response) => response.json())
				.then((data) => {
					console.log(data)
					dispatch(addPhoto(data.url))
				})
			// {
			// 	const uri = photo.uri;
			// 	dispatch(addPhoto(uri));
			// }
		}
	};

	if (!hasPermission || !isFocused) {
		return <View />;
	}

	return (
		<Camera type={type} flashMode={flashMode} ref={(ref: any) => (cameraRef = ref)} style={styles.camera}>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)} style={styles.button}>
					<FontAwesome name="rotate-right" size={25} color="#ffffff" />
				</TouchableOpacity>

				<TouchableOpacity onPress={() => setFlashMode(flashMode === FlashMode.off ? FlashMode.torch : FlashMode.off)} style={styles.button}>
					<FontAwesome name="flash" size={25} color={flashMode === FlashMode.off ? "#ffffff" : "#e8be4b"} />
				</TouchableOpacity>
			</View>

			<View style={styles.snapContainer}>
				<TouchableOpacity onPress={() => cameraRef && takePicture()}>
					<FontAwesome name="circle-thin" size={95} color="#ffffff" />
				</TouchableOpacity>
			</View>
		</Camera>
	);
}

const styles = StyleSheet.create({
	camera: {
		flex: 1,
	},
	buttonsContainer: {
		flex: 0.1,
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		paddingTop: 20,
		paddingLeft: 20,
		paddingRight: 20,
	},
	button: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		borderRadius: 50,
	},
	snapContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-end",
		paddingBottom: 25,
	},
});
