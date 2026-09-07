import { StyleSheet, Text, View } from "react-native";

const Models = () => {
    return (
        <View style={styles.container}>
            <Text>Models</Text>
        </View>
    );
};

export default Models;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
