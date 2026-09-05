import { LinearGradient } from "expo-linear-gradient";
import { ArrowUp } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
    const insets = useSafeAreaInsets();
    const [value, setValue] = useState("");

    const [inputHeight, setInputHeight] = useState(24);

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 150,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Text>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Error delectus, deserunt itaque iure, quo alias odio nemo
                    voluptas voluptatem quam praesentium similique ad non
                    laborum sunt tenetur reprehenderit temporibus maiores
                    exercitationem maxime quae? Corrupti quasi laudantium ad
                    perspiciatis incidunt libero quo dignissimos soluta
                    consequatur porro ullam rem id officia accusantium
                    reiciendis, impedit debitis ratione eum possimus hic
                    repudiandae. Cum beatae fugit nostrum asperiores
                    consequuntur illo atque maxime, eum ea. Rem corporis
                    doloremque molestias soluta deleniti non ipsum perspiciatis,
                    quisquam a laboriosam. Dignissimos fugiat sed, unde eligendi
                    nisi rem accusamus tempora dolores fugit alias voluptatibus
                    harum placeat molestiae doloribus. Voluptate, totam iste.
                    Omnis adipisci facere, provident placeat nam maiores nulla
                    deleniti ullam praesentium mollitia molestias rem cupiditate
                    veritatis accusantium voluptatum pariatur illum magnam
                    quidem? Iure enim sequi nihil provident labore. Consequuntur
                    excepturi laborum rerum similique quod natus, iure deserunt,
                    blanditiis iste voluptatibus repellat distinctio veritatis
                    numquam culpa quo! Maxime accusantium nemo id? Dignissimos
                    adipisci omnis sapiente rerum dolores. Inventore, aspernatur
                    dolor impedit vero praesentium nostrum modi consectetur
                    placeat dolorum repellat nesciunt quas eaque commodi itaque.
                    Deleniti iure facere assumenda error temporibus odit minima
                    veritatis. Beatae accusantium nihil consequuntur eius
                    necessitatibus corporis, est harum voluptas culpa blanditiis
                    consectetur at magni quibusdam dolores neque tempore hic
                    rerum, maiores expedita. Totam, facilis earum optio,
                    obcaecati modi sint quidem quibusdam accusantium recusandae
                    tenetur perspiciatis saepe pariatur cum. Similique laborum
                    numquam tempore. Soluta voluptatem fugit in aperiam,
                    expedita ullam labore magnam odio nostrum, nihil qui
                    corporis, reprehenderit dignissimos. Nostrum laudantium
                    quidem, laborum natus fugiat odio neque doloremque cum
                    officia, provident minima nulla tempora sequi? Numquam
                    reprehenderit doloribus tempore assumenda, in necessitatibus
                    fuga. Soluta esse sequi nam quis magnam cum impedit aliquam
                    asperiores maxime voluptate non optio, perferendis similique
                    commodi magni minus velit! Pariatur quasi nam perspiciatis
                    exercitationem eveniet modi soluta deserunt rerum ducimus
                    quaerat asperiores inventore obcaecati voluptatibus in non
                    animi vero amet fugit excepturi, eaque veritatis atque. Fuga
                    perferendis accusamus itaque autem et pariatur sed. Placeat
                    tempora aliquam commodi fugiat nostrum ipsum nihil, rem
                    amet, repellendus necessitatibus rerum porro, animi ipsam
                    ducimus? Soluta quas doloribus animi nihil esse. Saepe
                    voluptates et dignissimos quia corporis quidem eos obcaecati
                    architecto omnis ad illum quasi, tempore perferendis
                    doloribus a qui ea consectetur cumque expedita libero
                    dolorem minus iure minima. Quisquam, ab cum? Vero
                    accusantium error dignissimos quam magnam corrupti tempore
                    quidem consequuntur, deleniti soluta! Ratione praesentium
                    ducimus mollitia eligendi molestiae similique eveniet
                    voluptate adipisci dolor aspernatur assumenda dolore ea
                    harum molestias, nostrum nemo suscipit aut fugiat rem minima
                    dolores at deleniti illum! Quod qui repellendus magnam esse
                    omnis quidem nostrum tenetur delectus sunt enim iste error
                    excepturi alias debitis temporibus quia, rerum quos odio
                    laboriosam quibusdam? Dolor architecto vel id quasi
                    doloremque beatae vitae soluta magnam aut suscipit
                    laudantium doloribus iure, veniam recusandae, rerum mollitia
                    eligendi neque quisquam qui, accusantium aspernatur
                    cupiditate. Modi, distinctio nesciunt nulla vel excepturi
                    dolor commodi odio ratione deleniti maxime quod sapiente
                    totam voluptatem sequi eius voluptate tempora magnam non,
                    pariatur cupiditate corporis minima iure porro optio?
                    Numquam asperiores necessitatibus consequatur amet culpa.
                    Error!
                </Text>
            </ScrollView>

            <View
                style={[
                    styles.inputArea,
                    {
                        paddingBottom: insets.bottom + 12,
                    },
                ]}
            >
                <LinearGradient
                    style={styles.gradientMask}
                    colors={["transparent", "white"]}
                    locations={[0, 0.2]}
                    pointerEvents="none"
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        multiline
                        placeholder="Ask anything"
                        placeholderTextColor="#222"
                        value={value}
                        onChangeText={setValue}
                        textAlignVertical="top"
                        style={[
                            styles.input,
                            {
                                height: inputHeight,
                            },
                        ]}
                        onContentSizeChange={(event) => {
                            const contentHeight =
                                event.nativeEvent.contentSize.height;

                            setInputHeight(
                                Math.min(100, Math.max(24, contentHeight)),
                            );
                        }}
                    />

                    <View style={styles.actionsContainer}>
                        <View style={styles.leftActions}></View>

                        <Pressable
                            style={styles.sendButton}
                            onPress={() => {
                                console.log(`Sent ${value}`);
                                setValue("");
                                setInputHeight(24);
                            }}
                        >
                            <ArrowUp size={20} color="#fff" strokeWidth={2.5} />
                        </Pressable>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    inputArea: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingTop: 25,
    },
    gradientMask: {
        ...StyleSheet.absoluteFill,
    },
    inputContainer: {
        width: "100%",
        padding: 10,
        backgroundColor: "white",
        borderRadius: 28,
        borderWidth: 2,
    },
    input: {
        width: "100%",
        fontSize: 16,
    },
    actionsContainer: {
        height: 38,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    leftActions: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sendButton: {
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
    },
});
