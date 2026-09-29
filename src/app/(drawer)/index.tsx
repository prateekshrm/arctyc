import Markdown from "@/components/ui/Markdown";
import {
    getMessages,
    saveMessage,
    updateMessageContent,
} from "@/services/chat-db";
import { getActiveLanguageModel } from "@/services/model-manager";
import { useChatStore } from "@/stores/chat.store";
import { useDialogStore } from "@/stores/dialog.store";
import { useLayoutStore } from "@/stores/layout.store";
import { useModelStore } from "@/stores/models.store";
import { Colors, FontSizes } from "@constants/theme";
import { streamText } from "ai";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    View,
} from "react-native";
import RemixIcon from "react-native-remix-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    status?: "generating" | "complete" | "stopped" | "error";
};

export default function Index() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const showDialog = useDialogStore((state) => state.showDialog);

    const measuredHeaderHeight = useLayoutStore((state) => state.headerHeight);
    const headerHeight =
        measuredHeaderHeight > 0 ? measuredHeaderHeight : insets.top + 64;

    const activeModel = useModelStore((state) => state.activeModelId);

    const chatOptionsOpen = useLayoutStore((state) => state.chatOptionsOpen);
    const setChatOptionsOpen = useLayoutStore(
        (state) => state.setChatOptionsOpen,
    );

    const activeChatId = useChatStore((state) => state.activeChatId);
    const createChat = useChatStore((state) => state.createChat);
    const loadChats = useChatStore((state) => state.loadChats);
    const deleteChat = useChatStore((state) => state.deleteChat);

    const [value, setValue] = useState("");
    const [inputHeight, setInputHeight] = useState(56);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [thinking, setThinking] = useState(false);
    const [generating, setGenerating] = useState(false);

    const abortControllerRef = useRef<AbortController | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const loadedChatIdRef = useRef<string | null>(null);

    // Load messages when active chat changes
    useEffect(() => {
        if (loadedChatIdRef.current === activeChatId) {
            return;
        }
        setValue("");
        chatOptionsOpen && setChatOptionsOpen(false);
        loadedChatIdRef.current = activeChatId;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (!activeChatId) {
            setMessages([]);
            return;
        }

        let isMounted = true;
        getMessages(activeChatId)
            .then((dbMsgs) => {
                if (isMounted) {
                    setMessages(
                        dbMsgs.map((m) => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            status: "complete",
                        })),
                    );
                }
            })
            .catch((err) => console.error("Failed to load messages:", err));

        return () => {
            isMounted = false;
        };
    }, [activeChatId]);

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollViewRef.current?.scrollToEnd({
                animated: true,
            });
        });
    }, [messages, thinking]);

    useEffect(() => {
        const showEvent =
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent =
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSubscription = Keyboard.addListener(showEvent, () => {
            setIsKeyboardVisible(true);
        });

        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setIsKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const sendMessage = async () => {
        const prompt = value.trim();

        if (!prompt || thinking || generating) {
            return;
        }

        const model = getActiveLanguageModel();

        if (!model) {
            console.log("No active model");
            return;
        }

        console.log("User prompt:", prompt);

        // Ensure active chat exists or create one
        let currentChatId = activeChatId;
        if (!currentChatId) {
            const newChatId = `chat_${Date.now()}`;
            const title =
                prompt.length > 35 ? `${prompt.slice(0, 35)}...` : prompt;
            loadedChatIdRef.current = newChatId;
            await createChat(newChatId, title);
            currentChatId = newChatId;
        }

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
            status: "generating",
        };

        // Persist user and placeholder assistant message
        await saveMessage(currentChatId, {
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content,
        });

        await saveMessage(currentChatId, {
            id: assistantMessageId,
            role: "assistant",
            content: "",
        });

        // Capture the conversation before adding the empty assistant
        // message. This is the context sent to the model.
        const conversation = [...messages, userMessage];

        setMessages((current) => [...current, userMessage, assistantMessage]);

        setValue("");
        setInputHeight(56);

        setThinking(true);
        setGenerating(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const result = streamText({
                model,

                system: "You are Arctyc, a helpful AI assistant.",

                messages: conversation.slice(-20).map((message) => ({
                    role: message.role,
                    content: message.content,
                })),

                abortSignal: controller.signal,

                telemetry: {
                    isEnabled: false,
                },
            });

            let response = "";
            let hasStartedResponding = false;

            try {
                for await (const delta of result.textStream) {
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
                                      status: "generating",
                                  }
                                : message,
                        ),
                    );
                }

                // Stream finished normally.
                setMessages((current) =>
                    current.map((message) =>
                        message.id === assistantMessageId
                            ? {
                                  ...message,
                                  content: response,
                                  status: "complete",
                              }
                            : message,
                    ),
                );

                await updateMessageContent(assistantMessageId, response);
                loadChats();

                console.log("AI response:", response);
            } catch (error) {
                // Abort is expected when the user presses Stop.
                if (controller.signal.aborted) {
                    console.log("Generation stopped by user.");

                    // Keep the partial response.
                    setMessages((current) =>
                        current.map((message) =>
                            message.id === assistantMessageId
                                ? {
                                      ...message,
                                      status: "stopped",
                                  }
                                : message,
                        ),
                    );

                    if (response) {
                        await updateMessageContent(
                            assistantMessageId,
                            response,
                        );
                    }
                    loadChats();

                    return;
                }

                console.error("Stream error:", error);

                if (response) {
                    await updateMessageContent(assistantMessageId, response);
                }
                loadChats();

                // Unexpected generation error.
                setMessages((current) =>
                    current.map((message) =>
                        message.id === assistantMessageId
                            ? {
                                  ...message,
                                  status: "error",
                              }
                            : message,
                    ),
                );
            }
        } finally {
            setThinking(false);
            setGenerating(false);

            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    };

    const stopGeneration = () => {
        abortControllerRef.current?.abort();
    };

    const openModels = () => {
        router.push("/models");
    };

    const handleShareChat = async () => {
        let conversation = messages.map(({ role, content }) => ({
            role,
            content,
        }));
        try {
            await Share.share({
                message: JSON.stringify(conversation),
            });
        } catch {
            // User dismissed the share sheet; nothing to do.
        }
    };

    const handleDeleteChat = async () => {
        showDialog({
            title: "Delete Chat",
            message: "Are you sure you want to delete this chat?",
            confirmButton: {
                label: "Delete",
                variant: "destructive",
                onPress: () => deleteChat(activeChatId as string),
            },
            dismissButton: {
                label: "Cancel",
            },
        });
    };

    const handleCopyMessage = async (message: string) => {
        await Clipboard.setStringAsync(message);
        ToastAndroid.show("Copied!", ToastAndroid.SHORT);
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
            keyboardVerticalOffset={headerHeight}
        >
            <StatusBar style="light" />

            {activeChatId && chatOptionsOpen ? (
                <View style={styles.chatOptions}>
                    <Pressable
                        style={styles.chatOption}
                        onPress={() => handleShareChat()}
                    >
                        <RemixIcon
                            name="share-2-line"
                            size={FontSizes.md}
                            color={Colors.white}
                        />
                        <Text style={styles.chatOptionText}>Share</Text>
                    </Pressable>
                    <Pressable
                        style={styles.chatOption}
                        onPress={() => handleDeleteChat()}
                    >
                        <RemixIcon
                            name="delete-bin-line"
                            size={FontSizes.md}
                            color={Colors.white}
                        />
                        <Text style={styles.chatOptionText}>Delete</Text>
                    </Pressable>
                </View>
            ) : null}

            <View style={styles.container}>
                {/* Chat */}
                {activeModel || activeChatId ? (
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.chatContainer}
                        contentContainerStyle={styles.chatContentContainer}
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
                                                      markdown={message.content}
                                                  />
                                              )}
                                          </View>
                                          <Pressable
                                              style={[
                                                  styles.messageCopyButton,
                                                  {
                                                      alignSelf: isUser
                                                          ? "flex-end"
                                                          : "flex-start",
                                                  },
                                              ]}
                                              onPress={() =>
                                                  handleCopyMessage(
                                                      message.content,
                                                  )
                                              }
                                          >
                                              <RemixIcon
                                                  name="file-copy-line"
                                                  size={FontSizes.sm}
                                                  color={Colors.textSecondary}
                                              />
                                          </Pressable>
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

                {/* Input */}
                <View
                    style={[
                        styles.inputArea,
                        {
                            paddingBottom: isKeyboardVisible
                                ? 16
                                : insets.bottom + 16,
                        },
                    ]}
                >
                    <View style={styles.inputWrapper}>
                        <TextInput
                            multiline
                            placeholder={
                                activeModel
                                    ? "Ask anything"
                                    : "Load a model to start chatting"
                            }
                            placeholderTextColor={Colors.textMuted}
                            value={value}
                            onChangeText={setValue}
                            // textAlignVertical="top"
                            returnKeyType="default"
                            editable={!!activeModel && !generating}
                            style={[
                                styles.input,
                                {
                                    height: Math.max(56, inputHeight),
                                },
                            ]}
                            onContentSizeChange={(event) => {
                                const contentHeight =
                                    event.nativeEvent.contentSize.height;

                                setInputHeight(
                                    Math.min(152, Math.max(56, contentHeight)),
                                );
                            }}
                        />

                        <Pressable
                            style={[
                                styles.sendButton,
                                !generating &&
                                    (!value.trim() || !activeModel) &&
                                    styles.sendButtonDisabled,
                            ]}
                            onPress={generating ? stopGeneration : sendMessage}
                            disabled={
                                !generating && (!value.trim() || !activeModel)
                            }
                        >
                            <RemixIcon
                                name={
                                    generating ? "stop-fill" : "arrow-up-line"
                                }
                                size={FontSizes.xl}
                                color={Colors.text}
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
        backgroundColor: Colors.primary,
    },

    chatOptions: {
        flexDirection: "row",
        gap: 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    chatOption: {
        backgroundColor: Colors.secondary,
        flex: 1,
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 999,
    },
    chatOptionText: {
        color: Colors.white,
        fontSize: FontSizes.md,
        fontFamily: "DMSans-Medium",
    },

    container: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderTopRightRadius: 32,
        borderTopLeftRadius: 32,
        borderWidth: 16,
        borderBottomWidth: 0,
        borderColor: Colors.surface,
        overflow: "hidden",
    },

    chatContainer: {
        flex: 1,
    },

    chatContentContainer: {
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
        backgroundColor: Colors.buttonSecondary,
    },

    modelsButtonText: {
        fontSize: FontSizes.md,
        fontFamily: "DMSans-SemiBold",
        color: Colors.buttonSecondaryText,
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
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.primary,
    },

    assistantMessage: {
        width: "100%",
    },

    messageCopyButton: {
        marginTop: 12,
        backgroundColor: Colors.surfaceSecondary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        gap: 4,
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
        lineHeight: 22,
        color: Colors.text,
    },

    userMessageText: {
        color: Colors.textInverse,
    },

    /*
     * Input
     */

    inputArea: {
        width: "100%",
        flexShrink: 0,
        backgroundColor: Colors.surface,
        paddingTop: 16,
    },

    inputWrapper: {
        width: "100%",
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
    },

    input: {
        width: "100%",
        minHeight: 56,
        maxHeight: 152,
        fontSize: FontSizes.md,
        fontFamily: "DMSans-Regular",
        lineHeight: 24,
        color: Colors.textInverse,
        paddingVertical: 16,
        paddingLeft: 20,
        paddingRight: 56,
        backgroundColor: Colors.primary,
    },

    sendButton: {
        position: "absolute",
        right: 10,
        bottom: 10,
        height: 36,
        width: 36,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },

    sendButtonDisabled: {
        opacity: 0.35,
    },
});
