// 添加文本高亮组件
export const TextWithHighlights = ({ text }: { text: string }) => {
    const regex = /\*\*(.*?)\*\*/g;
    let parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // 添加普通文本
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        // 添加高亮文本
        parts.push(
            <span key={match.index} className="text-red-500 font-medium">
                {match[1]}
            </span>
        );
        lastIndex = match.index + match[0].length;
    }
    // 添加剩余的普通文本
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
};