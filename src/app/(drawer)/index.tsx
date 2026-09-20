import Markdown from "@/components/ui/Markdown";
import { getActiveLanguageModel } from "@/services/model-manager";
import { useModelStore } from "@/stores/models.store";
import { Colors, FontSizes } from "@constants/theme";
import { streamText } from "ai";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export default function Index() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const activeModel = useModelStore((state) => state.activeModelId);

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

        // Capture the conversation BEFORE adding the empty
        // assistant message. This is the context we send to the model.
        const conversation = [...messages, userMessage];

        setMessages((current) => [...current, userMessage, assistantMessage]);

        setValue("");
        setInputHeight(24);
        setThinking(true);

        try {
            const { textStream } = streamText({
                model,

                // System instructions are persistent context.
                system: "You are Arctyc, a helpful AI assistant.",

                // Send the last 20 messages as context.
                messages: conversation.slice(-20).map((message) => ({
                    role: message.role,
                    content: message.content,
                })),
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

    const openModels = () => {
        router.push("/models");
    };

    const renderNoModelState = () => {
        return (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIcon}>
                    <RemixIcon
                        name="cpu-line"
                        size={FontSizes.xxl}
                        color={Colors.text}
                    />
                </View>

                <Text style={styles.emptyStateTitle}>
                    Choose a model to start
                </Text>

                <Text style={styles.emptyStateDescription}>
                    Browse the available models and choose one to start
                    chatting.
                </Text>

                <Pressable style={styles.modelsButton} onPress={openModels}>
                    <Text style={styles.modelsButtonText}>Browse Models</Text>
                </Pressable>
            </View>
        );
    };

    const renderEmptyChatState = () => {
        return (
            <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateIcon}>
                    <RemixIcon
                        name="sparkling-2-line"
                        size={FontSizes.xxl}
                        color={Colors.text}
                    />
                </View>

                <Text style={styles.emptyStateTitle}>Start a conversation</Text>

                <Text style={styles.emptyStateDescription}>
                    Write something below and your local AI will respond.
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style="dark" />

            {activeModel ? (
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
                    {messages.length === 0 && !thinking
                        ? renderEmptyChatState()
                        : messages.map((message) => {
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
                                          style={
                                              isUser
                                                  ? styles.userMessage
                                                  : styles.assistantMessage
                                          }
                                      >
                                          <Text
                                              style={[
                                                  styles.messageText,
                                                  isUser &&
                                                      styles.userMessageText,
                                              ]}
                                          >
                                              {isUser ? (
                                                  message.content
                                              ) : (
                                                  <Markdown
                                                      markdown={message.content}
                                                  />
                                              )}
                                          </Text>
                                      </View>
                                  </View>
                              );
                          })}

                    {thinking && (
                        <View
                            style={[
                                styles.messageRow,
                                styles.assistantMessageRow,
                            ]}
                        >
                            <View style={styles.thinkingMessage}>
                                <View style={styles.thinkingDots}>
                                    <View style={styles.thinkingDot} />
                                    <View style={styles.thinkingDot} />
                                    <View style={styles.thinkingDot} />
                                </View>

                                <Text style={styles.thinkingText}>
                                    Thinking
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            ) : (
                renderNoModelState()
            )}

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
                    colors={["transparent", Colors.surface]}
                    locations={[0, 0.2]}
                    pointerEvents="none"
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        multiline
                        placeholder={
                            activeModel
                                ? "Ask anything"
                                : "Download a model to start chatting"
                        }
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={setValue}
                        textAlignVertical="top"
                        returnKeyType="default"
                        editable={!!activeModel && !thinking}
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
                                (!value.trim() || !activeModel || thinking) &&
                                    styles.sendButtonDisabled,
                            ]}
                            disabled={!value.trim() || !activeModel || thinking}
                            onPress={sendMessage}
                        >
                            <RemixIcon
                                name="arrow-up-line"
                                size={FontSizes.xl}
                                color={Colors.buttonPrimaryText}
                            />
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
        backgroundColor: Colors.white,
    },

    container: {
        flex: 1,
        paddingHorizontal: 16,
    },

    contentContainer: {
        flexGrow: 1,
    },

    /*
     * Empty states
     */

    emptyStateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },

    emptyStateIcon: {
        width: 58,
        height: 58,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surfaceSecondary,
        marginBottom: 18,
    },

    emptyStateTitle: {
        fontSize: FontSizes.xl,
        fontFamily: "DMSans-SemiBold",
        color: Colors.text,
        textAlign: "center",
        marginBottom: 8,
    },

    emptyStateDescription: {
        maxWidth: 320,
        fontSize: FontSizes.md,
        fontFamily: "DMSans-Regular",
        lineHeight: 22,
        color: Colors.textMuted,
        textAlign: "center",
        marginBottom: 22,
    },

    modelsButton: {
        height: 46,
        paddingHorizontal: 18,
        borderRadius: 23,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.buttonPrimary,
    },

    modelsButtonText: {
        fontSize: FontSizes.md,
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonPrimaryText,
    },

    /*
     * Messages
     */

    messageRow: {
        width: "100%",
        marginBottom: 24,
    },

    userMessageRow: {
        alignItems: "flex-end",
    },

    assistantMessageRow: {
        alignItems: "stretch",
    },

    userMessage: {
        maxWidth: "85%",
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 6,
    },

    assistantMessage: {
        width: "100%",
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
        backgroundColor: Colors.textMuted,
    },

    thinkingText: {
        fontSize: FontSizes.sm,
        fontFamily: "DMSans-Regular",
        color: Colors.textMuted,
    },

    messageText: {
        fontSize: FontSizes.md,
        fontFamily: "DMSans-Regular",
        lineHeight: 23,
        color: Colors.text,
    },

    userMessageText: {
        color: Colors.textInverse,
    },

    /*
     * Input
     */

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
        backgroundColor: Colors.surfaceSecondary,
        borderRadius: 28,
    },

    input: {
        width: "100%",
        minHeight: 24,
        fontSize: FontSizes.md,
        fontFamily: "DMSans-Regular",
        lineHeight: 22,
        color: Colors.text,
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
        backgroundColor: Colors.buttonPrimary,
        alignItems: "center",
        justifyContent: "center",
    },

    sendButtonDisabled: {
        opacity: 0.35,
    },
});
