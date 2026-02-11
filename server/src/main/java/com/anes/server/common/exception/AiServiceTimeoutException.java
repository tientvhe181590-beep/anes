package com.anes.server.common.exception;

public class AiServiceTimeoutException extends RuntimeException {

    public AiServiceTimeoutException(String message) {
        super(message);
    }
}
