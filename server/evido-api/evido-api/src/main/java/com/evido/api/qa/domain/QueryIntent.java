package com.evido.api.qa.domain;

public enum QueryIntent {
    NON_RAG,
    RAG_FACT,
    RAG_SUMMARY,
    RAG_COMPARE,
    FOLLOW_UP,
    META,
    ACTION,
    UNKNOWN
}