function toContext(currentIntent) {
    return {
        intent: currentIntent.intent,
        confidence: currentIntent.confidence
    };
}
