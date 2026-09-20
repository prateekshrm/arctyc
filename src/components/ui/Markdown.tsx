import { Colors, FontSizes } from "@/constants/theme";
import { EnrichedMarkdownText } from "react-native-enriched-markdown";

interface MarkdownProps {
    markdown: string;
}

const Markdown = ({ markdown }: MarkdownProps) => {
    return (
        <EnrichedMarkdownText
            flavor="github"
            markdown={markdown}
            markdownStyle={{
                // ─────────────────────────────
                // HEADINGS
                // ─────────────────────────────

                h1: {
                    fontFamily: "DMSans-Bold",
                    fontSize: FontSizes.xxl,
                    lineHeight: FontSizes.xxl * 1.25,
                    marginTop: 12,
                    marginBottom: 8,
                },

                h2: {
                    fontFamily: "DMSans-Bold",
                    fontSize: FontSizes.xl,
                    lineHeight: FontSizes.xl * 1.3,
                    marginTop: 10,
                    marginBottom: 6,
                },

                h3: {
                    fontFamily: "DMSans-SemiBold",
                    fontSize: FontSizes.lg,
                    lineHeight: FontSizes.lg * 1.35,
                    marginTop: 8,
                    marginBottom: 5,
                },

                h4: {
                    fontFamily: "DMSans-SemiBold",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.4,
                    marginTop: 6,
                    marginBottom: 4,
                },

                h5: {
                    fontFamily: "DMSans-Medium",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.4,
                    marginTop: 6,
                    marginBottom: 4,
                },

                h6: {
                    fontFamily: "DMSans-Medium",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.4,
                    marginTop: 6,
                    marginBottom: 4,
                },

                // ─────────────────────────────
                // BODY
                // ─────────────────────────────

                paragraph: {
                    fontFamily: "DMSans-Regular",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.55,
                    marginBottom: 10,
                },

                // ─────────────────────────────
                // INLINE
                // ─────────────────────────────

                strong: {
                    fontFamily: "DMSans-SemiBold",
                },

                em: {
                    fontFamily: "DMSans-Regular",
                },

                link: {
                    fontFamily: "DMSans-Medium",
                    underline: true,
                },

                // Inline `code`
                code: {
                    fontFamily: "monospace",
                    fontSize: FontSizes.sm,
                },

                // ─────────────────────────────
                // LISTS
                // ─────────────────────────────

                list: {
                    fontFamily: "DMSans-Regular",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.5,
                    bulletSize: 5,
                    gapWidth: 8,
                    marginLeft: 20,
                    itemSpacing: 5,
                },

                // ─────────────────────────────
                // BLOCKQUOTE
                // ─────────────────────────────

                blockquote: {
                    fontFamily: "DMSans-Regular",
                    fontSize: FontSizes.md,
                    lineHeight: FontSizes.md * 1.5,
                    borderWidth: 3,
                    gapWidth: 10,
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 8,
                    marginBottom: 10,
                },

                // ─────────────────────────────
                // CODE BLOCK
                // ─────────────────────────────

                codeBlock: {
                    fontFamily: "monospace",
                    fontSize: FontSizes.sm,
                    lineHeight: FontSizes.sm * 1.5,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    marginTop: 8,
                    marginBottom: 12,
                    backgroundColor: Colors.black,
                },

                // ─────────────────────────────
                // TABLE
                // ─────────────────────────────

                table: {
                    fontFamily: "DMSans-Regular",
                    headerFontFamily: "DMSans-Bold",
                    fontSize: FontSizes.sm,
                    lineHeight: FontSizes.sm * 1.4,
                    marginTop: 8,
                    marginBottom: 12,
                },

                // ─────────────────────────────
                // IMAGES
                // ─────────────────────────────

                image: {
                    borderRadius: 8,
                    marginBottom: 12,
                },

                inlineImage: {
                    size: 20,
                },

                // ─────────────────────────────
                // TASK LIST
                // ─────────────────────────────

                taskList: {
                    checkboxSize: 16,
                },
            }}
        />
    );
};

export default Markdown;
