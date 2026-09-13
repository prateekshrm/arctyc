import { getActiveLanguageModel } from "@/services/model-manager";
import { streamText } from "ai";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ArrowUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
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
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export default function Index() {
    const insets = useSafeAreaInsets();

    const [value, setValue] = useState("");
    const [inputHeight, setInputHeight] = useState(24);

    const [messages, setMessages] = useState<Message[]>([]);
    const [thinking, setThinking] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollViewRef.current?.scrollToEnd({
                animated: true,
            });
        });
    }, [messages, thinking]);

    const sendMessage = async () => {
        const prompt = value.trim();

        if (!prompt || thinking) {
            return;
        }

        const model = getActiveLanguageModel();

        if (!model) {
            console.log("No active model");
            return;
        }

        console.log("User prompt:", prompt);

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            role: "user",
            content: prompt,
        };

        const assistantMessageId = `${Date.now()}-assistant`;

        const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "",
        };

        setMessages((current) => [...current, userMessage, assistantMessage]);

        setValue("");
        setThinking(true);

        try {
            const { textStream } = streamText({
                model,
                prompt,
            });

            let response = "";
            let hasStartedResponding = false;

            for await (const delta of textStream) {
                response += delta;

                if (!hasStartedResponding) {
                    hasStartedResponding = true;
                    setThinking(false);
                }

                setMessages((current) =>
                    current.map((message) =>
                        message.id === assistantMessageId
                            ? {
                                  ...message,
                                  content: response,
                              }
                            : message,
                    ),
                );
            }

            console.log("AI response:", response);
        } catch (error) {
            console.error("Failed to generate AI response:", error);

            setMessages((current) =>
                current.filter((message) => message.id !== assistantMessageId),
            );
        } finally {
            setThinking(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style="dark" />

            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={[
                    styles.contentContainer,
                    {
                        paddingTop: insets.top + 70,
                        paddingBottom: insets.bottom + 200,
                    },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((message) => {
                    const isUser = message.role === "user";

                    if (!isUser && !message.content && thinking) {
                        return null;
                    }

                    return (
                        <View
                            key={message.id}
                            style={[
                                styles.messageRow,
                                isUser
                                    ? styles.userMessageRow
                                    : styles.assistantMessageRow,
                            ]}
                        >
                            <View
                                style={[
                                    styles.message,
                                    isUser
                                        ? styles.userMessage
                                        : styles.assistantMessage,
                                ]}
                            >
                                {isUser ? (
                                    <Text
                                        style={[
                                            styles.messageText,
                                            styles.userMessageText,
                                        ]}
                                    >
                                        {message.content}
                                    </Text>
                                ) : (
                                    <Markdown
                                        style={{
                                            body: {
                                                fontSize: 16,
                                                lineHeight: 23,
                                                color: "black",
                                            },
                                            paragraph: {
                                                marginTop: 0,
                                                marginBottom: 8,
                                            },
                                        }}
                                    >
                                        {message.content}
                                    </Markdown>
                                )}
                            </View>
                        </View>
                    );
                })}

                {thinking && (
                    <View
                        style={[styles.messageRow, styles.assistantMessageRow]}
                    >
                        <View
                            style={[
                                styles.message,
                                styles.assistantMessage,
                                styles.thinkingMessage,
                            ]}
                        >
                            <View style={styles.thinkingDots}>
                                <View style={styles.thinkingDot} />
                                <View style={styles.thinkingDot} />
                                <View style={styles.thinkingDot} />
                            </View>

                            <Text style={styles.thinkingText}>Thinking</Text>
                        </View>
                    </View>
                )}
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
                        returnKeyType="default"
                        editable={!thinking}
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
                        <View style={styles.leftActions} />

                        <Pressable
                            style={[
                                styles.sendButton,
                                (!value.trim() || thinking) &&
                                    styles.sendButtonDisabled,
                            ]}
                            disabled={!value.trim() || thinking}
                            onPress={sendMessage}
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

    contentContainer: {
        flexGrow: 1,
    },

    messageRow: {
        width: "100%",
        marginBottom: 18,
    },

    userMessageRow: {
        alignItems: "flex-end",
    },

    assistantMessageRow: {
        alignItems: "flex-start",
    },

    message: {
        maxWidth: "85%",
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 20,
    },

    userMessage: {
        backgroundColor: "black",
        borderBottomRightRadius: 6,
    },

    assistantMessage: {
        backgroundColor: "#F2F2F2",
        borderBottomLeftRadius: 6,
    },

    thinkingMessage: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
    },

    thinkingDots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },

    thinkingDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#666",
    },

    thinkingText: {
        fontSize: 14,
        color: "#666",
    },

    messageText: {
        fontSize: 16,
        lineHeight: 23,
    },

    userMessageText: {
        color: "white",
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
        minHeight: 96,
        padding: 12,
        backgroundColor: "#F2F2F2",
        borderRadius: 28,
    },

    input: {
        width: "100%",
        minHeight: 24,
        fontSize: 16,
        lineHeight: 22,
        color: "black",
        paddingTop: 0,
        paddingBottom: 0,
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

    sendButtonDisabled: {
        opacity: 0.35,
    },
});
